import { calcDamage } from '../formulas/damage'
import {
  SkillConfig, RotationStep, SimulationConfig, SimEvent, SimulationResult,
  DEFAULT_SKILL_CONFIGS, AUTO_ATTACK_INTERVAL, AUTO_ATTACK_ENERGY, MAX_ENERGY,
} from './types'

export function runSimulation(
  attack: number,
  config: SimulationConfig,
  skills: SkillConfig[],
  rotation: RotationStep[],
): SimulationResult {
  const events: SimEvent[] = []
  let energy = MAX_ENERGY
  let time = 0
  let totalDamage = 0
  let totalCasts = 0
  let nextAutoTime = AUTO_ATTACK_INTERVAL

  const skillMap = new Map<string, SkillConfig>()
  for (const s of skills) skillMap.set(s.id, s)

  const cooldowns = new Map<string, number>()
  const skillBreakdown: Record<string, { count: number; totalDamage: number }> = {}
  const rotationQueue = [...rotation]
  let rotIdx = 0

  function fireDamage(skill: SkillConfig, t: number) {
    const mult = skill.multiplier
    const dmg = calcDamage({
      attack,
      skillMultiplier: mult,
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
    totalDamage += dmg.finalDamage
    totalCasts++
    if (!skillBreakdown[skill.id]) skillBreakdown[skill.id] = { count: 0, totalDamage: 0 }
    skillBreakdown[skill.id].count++
    skillBreakdown[skill.id].totalDamage += dmg.finalDamage
    events.push({ time: t, type: 'damage', skillType: skill.type, skillName: skill.name, damage: dmg.finalDamage })
  }

  function fireAutoAttack(t: number) {
    const auto: SkillConfig = {
      id: 'auto', name: '普攻', type: 'normal', damageType: 'physical',
      multiplier: 0.5, cooldown: 0, energyCost: 0, castTime: 0,
    }
    fireDamage(auto, t)
    events.push({ time: t, type: 'auto_attack' })
    energy = Math.min(MAX_ENERGY, energy + AUTO_ATTACK_ENERGY)
    events.push({ time: t, type: 'energy_change', energy })
  }

  while (time < config.duration) {
    // Auto-attack check
    if (nextAutoTime <= time + 0.05) {
      fireAutoAttack(nextAutoTime)
      nextAutoTime += AUTO_ATTACK_INTERVAL
    }

    // Find next castable skill from rotation
    const step = rotationQueue[rotIdx % rotationQueue.length]
    if (!step) break

    const skill = skillMap.get(step.skillId)
    if (!skill) { rotIdx++; continue }

    const cdReady = !cooldowns.has(skill.id) || cooldowns.get(skill.id)! <= time
    const energyOk = energy >= skill.energyCost

    if (cdReady && energyOk) {
      // Cast
      const castStart = time
      events.push({ time: castStart, type: 'cast_start', skillType: skill.type, skillName: skill.name })
      const castEnd = castStart + skill.castTime
      events.push({ time: castEnd, type: 'cast_end', skillType: skill.type, skillName: skill.name })

      energy -= skill.energyCost
      events.push({ time: castEnd, type: 'energy_change', energy })

      cooldowns.set(skill.id, castEnd + skill.cooldown)
      fireDamage(skill, castEnd)

      time = castEnd
      rotIdx++
    } else {
      // Skip this step if can't cast - advance time by 0.1s
      time += 0.1
    }
  }

  const effectiveDuration = time > 0 ? time : 1
  return { events, totalDamage, dps: totalDamage / effectiveDuration, totalCasts, skillBreakdown }
}
