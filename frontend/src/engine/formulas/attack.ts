export interface AttackInput {
  baseAtk: number
  weaponAtk: number
  percentBonus: number
  flatBonus: number
  mainAttr: number
  subAttr: number
}

export function calcAttack(input: AttackInput): number {
  const raw = (input.baseAtk + input.weaponAtk) * (1 + input.percentBonus) + input.flatBonus
  const attrBonus = 1 + Math.floor(input.mainAttr) * 0.005 + Math.floor(input.subAttr) * 0.002
  return raw * attrBonus
}

export interface StatInput {
  base: number
  trustBonus: number
  weaponBonus: number
  equipBonus: number
  percentBonus: number
}

export function calcStat(input: StatInput): number {
  return (input.base + input.trustBonus + input.weaponBonus + input.equipBonus) * (1 + input.percentBonus)
}

export interface HpInput {
  baseHp: number
  percentBonus: number
  flatBonus: number
}

export function calcHp(input: HpInput): number {
  return input.baseHp * (1 + input.percentBonus) + input.flatBonus
}
