export type SkillType = 'normal' | 'skill' | 'chain' | 'ultimate' | 'other'

export interface SkillConfig {
  id: string
  name: string
  type: SkillType
  damageType: string
  multiplier: number
  cooldown: number
  energyCost: number
  castTime: number
}

export interface RotationStep {
  skillId: string
  skillType: SkillType
  label: string
  charIndex?: number
  timelineActionId?: string
  multiplier?: number
}

export interface TeamMemberConfig {
  name: string
  attack: number
  hp?: number
  stats?: { critRate: number; critDamage: number; damageBonus: number; comboBonus?: number }
  skills: SkillConfig[]
  rotation: RotationStep[]
  buffs?: import('../types/buff').Buff[]
}

export interface TeamSimulationResult {
  members: {
    name: string
    totalDamage: number
    dps: number
    totalCasts: number
    totalSpUsed: number
    actionRows: ActionRow[]
    skillBreakdown: Record<string, { count: number; totalDamage: number }>
    categoryBreakdown?: Record<string, number>
  }[]
  teamTotalDamage: number
  teamDps: number
  teamCategoryBreakdown?: Record<string, number>
}

export interface SimulationConfig {
  targetDef: number
  targetResistance: number
  targetResistanceIgnore: number
  duration: number
  critRate: number
  critDamage: number
  damageBonus: number
  targetCount: number
  isStaggered?: boolean
  damageReduction?: number
  amplifyBonus?: number
  fragileBonus?: number
  vulnerableBonus?: number
  comboBonus?: number
  specialMultiplier?: number
}

export interface ActionRow {
  seq: number
  time: number
  charId: string
  skillId: string
  skillName: string
  skillType: string
  damageType: string
  selfBuffs: (string | null)[]
  targetCount: number
  enemyBuffs: (string | null)[]
  spCost: number
  damage: number
  targetEnemyId?: string
}

export interface EnemyParam {
  def: number
  resistance: number
}

export interface SimulateRowsConfig {
  rows: ActionRow[]
  charStats: Record<string, { attack: number; critRate: number; critDamage: number; str: number; agi: number; int: number; wil: number }>
  skillMap: Record<string, { multiplier: number; damageType: string; type: string }>
  gainMap: Record<string, { id: string; effectCategory?: string; effectType?: string; effectValue?: number; valueType?: string }>
  gainCategoryMap: Record<string, string>
  enemyMap?: Record<string, EnemyParam>
  targetDef: number
  targetResistance: number
  resistanceIgnore: number
}

export interface SystemConstants {
  maxSp: number
  initialSp: number
  spRegenRate: number
  skillSpCostDefault: number
  linkCdReduction: number
  maxStagger: number
  staggerNodeCount: number
  staggerNodeDuration: number
  staggerBreakDuration: number
  executionRecovery: number
}

export interface ResourceState {
  sp: number
  spMax: number
  gauge: number
  gaugeMax: number
  stagger: number
  staggerMax: number
  isStaggerBroken: boolean
  time: number
}

export const DEFAULT_SYSTEM_CONSTANTS: SystemConstants = {
  maxSp: 300,
  initialSp: 200,
  spRegenRate: 8,
  skillSpCostDefault: 100,
  linkCdReduction: 0,
  maxStagger: 280,
  staggerNodeCount: 1,
  staggerNodeDuration: 120,
  staggerBreakDuration: 600,
  executionRecovery: 100,
}

export const DEFAULT_SKILL_CONFIGS: Record<SkillType, Omit<SkillConfig, 'id' | 'name' | 'damageType' | 'multiplier'>> = {
  normal: { cooldown: 0, energyCost: 0, castTime: 1.0 },
  skill: { cooldown: 5, energyCost: 20, castTime: 1.5 },
  chain: { cooldown: 10, energyCost: 0, castTime: 2.0 },
  ultimate: { cooldown: 20, energyCost: 80, castTime: 2.0 },
  other: { cooldown: 0, energyCost: 0, castTime: 0.5 },
}

export const AUTO_ATTACK_INTERVAL = 1.5
export const AUTO_ATTACK_ENERGY = 5
export const MAX_ENERGY = 100
