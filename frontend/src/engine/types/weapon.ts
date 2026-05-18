import { WeaponType } from './character';

export interface WeaponAffix {
  name: string;
  type: string;
  size: 'small' | 'medium' | 'large';
  level: number;
  value: number;
}

export interface Weapon {
  id: string;
  name: string;
  icon: string;
  rarity: number;
  potential: number;
  type: WeaponType;
  level: number;
  baseAtk: number;
  affix1: WeaponAffix;
  affix2: WeaponAffix;
  affix3: {
    name: string;
    type: string;
    level: number;
    effects: string[];
    description: string;
  };
}
