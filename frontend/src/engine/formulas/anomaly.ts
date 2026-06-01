export function calcAnomalyLevel(consumedStacks: number): number {
  return Math.min(Math.max(1, Math.floor(consumedStacks)), 4)
}

export function calcSpellLevelCoefficient(level: number): number {
  return 1 + (level - 1) / 196
}

export function calcPhysicalLevelCoefficient(level: number): number {
  return 1 + (level - 1) / 392
}

export function calcArtsIntensityMultiplier(value: number): number {
  return 1 + value / 100
}

export interface SpellAnomalyDamageInput {
  baseMultiplier: number
  anomalyLevel: number
  casterLevel: number
  artsIntensity: number
}

export function calcSpellAnomalyDamage(input: SpellAnomalyDamageInput): number {
  return input.baseMultiplier * (1 + input.anomalyLevel) *
    calcSpellLevelCoefficient(input.casterLevel) *
    calcArtsIntensityMultiplier(input.artsIntensity)
}

export interface PhysicalAnomalyDamageInput {
  baseMultiplier: number
  breakArmorStacks: number
  consumesStacks: boolean
  casterLevel: number
  artsIntensity: number
}

export function calcPhysicalAnomalyDamage(input: PhysicalAnomalyDamageInput): number {
  const stackMult = input.consumesStacks ? (input.breakArmorStacks + 1) : 1
  return input.baseMultiplier * stackMult *
    calcPhysicalLevelCoefficient(input.casterLevel) *
    calcArtsIntensityMultiplier(input.artsIntensity)
}

export function calcAdditionalEffectEnhancement(artsIntensity: number): number {
  return 2 * artsIntensity / (artsIntensity + 300)
}

export const spellAnomalyMultiplierMap: Record<string, number> = {
  conduct: 0.8,
  corrode: 0.8,
  burn: 0.8,
  freeze: 0.8,
  shatter: 1.2,
  burst: 1.6,
}

export const physicalAnomalyMultiplierMap: Record<string, { multiplier: number; consumesStacks: boolean }> = {
  knockDown: { multiplier: 1.2, consumesStacks: false },
  knockUp: { multiplier: 1.2, consumesStacks: false },
  armorBreak: { multiplier: 0.5, consumesStacks: true },
  smash: { multiplier: 1.5, consumesStacks: true },
}
