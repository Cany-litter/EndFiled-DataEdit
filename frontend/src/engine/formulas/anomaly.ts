export function calcAnomalyLevel(源石技艺强度: number): number {
  if (源石技艺强度 < 100) return 1
  if (源石技艺强度 < 200) return 2
  if (源石技艺强度 < 300) return 3
  return 4
}

export function calc法术等级系数(level: number): number {
  return 1 + (level - 1) / 196
}

export function calc物理等级系数(level: number): number {
  return 1 + (level - 1) / 392
}

export function calc源石技艺强度区(value: number): number {
  return 1 + value / 100
}

export interface 法术异常伤害Input {
  baseMultiplier: number
  anomalyLevel: number
  casterLevel: number
  源石技艺强度: number
}

export function calc法术异常伤害(input: 法术异常伤害Input): number {
  return input.baseMultiplier * (1 + input.anomalyLevel) *
    calc法术等级系数(input.casterLevel) *
    calc源石技艺强度区(input.源石技艺强度)
}

export interface 物理异常伤害Input {
  baseMultiplier: number
  breakArmorStacks: number
  consumesStacks: boolean
  casterLevel: number
  源石技艺强度: number
}

export function calc物理异常伤害(input: 物理异常伤害Input): number {
  const stackMult = input.consumesStacks ? (input.breakArmorStacks + 1) : 1
  return input.baseMultiplier * stackMult *
    calc物理等级系数(input.casterLevel) *
    calc源石技艺强度区(input.源石技艺强度)
}

export function calc附带效果增强(源石技艺强度: number): number {
  return 2 * 源石技艺强度 / (源石技艺强度 + 300)
}

export const 法术异常倍率Map: Record<string, number> = {
  conduct: 0.8,    // 导电
  corrode: 0.8,   // 腐蚀
  burn: 0.8,      // 燃烧
  freeze: 0.8,    // 冻结
  shatter: 1.2,   // 碎冰
  burst: 1.6,     // 法术爆发
}

export const 物理异常倍率Map: Record<string, { multiplier: number; consumesStacks: boolean }> = {
  knockDown: { multiplier: 1.2, consumesStacks: false },    // 倒地
  knockUp: { multiplier: 1.2, consumesStacks: false },      // 击飞
  armorBreak: { multiplier: 0.5, consumesStacks: true },    // 碎甲
  smash: { multiplier: 1.5, consumesStacks: true },         // 猛击
}

export const 连击增伤Map: Record<number, { skill: number; ultimate: number }> = {
  1: { skill: 0.3, ultimate: 0.2 },
  2: { skill: 0.45, ultimate: 0.3 },
  3: { skill: 0.6, ultimate: 0.4 },
  4: { skill: 0.75, ultimate: 0.5 },
}
