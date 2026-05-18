import { describe, it, expect } from 'vitest'
import { calcAnomalyLevel, calc法术等级系数, calc物理等级系数, calc源石技艺强度区, calc法术异常伤害, calc物理异常伤害, calc附带效果增强, 法术异常倍率Map, 物理异常倍率Map, 连击增伤Map } from '../anomaly'

describe('calcAnomalyLevel', () => {
  it('小于 100 返回 1', () => { expect(calcAnomalyLevel(50)).toBe(1) })
  it('100-199 返回 2', () => { expect(calcAnomalyLevel(150)).toBe(2) })
  it('200-299 返回 3', () => { expect(calcAnomalyLevel(250)).toBe(3) })
  it('300+ 返回 4', () => { expect(calcAnomalyLevel(350)).toBe(4) })
  it('边界值 100', () => { expect(calcAnomalyLevel(100)).toBe(2) })
  it('边界值 200', () => { expect(calcAnomalyLevel(200)).toBe(3) })
  it('边界值 300', () => { expect(calcAnomalyLevel(300)).toBe(4) })
})

describe('等级系数', () => {
  it('calc法术等级系数: 等级1', () => { expect(calc法术等级系数(1)).toBeCloseTo(1) })
  it('calc法术等级系数: 等级80', () => { expect(calc法术等级系数(80)).toBeCloseTo(1 + 79 / 196) })
  it('calc物理等级系数: 等级1', () => { expect(calc物理等级系数(1)).toBeCloseTo(1) })
  it('calc物理等级系数: 等级80', () => { expect(calc物理等级系数(80)).toBeCloseTo(1 + 79 / 392) })
})

describe('calc源石技艺强度区', () => {
  it('强度 0', () => { expect(calc源石技艺强度区(0)).toBeCloseTo(1) })
  it('强度 100', () => { expect(calc源石技艺强度区(100)).toBeCloseTo(2) })
  it('强度 50', () => { expect(calc源石技艺强度区(50)).toBeCloseTo(1.5) })
})

describe('calc法术异常伤害', () => {
  it('基础场景', () => {
    const r = calc法术异常伤害({ baseMultiplier: 0.8, anomalyLevel: 2, casterLevel: 60, 源石技艺强度: 100 })
    expect(r).toBeCloseTo(0.8 * (1 + 2) * (1 + 59 / 196) * (1 + 100 / 100))
  })
})

describe('calc物理异常伤害', () => {
  it('不消耗层数', () => {
    const stacks = 0
    const r = calc物理异常伤害({ baseMultiplier: 1.2, breakArmorStacks: stacks, consumesStacks: false, casterLevel: 60, 源石技艺强度: 50 })
    const stackMult = 1
    expect(r).toBeCloseTo(1.2 * stackMult * (1 + 59 / 392) * (1 + 50 / 100))
  })
  it('消耗层数', () => {
    const stacks = 3
    const r = calc物理异常伤害({ baseMultiplier: 0.5, breakArmorStacks: stacks, consumesStacks: true, casterLevel: 60, 源石技艺强度: 50 })
    const stackMult = stacks + 1
    expect(r).toBeCloseTo(0.5 * stackMult * (1 + 59 / 392) * (1 + 50 / 100))
  })
  it('层数为0消耗', () => {
    const r = calc物理异常伤害({ baseMultiplier: 0.5, breakArmorStacks: 0, consumesStacks: true, casterLevel: 60, 源石技艺强度: 50 })
    expect(r).toBeCloseTo(0.5 * 1 * (1 + 59 / 392) * (1 + 50 / 100))
  })
})

describe('calc附带效果增强', () => {
  it('强度 0', () => { expect(calc附带效果增强(0)).toBeCloseTo(0) })
  it('强度 300', () => { expect(calc附带效果增强(300)).toBeCloseTo(1) })
  it('强度 150', () => { expect(calc附带效果增强(150)).toBeCloseTo(2 * 150 / 450) })
})

describe('异常倍率Map', () => {
  it('法术异常倍率', () => {
    expect(法术异常倍率Map.conduct).toBe(0.8)
    expect(法术异常倍率Map.corrode).toBe(0.8)
    expect(法术异常倍率Map.burn).toBe(0.8)
    expect(法术异常倍率Map.freeze).toBe(0.8)
    expect(法术异常倍率Map.shatter).toBe(1.2)
    expect(法术异常倍率Map.burst).toBe(1.6)
  })
  it('物理异常倍率', () => {
    expect(物理异常倍率Map.knockDown.multiplier).toBe(1.2)
    expect(物理异常倍率Map.knockDown.consumesStacks).toBe(false)
    expect(物理异常倍率Map.knockUp.multiplier).toBe(1.2)
    expect(物理异常倍率Map.armorBreak.multiplier).toBe(0.5)
    expect(物理异常倍率Map.armorBreak.consumesStacks).toBe(true)
    expect(物理异常倍率Map.smash.multiplier).toBe(1.5)
    expect(物理异常倍率Map.smash.consumesStacks).toBe(true)
  })
})

describe('连击增伤Map', () => {
  it('连击1', () => { expect(连击增伤Map[1]).toEqual({ skill: 0.3, ultimate: 0.2 }) })
  it('连击2', () => { expect(连击增伤Map[2]).toEqual({ skill: 0.45, ultimate: 0.3 }) })
  it('连击3', () => { expect(连击增伤Map[3]).toEqual({ skill: 0.6, ultimate: 0.4 }) })
  it('连击4', () => { expect(连击增伤Map[4]).toEqual({ skill: 0.75, ultimate: 0.5 }) })
})
