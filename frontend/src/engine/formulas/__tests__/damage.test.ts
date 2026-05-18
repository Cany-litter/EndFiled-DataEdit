import { describe, it, expect } from 'vitest'
import { calcDamage } from '../damage'

const baseInput = {
  attack: 2000, skillMultiplier: 1.5, baseDamageFlat: 0,
  critRate: 0.05, critDamage: 1.3,
  damageBonus: 0.2, damageReduction: [], amplifyBonus: 0,
  weakenReduction: [], shelterValue: 0, fragileBonus: 0,
  vulnerableBonus: 0, defense: 50, isTrueDamage: false,
  isStaggered: false, staggerMultiplier: 1,
  resistance: 0, resistanceIgnore: 0,
  nonControlledReduction: 0, comboBonus: 0, specialMultiplier: 1,
}

describe('calcDamage', () => {
  it('基础伤害 = attack * skillMultiplier', () => {
    const r = calcDamage(baseInput)
    expect(r.baseDamage).toBeCloseTo(3000)
  })

  it('暴击乘区 = 1 + critRate * critDamage', () => {
    const r = calcDamage({ ...baseInput, critRate: 0.05, critDamage: 1.3 })
    expect(r.critMult).toBeCloseTo(1 + 0.05 * 1.3)
  })

  it('满暴击时暴击乘区正确', () => {
    const r = calcDamage({ ...baseInput, critRate: 1, critDamage: 1.5 })
    expect(r.critMult).toBeCloseTo(2.5)
  })

  it('增伤乘区 = 1 + damageBonus', () => {
    const r = calcDamage({ ...baseInput, damageBonus: 0.35 })
    expect(r.damageBonusMult).toBeCloseTo(1.35)
  })

  it('减伤乘区累积连乘', () => {
    const r = calcDamage({ ...baseInput, damageReduction: [0.2, 0.1] })
    expect(r.damageReductionMult).toBeCloseTo((1 - 0.2) * (1 - 0.1))
  })

  it('易伤乘区 = 1 + amplifyBonus', () => {
    const r = calcDamage({ ...baseInput, amplifyBonus: 0.5 })
    expect(r.amplifyMult).toBeCloseTo(1.5)
  })

  it('虚弱乘区累积连乘', () => {
    const r = calcDamage({ ...baseInput, weakenReduction: [0.3] })
    expect(r.weakenMult).toBeCloseTo(0.7)
  })

  it('庇护乘区 = 1 - shelterValue', () => {
    const r = calcDamage({ ...baseInput, shelterValue: 0.25 })
    expect(r.shelterMult).toBeCloseTo(0.75)
  })

  it(' fragility / vulnerable', () => {
    const r = calcDamage({ ...baseInput, fragileBonus: 0.2, vulnerableBonus: 0.15 })
    expect(r.fragileMult).toBeCloseTo(1.2)
    expect(r.vulnerableMult).toBeCloseTo(1.15)
  })

  it('防御乘区 = 1 - def/(def+100)', () => {
    const r = calcDamage({ ...baseInput, defense: 100 })
    expect(r.defenseMult).toBeCloseTo(1 - 100 / 200)
  })

  it('真伤无视防御', () => {
    const r = calcDamage({ ...baseInput, defense: 100, isTrueDamage: true })
    expect(r.defenseMult).toBeCloseTo(1)
  })

  it('踉跄乘区', () => {
    const r = calcDamage({ ...baseInput, isStaggered: true, staggerMultiplier: 1.2 })
    expect(r.staggerMult).toBeCloseTo(1.2)
  })

  it('抗性乘区 = 1 - resistance/100 + resistanceIgnore/100', () => {
    const r = calcDamage({ ...baseInput, resistance: 30, resistanceIgnore: 10 })
    expect(r.resistanceMult).toBeCloseTo(1 - 0.3 + 0.1)
  })

  it('非受控乘区 & combo & special', () => {
    const r = calcDamage({ ...baseInput, nonControlledReduction: 0.1, comboBonus: 0.3, specialMultiplier: 1.2 })
    expect(r.nonControlledMult).toBeCloseTo(0.9)
    expect(r.comboMult).toBeCloseTo(1.3)
    expect(r.specialMult).toBeCloseTo(1.2)
  })

  it('最终伤害=所有乘区连乘', () => {
    const r = calcDamage({
      ...baseInput,
      attack: 2000, skillMultiplier: 1.5,
      critRate: 0.2, critDamage: 1.5,
      damageBonus: 0.25,
      damageReduction: [0.1],
      amplifyBonus: 0.2,
      weakenReduction: [0.1],
      shelterValue: 0.15,
      fragileBonus: 0.1,
      vulnerableBonus: 0.05,
      defense: 50,
      isStaggered: true, staggerMultiplier: 1.3,
      resistance: 20, resistanceIgnore: 5,
      nonControlledReduction: 0.05,
      comboBonus: 0.2,
      specialMultiplier: 1.1,
    })
    const expected = 3000 *
      (1 + 0.2 * 1.5) *
      (1 + 0.25) *
      (1 - 0.1) *
      (1 + 0.2) *
      (1 - 0.1) *
      (1 - 0.15) *
      (1 + 0.1) *
      (1 + 0.05) *
      (1 - 50 / 150) *
      1.3 *
      (1 - 0.2 + 0.05) *
      (1 - 0.05) *
      (1 + 0.2) *
      1.1
    expect(r.finalDamage).toBeCloseTo(expected)
  })

  it('零伤害场景', () => {
    const r = calcDamage({ ...baseInput, attack: 0, skillMultiplier: 0 })
    expect(r.finalDamage).toBeCloseTo(0)
  })
})
