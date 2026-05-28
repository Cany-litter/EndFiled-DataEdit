import { describe, it, expect } from 'vitest'
import {
  piecewiseLinear,
  resolveEffectValue,
  matchesCondition,
  collectCrit,
  ARTS_INTENSITY_CURVE,
} from '../effectResolver'

describe('piecewiseLinear', () => {
  it('空曲线返回 0', () => {
    expect(piecewiseLinear(10, [])).toBe(0)
  })

  it('低于起点取端点值', () => {
    const curve: [number, number][] = [[0, 1], [500, 6]]
    expect(piecewiseLinear(-10, curve)).toBe(1)
  })

  it('高于终点取端点值', () => {
    const curve: [number, number][] = [[0, 1], [500, 6]]
    expect(piecewiseLinear(1000, curve)).toBe(6)
  })

  it('中间值线性插值', () => {
    const curve: [number, number][] = [[0, 0], [100, 100]]
    expect(piecewiseLinear(50, curve)).toBe(50)
  })

  it('多段曲线', () => {
    const curve: [number, number][] = [[0, 0], [50, 100], [100, 200]]
    expect(piecewiseLinear(25, curve)).toBe(50)
    expect(piecewiseLinear(75, curve)).toBe(150)
  })

  it('源石技艺强度曲线 (0,1)→(500,6)', () => {
    expect(piecewiseLinear(0, ARTS_INTENSITY_CURVE)).toBe(1)
    expect(piecewiseLinear(500, ARTS_INTENSITY_CURVE)).toBe(6)
    expect(piecewiseLinear(250, ARTS_INTENSITY_CURVE)).toBe(3.5)
  })
})

describe('resolveEffectValue', () => {
  it('固定值', () => {
    expect(resolveEffectValue({ category: 'DMG_Dealt', value: 0.2 })).toBe(0.2)
  })

  it('无 value 返回 0', () => {
    expect(resolveEffectValue({ category: 'DMG_Dealt' })).toBe(0)
  })

  it('线性缩放', () => {
    const statTotals = { strength: 100 }
    const r = resolveEffectValue(
      { category: 'DMG_Dealt', scaleStat: 'strength', scaleRatio: 0.002 },
      statTotals,
    )
    expect(r).toBe(0.2)
  })

  it('线性缩放带上限', () => {
    const statTotals = { strength: 1000 }
    const r = resolveEffectValue(
      { category: 'DMG_Dealt', scaleStat: 'strength', scaleRatio: 0.002, scaleCap: 0.5 },
      statTotals,
    )
    expect(r).toBe(0.5)
  })

  it('分段线性曲线缩放', () => {
    const statTotals = { agility: 50 }
    const r = resolveEffectValue(
      {
        category: 'DMG_Dealt',
        scaleStat: 'agility',
        scaleCurve: [[0, 0], [100, 1]],
      },
      statTotals,
    )
    expect(r).toBe(0.5)
  })

  it('曲线缩放带比例系数', () => {
    const statTotals = { agility: 50 }
    const r = resolveEffectValue(
      {
        category: 'DMG_Dealt',
        scaleStat: 'agility',
        scaleCurve: [[0, 0], [100, 1]],
        scaleRatio: 0.5,
      },
      statTotals,
    )
    expect(r).toBe(0.25)
  })

  it('饱和缩放', () => {
    const statTotals = { will: 300 }
    const r = resolveEffectValue(
      {
        category: 'DMG_Dealt',
        value: 0.2,
        saturationScale: { stat: 'will', x: 1, y: 2, z: 300 },
      },
      statTotals,
    )
    // value * (x + y * stat / (z + stat)) = 0.2 * (1 + 2*300/(300+300)) = 0.2 * (1+1) = 0.4
    expect(r).toBeCloseTo(0.4)
  })
})

describe('matchesCondition', () => {
  it('无条件返回 true', () => {
    expect(matchesCondition(null, { skillType: 'skill' })).toBe(true)
    expect(matchesCondition(undefined, {})).toBe(true)
  })

  it('技能类型匹配', () => {
    const c = { skillType: 'skill' }
    expect(matchesCondition(c, { skillType: 'skill' })).toBe(true)
    expect(matchesCondition(c, { skillType: 'ultimate' })).toBe(false)
  })

  it('元素类型匹配', () => {
    const c = { element: 'Heat' }
    expect(matchesCondition(c, { element: 'Heat' })).toBe(true)
    expect(matchesCondition(c, { element: 'Physical' })).toBe(false)
  })

  it('多技能类型', () => {
    const c = { skillType: ['skill', 'ultimate'] }
    expect(matchesCondition(c, { skillType: 'skill' })).toBe(true)
    expect(matchesCondition(c, { skillType: 'ultimate' })).toBe(true)
    expect(matchesCondition(c, { skillType: 'basic' })).toBe(false)
  })

  it('技能+元素组合', () => {
    const c = { skillType: 'skill', element: 'Heat' }
    expect(matchesCondition(c, { skillType: 'skill', element: 'Heat' })).toBe(true)
    expect(matchesCondition(c, { skillType: 'skill', element: 'Physical' })).toBe(false)
  })
})

describe('collectCrit', () => {
  it('基础暴击', () => {
    const r = collectCrit([], {}, 0.05, 1.3)
    expect(r.critRate).toBe(0.05)
    expect(r.critDamage).toBe(1.3)
    expect(r.expectedMultiplier).toBeCloseTo(1 + 0.05 * 1.3)
  })

  it('Buff 增加暴击率', () => {
    const buffs = [{ effects: [{ category: 'critRate', value: 0.1 }] }]
    const r = collectCrit(buffs, {}, 0.05, 1.3)
    expect(r.critRate).toBeCloseTo(0.15)
  })

  it('Buff 增加暴击伤害', () => {
    const buffs = [{ effects: [{ category: 'critDamage', value: 0.5 }] }]
    const r = collectCrit(buffs, {}, 0.05, 1.3)
    expect(r.critDamage).toBeCloseTo(1.8)
  })

  it('暴击率被限制在 [0,1]', () => {
    const buffs = [{ effects: [{ category: 'critRate', value: 2 }] }]
    const r = collectCrit(buffs, {}, 0.05, 1.3)
    expect(r.critRate).toBe(1)
  })
})
