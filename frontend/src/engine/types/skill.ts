import { ElementType } from './character';

export type SkillType = 'normal' | 'skill' | 'chain' | 'ultimate' | 'talent1' | 'talent2' | 'other';
export type DamageType = ElementType | 'ultra' | 'true' | 'other';

export interface SkillLevel {
  level: number;
  multiplier: number;
}

export interface SkillAction {
  castTime: number;
  preCast: number;
  postCast: number;
  techCost: number;
  techReturn: number;
  techRegen: number;
  chainCd: number | null;
  ultimateCd: number | null;
  energyRegenSelf: number | null;
  energyRegenCondition: string;
  applyAttachment: string;
  applyBreak: number;
  consumeAttachment: string;
  consumeBreak: number;
  chainTriggerCondition: string;
}

export interface Skill {
  id: string;
  characterId: string;
  name: string;
  type: SkillType;
  damageType: DamageType;
  description: string;
  levels: SkillLevel[];
  action?: SkillAction;
}
