import type { ConditionDef, EffectDef, MetaDef } from '../formulas/effectResolver'
export type { EffectDef, MetaDef }

export type BuffType = 'permanent' | 'limited'
export type StackRule = 'add_same' | 'multi_diff'
export type TargetScope = 'self' | 'team' | 'character'

export interface SkillOverride {
  skillIndex?: number
  skillId?: string
  hitIndex?: number
  multiplier?: number | number[]
  element?: string
  addHit?: { element: string; multiplier: number | number[] }
}

export interface Buff {
  id: string
  name: string
  source: string
  buffType: BuffType
  effectCategory: string
  effectType: string
  effectValue: number
  stackRule: StackRule
  targetScope: TargetScope
  targetCharacterId?: string
  triggerCondition?: string
  duration?: number
  maxStacks?: number

  // 扩展字段（参考编队总伤计算器兼容）
  description?: string
  optional?: boolean
  scope?: 'self' | 'team'
  replaces?: string | string[]
  effects?: EffectDef[]
  metas?: MetaDef[]
  skillOverrides?: SkillOverride[]
  statBonuses?: Record<string, number>
  mainAffix?: { flat?: number; percent?: number }
  subAffixes?: { flat?: number; percent?: number }[]
  allAffix?: { flat?: number; percent?: number }
  userInput?: { label: string; default: number; scale?: number }
}
