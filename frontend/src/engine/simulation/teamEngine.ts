import { calcDamage } from '../formulas/damage'
import {
  SkillConfig, RotationStep, SimulationConfig, TeamMemberConfig, TeamSimulationResult,
  AUTO_ATTACK_INTERVAL, AUTO_ATTACK_ENERGY, MAX_ENERGY,
} from './types'

interface MemberState {
  name: string
  attack: number
  skillMap: Map<string, SkillConfig>
  rotation: RotationStep[]
  rotIdx: number
  energy: number
  cooldowns: Map<string, number>
  totalDamage: number
  totalCasts: number
  nextAutoTime: number
  skillBreakdown: Record<string, { count: number; totalDamage: number }>
}

function fireDamage(
  member: MemberState, skill: SkillConfig, t: number,
  config: SimulationConfig, events: any[],
) {
  const dmg = calcDamage({
    attack: member.attack,
    skillMultiplier: skill.multiplier,
    baseDamageFlat: 0,
    critRate: config.critRate, critDamage: config.critDamage, damageBonus: config.damageBonus,
    damageReduction: [], amplifyBonus: 0,
    weakenReduction: [], shelterValue: 0, fragileBonus: 0,
    vulnerableBonus: 0, defense: config.targetDef,
    isTrueDamage: skill.damageType === 'true',
    isStaggered: false, staggerMultiplier: 1,
    resistance: config.targetResistance,
    resistanceIgnore: config.targetResistanceIgnore,
    nonControlledReduction: 0,
    comboBonus: skill.type === 'chain' ? 0.3 : 0,
    specialMultiplier: 1,
  })
  const total = dmg.finalDamage * config.targetCount
  member.totalDamage += total
  member.totalCasts++
  if (!member.skillBreakdown[skill.id]) member.skillBreakdown[skill.id] = { count: 0, totalDamage: 0 }
  member.skillBreakdown[skill.id].count++
  member.skillBreakdown[skill.id].totalDamage += total
  events.push({ time: t, char: member.name, type: 'damage', skillName: skill.name, damage: total })
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

  while (time < config.duration) {
    if (member.nextAutoTime <= time + 0.05) {
      fireAutoAttack(member, member.nextAutoTime, config, [])
      member.nextAutoTime += AUTO_ATTACK_INTERVAL
    }

    const step = member.rotation[member.rotIdx % member.rotation.length]
    if (!step) { time = config.duration; break }

    const skill = member.skillMap.get(step.skillId)
    if (!skill) { member.rotIdx++; continue }

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
    rotation: m.rotation,
    rotIdx: 0,
    energy: MAX_ENERGY,
    cooldowns: new Map(),
    totalDamage: 0,
    totalCasts: 0,
    nextAutoTime: AUTO_ATTACK_INTERVAL,
    skillBreakdown: {},
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
    }
  })

  const teamTotalDamage = memberResults.reduce((sum, m) => sum + m.totalDamage, 0)

  return {
    members: memberResults,
    teamTotalDamage,
    teamDps: teamTotalDamage / config.duration,
  }
}
