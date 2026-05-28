export type Rarity = 4 | 5 | 6;
export type Profession = 'assault' | 'guard' | 'caster' | 'heavy' | 'vanguard' | 'support';
export type ElementType = 'pyro' | 'cryo' | 'electro' | 'natural' | 'physical';
export type WeaponType = 'sword' | 'greatsword' | 'polearm' | 'pistol' | 'caster_unit';
export type AttrType = 'str' | 'agi' | 'int' | 'wil';

export interface Character {
  id: string;
  name: string;
  icon: string;
  rarity: Rarity;
  level: number;
  baseHp: number;
  baseAtk: number;
  baseStr: number;
  baseAgi: number;
  baseInt: number;
  baseWil: number;
  mainAttr: AttrType;
  subAttr: AttrType;
  profession: Profession;
  element: ElementType;
  weaponType: WeaponType;
  potential: number;
}
