import { describe, it, expect } from 'vitest'
import { calcAttack, calcStat, calcHp } from '../attack'

describe('calcAttack', () => {
  it('基础攻击（无加成）', () => {
    expect(calcAttack({ baseAtk: 500, weaponAtk: 200, percentBonus: 0, flatBonus: 0, mainAttr: 0, subAttr: 0 }))
      .toBeCloseTo(700)
  })

  it('百分比加成', () => {
    expect(calcAttack({ baseAtk: 500, weaponAtk: 200, percentBonus: 0.2, flatBonus: 0, mainAttr: 0, subAttr: 0 }))
      .toBeCloseTo(840)
  })

  it('固定值加成', () => {
    expect(calcAttack({ baseAtk: 500, weaponAtk: 200, percentBonus: 0, flatBonus: 50, mainAttr: 0, subAttr: 0 }))
      .toBeCloseTo(750)
  })

  it('属性加成（主属性 100，副属性 50）', () => {
    const r = calcAttack({ baseAtk: 500, weaponAtk: 200, percentBonus: 0, flatBonus: 0, mainAttr: 100, subAttr: 50 })
    const attrBonus = 1 + 100 * 0.005 + 50 * 0.002
    expect(r).toBeCloseTo(700 * attrBonus)
  })

  it('复杂场景：百分比+固定+属性', () => {
    const r = calcAttack({ baseAtk: 500, weaponAtk: 200, percentBonus: 0.15, flatBonus: 30, mainAttr: 80, subAttr: 20 })
    const raw = 700 * 1.15 + 30
    const attrBonus = 1 + 80 * 0.005 + 20 * 0.002
    expect(r).toBeCloseTo(raw * attrBonus)
  })

  it('零攻击场景', () => {
    expect(calcAttack({ baseAtk: 0, weaponAtk: 0, percentBonus: 0, flatBonus: 0, mainAttr: 0, subAttr: 0 }))
      .toBeCloseTo(0)
  })
})

describe('calcStat', () => {
  it('基础属性无加成', () => {
    expect(calcStat({ base: 100, trustBonus: 0, weaponBonus: 0, equipBonus: 0, percentBonus: 0 }))
      .toBeCloseTo(100)
  })

  it('装备加成', () => {
    expect(calcStat({ base: 100, trustBonus: 10, weaponBonus: 5, equipBonus: 15, percentBonus: 0 }))
      .toBeCloseTo(130)
  })

  it('百分比加成', () => {
    expect(calcStat({ base: 100, trustBonus: 0, weaponBonus: 0, equipBonus: 0, percentBonus: 0.25 }))
      .toBeCloseTo(125)
  })

  it('组合', () => {
    expect(calcStat({ base: 80, trustBonus: 10, weaponBonus: 5, equipBonus: 12, percentBonus: 0.2 }))
      .toBeCloseTo((80 + 10 + 5 + 12) * 1.2)
  })
})

describe('calcHp', () => {
  it('基础 HP', () => {
    expect(calcHp({ baseHp: 5000, percentBonus: 0, flatBonus: 0 })).toBeCloseTo(5000)
  })

  it('百分比 HP', () => {
    expect(calcHp({ baseHp: 5000, percentBonus: 0.1, flatBonus: 0 })).toBeCloseTo(5500)
  })

  it('固定 HP', () => {
    expect(calcHp({ baseHp: 5000, percentBonus: 0, flatBonus: 200 })).toBeCloseTo(5200)
  })

  it('百分比+固定', () => {
    expect(calcHp({ baseHp: 5000, percentBonus: 0.12, flatBonus: 150 })).toBeCloseTo(5750)
  })
})
