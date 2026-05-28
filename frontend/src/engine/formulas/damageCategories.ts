import {
  type EffectDef,
  type MetaDef,
  type ConditionDef,
  resolveEffectValue,
  matchesCondition,
} from './effectResolver'

export interface CategoryDef {
  key: string
  label: string
}

export const DAMAGE_CATEGORIES: CategoryDef[] = [
  { key: 'DMG_Dealt', label: '增伤' },
  { key: 'DMG_Taken', label: '易伤' },
  { key: 'Susceptibility', label: '脆弱' },
  { key: 'Arts_Amp', label: '增幅' },
  { key: 'Resistance', label: '抗性' },
  { key: 'Link', label: '连击' },
  { key: 'Staggered', label: '失衡' },
  { key: 'Finisher', label: '处决' },
]

export interface CategoryBreakdownEntry {
  label: string
  contributions: { buffName: string; value: number }[]
  rawTotal: number
  metas: { buffName: string; multiplier: number }[]
  finalTotal: number
  multiplier: number
}

export type CategoryBreakdown = Record<string, CategoryBreakdownEntry>

export interface CalcCategoriesResult {
  finalDamage: number
  breakdown: CategoryBreakdown
}

export function calcDamageByCategories(
  baseDamage: number,
  activeBuffs: Array<{ name?: string; effects?: EffectDef[]; metas?: MetaDef[] }>,
  categoryDefs: CategoryDef[],
  context: { skillType?: string; element?: string; statTotals?: Record<string, number> },
): CalcCategoriesResult {
  const breakdown: CategoryBreakdown = {}
  for (const cat of categoryDefs) {
    breakdown[cat.key] = {
      label: cat.label,
      contributions: [],
      rawTotal: 0,
      metas: [],
      finalTotal: 0,
      multiplier: 1,
    }
  }

  for (const buff of activeBuffs) {
    if (!buff.effects) continue
    for (const effect of buff.effects) {
      if (!matchesCondition(effect.condition, context)) continue
      const cat = breakdown[effect.category]
      if (cat) {
        const v = resolveEffectValue(effect, context.statTotals)
        cat.contributions.push({ buffName: buff.name ?? 'unknown', value: v })
        cat.rawTotal += v
      }
    }
  }

  for (const buff of activeBuffs) {
    if (!buff.metas) continue
    for (const meta of buff.metas) {
      if (!matchesCondition(meta.condition, context)) continue
      const cat = breakdown[meta.category]
      if (cat) {
        cat.metas.push({ buffName: buff.name ?? 'unknown', multiplier: meta.multiplier })
      }
    }
  }

  for (const cat of categoryDefs) {
    const b = breakdown[cat.key]
    b.finalTotal = b.rawTotal
    for (const meta of b.metas) {
      b.finalTotal *= meta.multiplier
    }
    b.multiplier = 1 + b.finalTotal
  }

  let finalDamage = baseDamage
  for (const cat of categoryDefs) {
    finalDamage *= breakdown[cat.key].multiplier
  }

  return { finalDamage, breakdown }
}
