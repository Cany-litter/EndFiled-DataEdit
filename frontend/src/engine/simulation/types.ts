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
}

export interface SimulationConfig {
  targetDef: number
  targetResistance: number
  targetResistanceIgnore: number
  duration: number
  critRate: number
  critDamage: number
  damageBonus: number
}

export interface SimEvent {
  time: number
  type: 'cast_start' | 'cast_end' | 'damage' | 'auto_attack' | 'energy_change'
  skillType?: SkillType
  skillName?: string
  damage?: number
  energy?: number
}

export interface SimulationResult {
  events: SimEvent[]
  totalDamage: number
  dps: number
  totalCasts: number
  skillBreakdown: Record<string, { count: number; totalDamage: number }>
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
