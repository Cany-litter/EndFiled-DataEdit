export interface ConditionDef {
  skillType?: string | string[]
  element?: string | string[]
}

export interface SaturationScaleDef {
  stat: string
  x: number
  y: number
  z: number
}

export interface EffectDef {
  category: string
  value?: number
  condition?: ConditionDef
  scaleStat?: string
  scaleValue?: number
  scaleRatio?: number
  scaleCap?: number
  scaleCurve?: [number, number][]
  saturationScale?: SaturationScaleDef
}

export interface MetaDef {
  category: string
  multiplier: number
  condition?: ConditionDef
}

export function piecewiseLinear(x: number, curve: [number, number][]): number {
  if (curve.length === 0) return 0
  if (x <= curve[0][0]) return curve[0][1]
  if (x >= curve[curve.length - 1][0]) return curve[curve.length - 1][1]
  for (let i = 1; i < curve.length; i++) {
    if (x <= curve[i][0]) {
      const [x0, y0] = curve[i - 1]
      const [x1, y1] = curve[i]
      return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)
    }
  }
  return curve[curve.length - 1][1]
}

export function resolveEffectValue(
  effect: EffectDef,
  statTotals?: Record<string, number>,
): number {
  if (effect.saturationScale) {
    const { stat, x, y, z } = effect.saturationScale
    const statVal = effect.scaleValue ?? (statTotals?.[stat] || 0)
    return (effect.value || 0) * (x + (y * statVal) / (z + statVal))
  }
  if (effect.scaleStat || effect.scaleValue != null) {
    const statVal = effect.scaleValue ?? (statTotals?.[effect.scaleStat!] || 0)
    if (effect.scaleCurve) {
      const base = piecewiseLinear(statVal, effect.scaleCurve)
      return effect.scaleRatio != null ? base * effect.scaleRatio : base
    }
    const raw = statVal * (effect.scaleRatio ?? 1)
    return effect.scaleCap != null ? Math.min(raw, effect.scaleCap) : raw
  }
  return effect.value ?? 0
}

export function matchesCondition(
  condition: ConditionDef | undefined | null,
  context: { skillType?: string; element?: string },
): boolean {
  if (!condition) return true
  if (condition.skillType) {
    const types = Array.isArray(condition.skillType) ? condition.skillType : [condition.skillType]
    if (!types.includes(context.skillType ?? '')) return false
  }
  if (condition.element) {
    const elems = Array.isArray(condition.element) ? condition.element : [condition.element]
    if (!elems.includes(context.element ?? '')) return false
  }
  return true
}

export const ARTS_INTENSITY_CURVE: [number, number][] = [
  [0, 1],
  [500, 6],
]

export function collectCrit(
  activeBuffs: Array<{ effects?: EffectDef[] }>,
  context: { skillType?: string; element?: string; statTotals?: Record<string, number> },
  baseCritRate = 0,
  baseCritDamage = 0,
): { critRate: number; critDamage: number; expectedMultiplier: number } {
  let critRate = baseCritRate
  let critDamage = baseCritDamage
  for (const buff of activeBuffs) {
    if (!buff.effects) continue
    for (const effect of buff.effects) {
      if (!matchesCondition(effect.condition, context)) continue
      const v = resolveEffectValue(effect, context.statTotals)
      if (effect.category === 'critRate') critRate += v
      else if (effect.category === 'critDamage') critDamage += v
    }
  }
  critRate = Math.min(Math.max(critRate, 0), 1)
  return {
    critRate,
    critDamage,
    expectedMultiplier: 1 + critRate * critDamage,
  }
}
