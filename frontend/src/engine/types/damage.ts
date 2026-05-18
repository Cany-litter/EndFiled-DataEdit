import { ElementType } from './character';

export interface DamageBreakdown {
  baseDamage: number;
  critMultiplier: number;
  damageBonusMultiplier: number;
  damageReductionMultiplier: number;
  amplifyMultiplier: number;
  weakenMultiplier: number;
  shelterMultiplier: number;
  fragileMultiplier: number;
  vulnerableMultiplier: number;
  defenseMultiplier: number;
  staggerMultiplier: number;
  resistanceMultiplier: number;
  nonControlledMultiplier: number;
  comboMultiplier: number;
  specialMultiplier: number;
}

export interface DamageResult {
  finalDamage: number;
  breakdown: DamageBreakdown;
  isCrit: boolean;
  gainSnapshot: Record<string, boolean>;
}

export interface EnemyState {
  attachments: Map<ElementType, number>;
  attachmentDuration: number;
  breakArmor: number;
  breakArmorDuration: number;
  isFrozen: boolean;
  isStunned: boolean;
}

export type ReactionType = 'conduct' | 'corrode' | 'burn' | 'freeze' | 'shatter' | 'burst';

export interface ReactionResult {
  type: ReactionType;
  damage: number;
  newState: EnemyState;
  appliedDebuffs: { type: string; value: number; duration: number }[];
}
