export type BuffType = 'permanent' | 'limited';
export type StackRule = 'add_same' | 'multi_diff';
export type TargetScope = 'self' | 'team' | 'character';

export interface Buff {
  id: string;
  name: string;
  source: string;
  buffType: BuffType;
  effectCategory: string;
  effectType: string;
  effectValue: number;
  stackRule: StackRule;
  targetScope: TargetScope;
  targetCharacterId?: string;
  triggerCondition?: string;
  duration?: number;
  maxStacks?: number;
}
