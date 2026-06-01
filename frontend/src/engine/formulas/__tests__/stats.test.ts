import { describe, it, expect } from 'vitest'
import { calcFinalStats } from '../stats'

const baseChar = {
  baseAtk: 500, baseHp: 5000,
  baseStr: 100, baseAgi: 80, baseInt: 60, baseWil: 40,
  mainAttr: 'int', subAttr: 'wil',
  trustLevel: 1,
}

const baseWeapon = { baseAtk: 200 }

const baseEquip = { str: 10, agi: 5, int: 15, wil: 8, atkPercent: 0.1, hpPercent: 0.08, defPercent: 0, critRate: 0, critDamage: 0, damageBonus: 0, artsMastery: 0, energyRecharge: 0, baseDef: 0 }

describe('calcFinalStats', () => {
  it('计算四维（含信赖/装备）', () => {
    const r = calcFinalStats(baseChar, baseWeapon, baseEquip)
    expect(r.str).toBeCloseTo(100 + 10 + 10)  // base + equip + trust
    expect(r.agi).toBeCloseTo(80 + 5 + 10)
    expect(r.int).toBeCloseTo(60 + 15 + 10)
    expect(r.wil).toBeCloseTo(40 + 8 + 10)
  })

  it('计算 attrBonus 使用 Math.floor', () => {
    const r = calcFinalStats(baseChar, baseWeapon, baseEquip)
    const mainVal = Math.floor(60 + 15 + 10)
    const subVal = Math.floor(40 + 8 + 10)
    expect(r.attrBonus).toBeCloseTo(mainVal * 0.005 + subVal * 0.002)
  })

  it('计算攻击', () => {
    const r = calcFinalStats(baseChar, baseWeapon, baseEquip)
    const mainVal = Math.floor(60 + 15 + 10)
    const subVal = Math.floor(40 + 8 + 10)
    const raw = (500 + 200) * (1 + 0.1)
    const attrBonus = 1 + mainVal * 0.005 + subVal * 0.002
    expect(r.attack).toBeCloseTo(raw * attrBonus)
  })

  it('武器 affix1 能力值加到对应属性', () => {
    const weapon = { baseAtk: 200, affix1Type: 'agi', affix1Value: 156 }
    const r = calcFinalStats(baseChar, weapon, baseEquip)
    expect(r.agi).toBeCloseTo(80 + 5 + 10 + 156) // base + equip + trust + weapon
  })

  it('武器 affix1 中文类型名', () => {
    const weapon = { baseAtk: 200, affix1Type: '敏捷', affix1Value: 100 }
    const r = calcFinalStats(baseChar, weapon, baseEquip)
    expect(r.agi).toBeCloseTo(80 + 5 + 10 + 100)
  })

  it('计算 HP', () => {
    const r = calcFinalStats(baseChar, baseWeapon, baseEquip)
    expect(r.hp).toBeCloseTo(5000 * (1 + 0.08))
  })

  it('信赖等级4全四维各加60', () => {
    const char = { ...baseChar, trustLevel: 4, mainAttr: 'str', subAttr: 'agi' }
    const r = calcFinalStats(char, baseWeapon, baseEquip)
    expect(r.str).toBeCloseTo(100 + 10 + 60)
    expect(r.agi).toBeCloseTo(80 + 5 + 60)
    expect(r.int).toBeCloseTo(60 + 15 + 60)
    expect(r.wil).toBeCloseTo(40 + 8 + 60)
  })
})
