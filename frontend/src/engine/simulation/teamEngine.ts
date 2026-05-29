import { calcDamageByCategories, DAMAGE_CATEGORIES, type CategoryBreakdown } from '../formulas/damageCategories'
import { collectCrit, piecewiseLinear, ARTS_INTENSITY_CURVE } from '../formulas/effectResolver'
import {
  SkillConfig, RotationStep, SimulationConfig, TeamMemberConfig, TeamSimulationResult,
  ActionRow, SimulateRowsConfig,
  AUTO_ATTACK_INTERVAL, AUTO_ATTACK_ENERGY, MAX_ENERGY,
} from './types'
import type { Buff } from '../types/buff'
import { GAIN_CATEGORY_TO_DAMAGE_CAT } from '../formulas/stats'

interface MemberState {
  name: string
  attack: number
  skillMap: Map<string, SkillConfig>
  buffs: Buff[]
  rotation: RotationStep[]
  rotIdx: number
  energy: number
  cooldowns: Map<string, number>
  totalDamage: number
  totalCasts: number
  nextAutoTime: number
  comboCount: number
  lastComboTime: number
  skillBreakdown: Record<string, { count: number; totalDamage: number }>
  categoryBreakdown: Record<string, number>
}

const COMBO_WINDOW = 3

const 连击增伤Map: Record<number, { skill: number; ultimate: number }> = {
  1: { skill: 0.3, ultimate: 0.2 },
  2: { skill: 0.45, ultimate: 0.3 },
  3: { skill: 0.6, ultimate: 0.4 },
  4: { skill: 0.75, ultimate: 0.5 },
}

function getComboMultiplier(level: number, type: string): number {
  const entry = 连击增伤Map[level]
  if (!entry) return 1
  const bonus = type === 'ultimate' ? entry.ultimate : entry.skill
  return 1 + bonus
}

function updateCombo(state: MemberState, now: number) {
  if (now - state.lastComboTime <= COMBO_WINDOW) {
    state.comboCount = Math.min(state.comboCount + 1, 4)
  } else {
    state.comboCount = 1
  }
  state.lastComboTime = now
}

function fireDamage(
  member: MemberState, skill: SkillConfig, t: number,
  config: SimulationConfig, events: any[],
) {
  updateCombo(member, t)

  const buffContext = {
    skillType: skill.type,
    element: skill.damageType,
    statTotals: { strength: 0, agility: 0, intellect: 0, will: 0 },
  }

  const baseDamage = member.attack * skill.multiplier
  const { finalDamage: catDamage, breakdown } = calcDamageByCategories(
    baseDamage,
    member.buffs,
    DAMAGE_CATEGORIES,
    buffContext,
  )

  const crit = collectCrit(member.buffs, buffContext, config.critRate, config.critDamage)

  const defMult = skill.damageType === 'true' ? 1 : 100 / (config.targetDef + 100)
  const staggerMult = config.isStaggered ? (config.staggerMultiplier ?? 1.3) : 1
  const comboMult = getComboMultiplier(member.comboCount, skill.type)

  const finalDamage = catDamage * defMult * crit.expectedMultiplier * staggerMult * comboMult

  const total = finalDamage * config.targetCount
  member.totalDamage += total

  if (!member.skillBreakdown[skill.id]) {
    member.skillBreakdown[skill.id] = { count: 0, totalDamage: 0 }
  }
  member.skillBreakdown[skill.id].count++
  member.skillBreakdown[skill.id].totalDamage += total

  // Accumulate category breakdown
  for (const [catKey, entry] of Object.entries(breakdown)) {
    member.categoryBreakdown[catKey] = (member.categoryBreakdown[catKey] ?? 0) + entry.finalTotal
  }

  if (!member.skillBreakdown[skill.id].totalDamage) {
    member.totalCasts++
  }
  member.totalCasts++

  events.push({
    time: t, char: member.name, type: 'damage', skillName: skill.name,
    damage: total, breakdown, crit, defMult, staggerMult, comboMult,
  })
}

function fireAutoAttack(member: MemberState, t: number, config: SimulationConfig, events: any[]) {
  const auto: SkillConfig = {
    id: 'auto', name: '普攻', type: 'normal', damageType: 'physical',
    multiplier: 0.5, cooldown: 0, energyCost: 0, castTime: 0,
  }
  fireDamage(member, auto, t, config, events)
  events.push({ time: t, char: member.name, type: 'auto_attack' })
  member.energy = Math.min(MAX_ENERGY, member.energy + AUTO_ATTACK_ENERGY)
  events.push({ time: t, char: member.name, type: 'energy_change', energy: member.energy })
}

function simulateMember(
  member: MemberState, config: SimulationConfig,
): void {
  let time = 0
  let stuckCount = 0
  const maxStuck = member.rotation.length * 2

  while (time < config.duration) {
    if (member.nextAutoTime <= time + 0.05) {
      fireAutoAttack(member, member.nextAutoTime, config, [])
      member.nextAutoTime += AUTO_ATTACK_INTERVAL
    }

    const step = member.rotation[member.rotIdx % member.rotation.length]
    if (!step) { time = config.duration; break }

    const skill = member.skillMap.get(step.skillId)
    if (!skill) {
      member.rotIdx++
      stuckCount++
      if (stuckCount > maxStuck) { time = config.duration; break }
      continue
    }

    stuckCount = 0
    const cdReady = !member.cooldowns.has(skill.id) || member.cooldowns.get(skill.id)! <= time
    const energyOk = member.energy >= skill.energyCost

    if (cdReady && energyOk) {
      member.energy -= skill.energyCost
      member.cooldowns.set(skill.id, time + skill.castTime + skill.cooldown)
      fireDamage(member, skill, time + skill.castTime, config, [])
      time += skill.castTime
      member.rotIdx++
    } else {
      time += 0.1
    }
  }
}

export function runTeamSimulation(
  members: TeamMemberConfig[],
  config: SimulationConfig,
): TeamSimulationResult {
  const states: MemberState[] = members.map(m => ({
    name: m.name,
    attack: m.attack,
    skillMap: new Map(m.skills.map(s => [s.id, s])),
    buffs: m.buffs ?? [],
    rotation: m.rotation,
    rotIdx: 0,
    energy: MAX_ENERGY,
    cooldowns: new Map(),
    totalDamage: 0,
    totalCasts: 0,
    nextAutoTime: AUTO_ATTACK_INTERVAL,
    comboCount: 0,
    lastComboTime: 0,
    skillBreakdown: {},
    categoryBreakdown: {},
  }))

  for (const state of states) {
    simulateMember(state, config)
  }

  const memberResults = states.map(s => {
    const effectiveDuration = config.duration
    return {
      name: s.name,
      totalDamage: s.totalDamage,
      dps: s.totalDamage / effectiveDuration,
      totalCasts: s.totalCasts,
      skillBreakdown: s.skillBreakdown,
      categoryBreakdown: s.categoryBreakdown,
    }
  })

  const teamTotalDamage = memberResults.reduce((sum, m) => sum + m.totalDamage, 0)
  const teamCategoryBreakdown: Record<string, number> = {}
  for (const mr of memberResults) {
    if (mr.categoryBreakdown) {
      for (const [k, v] of Object.entries(mr.categoryBreakdown)) {
        teamCategoryBreakdown[k] = (teamCategoryBreakdown[k] ?? 0) + v
      }
    }
  }

  return {
    members: memberResults,
    teamTotalDamage,
    teamDps: teamTotalDamage / config.duration,
    teamCategoryBreakdown,
  }
}

const 连击增伤Map_rows: Record<number, { skill: number; ultimate: number }> = {
  1: { skill: 0.3, ultimate: 0.2 },
  2: { skill: 0.45, ultimate: 0.3 },
  3: { skill: 0.6, ultimate: 0.4 },
  4: { skill: 0.75, ultimate: 0.5 },
}

function getComboMultRows(level: number, type: string): number {
  const entry = 连击增伤Map_rows[level]
  if (!entry) return 1
  const bonus = type === 'ultimate' ? entry.ultimate : entry.skill
  return 1 + bonus
}

export function simulateRows(config: SimulateRowsConfig): TeamSimulationResult {
  const { rows, charStats, skillMap, gainMap, enemyMap, targetDef, targetResistance, resistanceIgnore } = config
  const charMap = new Map<string, { totalDamage: number; totalCasts: number; totalSpUsed: number; skillBreakdown: Record<string, { count: number; totalDamage: number }>; categoryBreakdown: Record<string, number> }>()

  let comboCount = 0
  let lastComboTime = -10
  const COMBO_WINDOW = 3

  for (const row of rows) {
    const stats = charStats[row.charId]
    if (!stats) continue

    if (row.time - lastComboTime <= COMBO_WINDOW) {
      comboCount = Math.min(comboCount + 1, 4)
    } else {
      comboCount = 1
    }
    lastComboTime = row.time

    if (!charMap.has(row.charId)) {
      charMap.set(row.charId, { totalDamage: 0, totalCasts: 0, totalSpUsed: 0, skillBreakdown: {}, categoryBreakdown: {}, elementDamage: {}, skillTypeDamage: {} })
    }
    const cm = charMap.get(row.charId)!

    const skill = skillMap[row.skillId]
    if (!skill) continue
    cm.totalCasts++
    cm.totalSpUsed += row.spCost

    const buffs: Buff[] = []
    for (const gid of [...row.selfBuffs, ...row.enemyBuffs]) {
      if (!gid) continue
      const g = gainMap[gid]
      if (!g) continue
      const cat = GAIN_CATEGORY_TO_DAMAGE_CAT[g.effectCategory ?? '']
      if (cat && g.effectValue != null) {
        buffs.push({
          id: g.id,
          name: g.name ?? g.id,
          source: 'gain',
          buffType: 'permanent',
          effectCategory: g.effectCategory ?? '', effectType: g.effectType ?? '',
          effectValue: g.effectValue, stackRule: 'add_same', targetScope: 'self',
          effects: [{ category: cat, value: g.valueType === 'percentage' ? g.effectValue : g.effectValue }],
        })
      }
    }

    const context = {
      skillType: skill.type,
      element: skill.damageType,
      statTotals: { strength: stats.str, agility: stats.agi, intellect: stats.int, will: stats.wil },
    }

    const baseDamage = stats.attack * skill.multiplier
    const { finalDamage: catDamage, breakdown } = calcDamageByCategories(baseDamage, buffs, DAMAGE_CATEGORIES, context)
    const crit = collectCrit(buffs, context, stats.critRate, stats.critDamage)
    const ep = enemyMap?.[row.targetEnemyId ?? ''] ?? { def: targetDef, resistance: targetResistance }
    const defMult = skill.damageType === 'true' ? 1 : 100 / (ep.def + 100)
    const resMult = 1 - ep.resistance / 100 + resistanceIgnore / 100
    const comboMult = getComboMultRows(comboCount, skill.type)

    const finalDamage = catDamage * crit.expectedMultiplier * defMult * resMult * comboMult * row.targetCount
    row.damage = finalDamage
    cm.totalDamage += finalDamage

    const elem = row.damageType || 'physical'
    cm.elementDamage[elem] = (cm.elementDamage[elem] || 0) + finalDamage

    const st = row.skillType || 'other'
    cm.skillTypeDamage[st] = (cm.skillTypeDamage[st] || 0) + finalDamage

    if (!cm.skillBreakdown[row.skillId]) {
      cm.skillBreakdown[row.skillId] = { count: 0, totalDamage: 0 }
    }
    cm.skillBreakdown[row.skillId].count++
    cm.skillBreakdown[row.skillId].totalDamage += finalDamage

    for (const [ck, entry] of Object.entries(breakdown)) {
      cm.categoryBreakdown[ck] = (cm.categoryBreakdown[ck] ?? 0) + entry.finalTotal
    }
  }

  const memberResults = Array.from(charMap.entries()).map(([charId, m]) => {
    const effectiveDuration = rows.length > 0 ? Math.max(...rows.map(r => r.time)) + 1 : 30
    const charRows = rows.filter(r => r.charId === charId)
    return {
      name: charId,
      totalDamage: m.totalDamage,
      dps: m.totalDamage / effectiveDuration,
      totalCasts: m.totalCasts,
      totalSpUsed: m.totalSpUsed,
      actionRows: charRows,
      skillBreakdown: m.skillBreakdown,
      categoryBreakdown: m.categoryBreakdown,
      elementDamage: m.elementDamage,
      skillTypeDamage: m.skillTypeDamage,
    }
  })

  const teamTotalDamage = memberResults.reduce((s, m) => s + m.totalDamage, 0)
  const teamDuration = rows.length > 0 ? Math.max(...rows.map(r => r.time)) + 1 : 30
  const teamCategoryBreakdown: Record<string, number> = {}
  const teamElementDamage: Record<string, number> = {}
  const teamSkillTypeDamage: Record<string, number> = {}
  for (const mr of memberResults) {
    if (mr.categoryBreakdown) {
      for (const [k, v] of Object.entries(mr.categoryBreakdown)) {
        teamCategoryBreakdown[k] = (teamCategoryBreakdown[k] ?? 0) + v
      }
    }
    if (mr.elementDamage) {
      for (const [k, v] of Object.entries(mr.elementDamage)) {
        teamElementDamage[k] = (teamElementDamage[k] ?? 0) + v
      }
    }
    if (mr.skillTypeDamage) {
      for (const [k, v] of Object.entries(mr.skillTypeDamage)) {
        teamSkillTypeDamage[k] = (teamSkillTypeDamage[k] ?? 0) + v
      }
    }
  }

  return {
    members: memberResults,
    teamTotalDamage,
    teamDps: teamTotalDamage / teamDuration,
    teamCategoryBreakdown,
    teamElementDamage,
    teamSkillTypeDamage,
  }
}
