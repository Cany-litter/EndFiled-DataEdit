import { describe, it, expect } from 'vitest'
import { calcAnomalyLevel, calcSpellLevelCoefficient, calcPhysicalLevelCoefficient, calcArtsIntensityMultiplier, calcSpellAnomalyDamage, calcPhysicalAnomalyDamage, calcAdditionalEffectEnhancement, spellAnomalyMultiplierMap, physicalAnomalyMultiplierMap } from '../anomaly'
import { comboDamageBonusMap } from '../../simulation/comboSystem'

describe('calcAnomalyLevel', () => {
  it('消耗1层 = 1级', () => { expect(calcAnomalyLevel(1)).toBe(1) })
  it('消耗2层 = 2级', () => { expect(calcAnomalyLevel(2)).toBe(2) })
  it('消耗3层 = 3级', () => { expect(calcAnomalyLevel(3)).toBe(3) })
  it('消耗4层 = 4级', () => { expect(calcAnomalyLevel(4)).toBe(4) })
  it('消耗0层下限为1', () => { expect(calcAnomalyLevel(0)).toBe(1) })
  it('消耗5层上限为4', () => { expect(calcAnomalyLevel(5)).toBe(4) })
})

describe('等级系数', () => {
  it('calcSpellLevelCoefficient: 等级1', () => { expect(calcSpellLevelCoefficient(1)).toBeCloseTo(1) })
  it('calcSpellLevelCoefficient: 等级80', () => { expect(calcSpellLevelCoefficient(80)).toBeCloseTo(1 + 79 / 196) })
  it('calcPhysicalLevelCoefficient: 等级1', () => { expect(calcPhysicalLevelCoefficient(1)).toBeCloseTo(1) })
  it('calcPhysicalLevelCoefficient: 等级80', () => { expect(calcPhysicalLevelCoefficient(80)).toBeCloseTo(1 + 79 / 392) })
})

describe('calcArtsIntensityMultiplier', () => {
  it('强度 0', () => { expect(calcArtsIntensityMultiplier(0)).toBeCloseTo(1) })
  it('强度 100', () => { expect(calcArtsIntensityMultiplier(100)).toBeCloseTo(2) })
  it('强度 50', () => { expect(calcArtsIntensityMultiplier(50)).toBeCloseTo(1.5) })
})

describe('calcSpellAnomalyDamage', () => {
  it('基础场景', () => {
    const r = calcSpellAnomalyDamage({ baseMultiplier: 0.8, anomalyLevel: 2, casterLevel: 60, artsIntensity: 100 })
    expect(r).toBeCloseTo(0.8 * (1 + 2) * (1 + 59 / 196) * (1 + 100 / 100))
  })
})

describe('calcPhysicalAnomalyDamage', () => {
  it('不消耗层数', () => {
    const stacks = 0
    const r = calcPhysicalAnomalyDamage({ baseMultiplier: 1.2, breakArmorStacks: stacks, consumesStacks: false, casterLevel: 60, artsIntensity: 50 })
    const stackMult = 1
    expect(r).toBeCloseTo(1.2 * stackMult * (1 + 59 / 392) * (1 + 50 / 100))
  })
  it('消耗层数', () => {
    const stacks = 3
    const r = calcPhysicalAnomalyDamage({ baseMultiplier: 0.5, breakArmorStacks: stacks, consumesStacks: true, casterLevel: 60, artsIntensity: 50 })
    const stackMult = stacks + 1
    expect(r).toBeCloseTo(0.5 * stackMult * (1 + 59 / 392) * (1 + 50 / 100))
  })
  it('层数为0消耗', () => {
    const r = calcPhysicalAnomalyDamage({ baseMultiplier: 0.5, breakArmorStacks: 0, consumesStacks: true, casterLevel: 60, artsIntensity: 50 })
    expect(r).toBeCloseTo(0.5 * 1 * (1 + 59 / 392) * (1 + 50 / 100))
  })
})

describe('calcAdditionalEffectEnhancement', () => {
  it('强度 0', () => { expect(calcAdditionalEffectEnhancement(0)).toBeCloseTo(0) })
  it('强度 300', () => { expect(calcAdditionalEffectEnhancement(300)).toBeCloseTo(1) })
  it('强度 150', () => { expect(calcAdditionalEffectEnhancement(150)).toBeCloseTo(2 * 150 / 450) })
})

describe('异常倍率Map', () => {
  it('spellAnomalyMultiplierMap', () => {
    expect(spellAnomalyMultiplierMap.conduct).toBe(0.8)
    expect(spellAnomalyMultiplierMap.corrode).toBe(0.8)
    expect(spellAnomalyMultiplierMap.burn).toBe(0.8)
    expect(spellAnomalyMultiplierMap.freeze).toBe(0.8)
    expect(spellAnomalyMultiplierMap.shatter).toBe(1.2)
    expect(spellAnomalyMultiplierMap.burst).toBe(1.6)
  })
  it('physicalAnomalyMultiplierMap', () => {
    expect(physicalAnomalyMultiplierMap.knockDown.multiplier).toBe(1.2)
    expect(physicalAnomalyMultiplierMap.knockDown.consumesStacks).toBe(false)
    expect(physicalAnomalyMultiplierMap.knockUp.multiplier).toBe(1.2)
    expect(physicalAnomalyMultiplierMap.armorBreak.multiplier).toBe(0.5)
    expect(physicalAnomalyMultiplierMap.armorBreak.consumesStacks).toBe(true)
    expect(physicalAnomalyMultiplierMap.smash.multiplier).toBe(1.5)
    expect(physicalAnomalyMultiplierMap.smash.consumesStacks).toBe(true)
  })
})

describe('comboDamageBonusMap', () => {
  it('连击1', () => { expect(comboDamageBonusMap[1]).toEqual({ skill: 0.3, ultimate: 0.2 }) })
  it('连击2', () => { expect(comboDamageBonusMap[2]).toEqual({ skill: 0.45, ultimate: 0.3 }) })
  it('连击3', () => { expect(comboDamageBonusMap[3]).toEqual({ skill: 0.6, ultimate: 0.4 }) })
  it('连击4', () => { expect(comboDamageBonusMap[4]).toEqual({ skill: 0.75, ultimate: 0.5 }) })
})
