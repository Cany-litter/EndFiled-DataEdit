import { describe, it, expect } from 'vitest'
import { calcDamageByCategories, DAMAGE_CATEGORIES } from '../damageCategories'

describe('calcDamageByCategories', () => {
  it('无 Buff 时基础伤害不变', () => {
    const r = calcDamageByCategories(1000, [], DAMAGE_CATEGORIES, {})
    expect(r.finalDamage).toBe(1000)
    for (const cat of DAMAGE_CATEGORIES) {
      expect(r.breakdown[cat.key].multiplier).toBe(1)
    }
  })

  it('单个增伤 Buff', () => {
    const buffs = [
      { name: '增伤', effects: [{ category: 'DMG_Dealt', value: 0.3 }] },
    ]
    const r = calcDamageByCategories(1000, buffs, DAMAGE_CATEGORIES, {})
    expect(r.finalDamage).toBeCloseTo(1300)
    expect(r.breakdown['DMG_Dealt'].multiplier).toBeCloseTo(1.3)
  })

  it('多个不同乘区叠加', () => {
    const buffs = [
      { name: '增伤', effects: [{ category: 'DMG_Dealt', value: 0.2 }] },
      { name: '易伤', effects: [{ category: 'DMG_Taken', value: 0.15 }] },
    ]
    const r = calcDamageByCategories(1000, buffs, DAMAGE_CATEGORIES, {})
    expect(r.finalDamage).toBeCloseTo(1000 * 1.2 * 1.15)
  })

  it('同乘区多个 Buff 相加', () => {
    const buffs = [
      { name: '增伤A', effects: [{ category: 'DMG_Dealt', value: 0.2 }] },
      { name: '增伤B', effects: [{ category: 'DMG_Dealt', value: 0.3 }] },
    ]
    const r = calcDamageByCategories(1000, buffs, DAMAGE_CATEGORIES, {})
    expect(r.finalDamage).toBeCloseTo(1000 * (1 + 0.5))
    expect(r.breakdown['DMG_Dealt'].contributions).toHaveLength(2)
  })

  it('条件过滤：匹配时生效', () => {
    const buffs = [
      {
        name: '战技增伤',
        effects: [{
          category: 'DMG_Dealt', value: 0.3,
          condition: { skillType: 'skill' },
        }],
      },
    ]
    const r = calcDamageByCategories(1000, buffs, DAMAGE_CATEGORIES, { skillType: 'skill' })
    expect(r.finalDamage).toBeCloseTo(1300)
  })

  it('条件过滤：不匹配时忽略', () => {
    const buffs = [
      {
        name: '战技增伤',
        effects: [{
          category: 'DMG_Dealt', value: 0.3,
          condition: { skillType: 'skill' },
        }],
      },
    ]
    const r = calcDamageByCategories(1000, buffs, DAMAGE_CATEGORIES, { skillType: 'ultimate' })
    expect(r.finalDamage).toBe(1000)
  })

  it('元乘数 (metas) 影响 finalTotal', () => {
    const buffs = [
      { name: '增伤', effects: [{ category: 'DMG_Dealt', value: 0.2 }] },
      { name: '增幅', metas: [{ category: 'DMG_Dealt', multiplier: 1.5 }] },
    ]
    const r = calcDamageByCategories(1000, buffs, DAMAGE_CATEGORIES, {})
    // rawTotal = 0.2, finalTotal = 0.2 * 1.5 = 0.3, multiplier = 1.3
    expect(r.finalDamage).toBeCloseTo(1300)
    expect(r.breakdown['DMG_Dealt'].finalTotal).toBeCloseTo(0.3)
    expect(r.breakdown['DMG_Dealt'].multiplier).toBeCloseTo(1.3)
  })

  it('全乘区默认 1 倍（无 Buff）', () => {
    const r = calcDamageByCategories(500, [], DAMAGE_CATEGORIES, {})
    for (const cat of DAMAGE_CATEGORIES) {
      expect(r.breakdown[cat.key].contributions).toHaveLength(0)
    }
    expect(r.finalDamage).toBe(500)
  })

  it('效果值使用 statTotals 缩放', () => {
    const buffs = [
      {
        name: '属性缩放',
        effects: [{
          category: 'DMG_Dealt',
          scaleStat: 'strength',
          scaleRatio: 0.01,
        }],
      },
    ]
    const r = calcDamageByCategories(1000, buffs, DAMAGE_CATEGORIES, {
      statTotals: { strength: 50 },
    })
    expect(r.finalDamage).toBeCloseTo(1000 * (1 + 0.5))
  })

  it('多段伤害分别计算', () => {
    const baseHits = [1000, 1500, 2000]
    const buffs = [
      { name: '全增伤', effects: [{ category: 'DMG_Dealt', value: 0.2 }] },
    ]
    for (const base of baseHits) {
      const r = calcDamageByCategories(base, buffs, DAMAGE_CATEGORIES, {})
      expect(r.finalDamage).toBeCloseTo(base * 1.2)
    }
  })
})
