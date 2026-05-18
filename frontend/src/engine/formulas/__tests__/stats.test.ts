import { describe, it, expect } from 'vitest'
import { calcFinalStats } from '../stats'

const baseChar = {
  baseAtk: 500, baseHp: 5000,
  baseStr: 100, baseAgi: 80, baseInt: 60, baseWil: 40,
  mainAttr: 'int', subAttr: 'wil',
  trustLevel: 1,
}

const baseWeapon = { baseAtk: 200, affix1Value: 0 }

const baseEquip = { str: 10, agi: 5, int: 15, wil: 8, atkPercent: 0.1, hpPercent: 0.08 }

describe('calcFinalStats', () => {
  it('计算四维（含信赖/装备）', () => {
    const r = calcFinalStats(baseChar, baseWeapon, baseEquip)
    expect(r.str).toBeCloseTo(100 + 10)
    expect(r.agi).toBeCloseTo(80 + 5)
    expect(r.int).toBeCloseTo(60 + 15 + 10) // 信赖+10
    expect(r.wil).toBeCloseTo(40 + 8 + 10)   // 信赖+10
  })

  it('计算 attrBonus', () => {
    const r = calcFinalStats(baseChar, baseWeapon, baseEquip)
    const mainVal = 60 + 15 + 10
    const subVal = 40 + 8 + 10
    expect(r.attrBonus).toBeCloseTo(mainVal * 0.005 + subVal * 0.002)
  })

  it('计算攻击', () => {
    const r = calcFinalStats(baseChar, baseWeapon, baseEquip)
    const mainVal = 60 + 15 + 10
    const subVal = 40 + 8 + 10
    const raw = (500 + 200) * (1 + 0.1)
    const attrBonus = 1 + mainVal * 0.005 + subVal * 0.002
    expect(r.attack).toBeCloseTo(raw * attrBonus)
  })

  it('计算 HP', () => {
    const r = calcFinalStats(baseChar, baseWeapon, baseEquip)
    expect(r.hp).toBeCloseTo(5000 * (1 + 0.08))
  })

  it('信赖等级4', () => {
    const char = { ...baseChar, trustLevel: 4, mainAttr: 'str', subAttr: 'agi' }
    const r = calcFinalStats(char, baseWeapon, baseEquip)
    expect(r.str).toBeCloseTo(100 + 10 + 60) // base+equip+trust
    expect(r.agi).toBeCloseTo(80 + 5 + 60)
  })

  it('信赖只加一次（主副同属性也不叠加）', () => {
    const char = { ...baseChar, mainAttr: 'str', subAttr: 'str', trustLevel: 1 }
    const r = calcFinalStats(char, baseWeapon, baseEquip)
    expect(r.str).toBeCloseTo(100 + 10 + 10) // base + equip + 信赖(仅一次)
  })
})
