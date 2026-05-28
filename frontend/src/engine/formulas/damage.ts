export interface DamageInput {
  attack: number
  skillMultiplier: number
  baseDamageFlat: number
  critRate: number
  critDamage: number
  damageBonus: number
  damageReduction: number[]
  amplifyBonus: number
  weakenReduction: number[]
  shelterValue: number
  fragileBonus: number
  vulnerableBonus: number
  defense: number
  isTrueDamage: boolean
  isStaggered: boolean
  staggerMultiplier: number
  resistance: number
  resistanceIgnore: number
  nonControlledReduction: number
  comboBonus: number
  specialMultiplier: number
}

export interface DamageBreakdown {
  baseDamage: number
  critMult: number
  damageBonusMult: number
  damageReductionMult: number
  amplifyMult: number
  weakenMult: number
  shelterMult: number
  fragileMult: number
  vulnerableMult: number
  defenseMult: number
  staggerMult: number
  resistanceMult: number
  nonControlledMult: number
  comboMult: number
  specialMult: number
  finalDamage: number
}

export function calcDamage(input: DamageInput): DamageBreakdown {
  const baseDamage = input.attack * input.skillMultiplier + input.baseDamageFlat
  const critMult = 1 + input.critRate * input.critDamage
  const damageBonusMult = 1 + input.damageBonus
  const damageReductionMult = input.damageReduction.reduce((p, v) => p * (1 - v), 1)
  const amplifyMult = 1 + input.amplifyBonus
  const weakenMult = input.weakenReduction.reduce((p, v) => p * (1 - v), 1)
  const shelterMult = 1 - input.shelterValue
  const fragileMult = 1 + input.fragileBonus
  const vulnerableMult = 1 + input.vulnerableBonus
  const defenseMult = input.isTrueDamage ? 1 : 100 / (input.defense + 100)
  const staggerMult = input.isStaggered ? input.staggerMultiplier : 1
  const resistanceMult = 1 - input.resistance / 100 + input.resistanceIgnore / 100
  const nonControlledMult = 1 - input.nonControlledReduction
  const comboMult = 1 + input.comboBonus
  const specialMult = input.specialMultiplier

  const finalDamage = baseDamage *
    critMult * damageBonusMult * damageReductionMult * amplifyMult *
    weakenMult * shelterMult * fragileMult * vulnerableMult *
    defenseMult * staggerMult * resistanceMult *
    nonControlledMult * comboMult * specialMult

  return {
    baseDamage, critMult, damageBonusMult, damageReductionMult,
    amplifyMult, weakenMult, shelterMult, fragileMult, vulnerableMult,
    defenseMult, staggerMult, resistanceMult, nonControlledMult,
    comboMult, specialMult, finalDamage,
  }
}
