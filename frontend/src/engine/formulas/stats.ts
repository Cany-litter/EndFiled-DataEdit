import { calcAttack, calcStat, calcHp } from './attack'

export interface FinalStats {
  attack: number
  hp: number
  str: number
  agi: number
  int: number
  wil: number
  attrBonus: number
  defPercent: number
  critRate: number
  critDamage: number
  damageBonus: number
}

export interface CharConfig {
  baseAtk: number; baseHp: number
  baseStr: number; baseAgi: number; baseInt: number; baseWil: number
  mainAttr: string; subAttr: string
  trustLevel: number
}

export interface WeaponConfig {
  baseAtk: number
  affix1Value: number
}

export interface EquipStats {
  str: number; agi: number; int: number; wil: number
  atkPercent: number; hpPercent: number
  defPercent: number; critRate: number; critDamage: number; damageBonus: number
}

const trustMap: Record<number, number> = { 1: 10, 2: 25, 3: 40, 4: 60 }

export function calcFinalStats(
  char: CharConfig,
  weapon: WeaponConfig,
  equip: EquipStats,
): FinalStats {
  const trustBonus = trustMap[char.trustLevel] || 0

  const str = calcStat({ base: char.baseStr, trustBonus: char.mainAttr === 'str' ? trustBonus : char.subAttr === 'str' ? trustBonus : 0, weaponBonus: 0, equipBonus: equip.str, percentBonus: 0 })
  const agi = calcStat({ base: char.baseAgi, trustBonus: char.mainAttr === 'agi' ? trustBonus : char.subAttr === 'agi' ? trustBonus : 0, weaponBonus: 0, equipBonus: equip.agi, percentBonus: 0 })
  const int = calcStat({ base: char.baseInt, trustBonus: char.mainAttr === 'int' ? trustBonus : char.subAttr === 'int' ? trustBonus : 0, weaponBonus: 0, equipBonus: equip.int, percentBonus: 0 })
  const wil = calcStat({ base: char.baseWil, trustBonus: char.mainAttr === 'wil' ? trustBonus : char.subAttr === 'wil' ? trustBonus : 0, weaponBonus: 0, equipBonus: equip.wil, percentBonus: 0 })

  const mainVal = getAttr(str, agi, int, wil, char.mainAttr)
  const subVal = getAttr(str, agi, int, wil, char.subAttr)
  const attrBonus = mainVal * 0.005 + subVal * 0.002

  const attack = calcAttack({
    baseAtk: char.baseAtk,
    weaponAtk: weapon.baseAtk,
    percentBonus: equip.atkPercent,
    flatBonus: 0,
    mainAttr: mainVal,
    subAttr: subVal,
  })

  const hp = calcHp({ baseHp: char.baseHp, percentBonus: equip.hpPercent, flatBonus: 0 })

  const defPercent = equip.defPercent
  const critRate = equip.critRate
  const critDamage = equip.critDamage
  const damageBonus = equip.damageBonus

  return { attack, hp, str, agi, int, wil, attrBonus, defPercent, critRate, critDamage, damageBonus }
}

function getAttr(str: number, agi: number, int: number, wil: number, attr: string): number {
  switch (attr) {
    case 'str': return str; case 'agi': return agi
    case 'int': return int; case 'wil': return wil
    default: return 0
  }
}
