import { calcAttack, calcStat, calcHp } from './attack'

export interface FinalStats {
  attack: number; hp: number; defense: number; damageReduction: number
  str: number; agi: number; int: number; wil: number
  attrBonus: number; strHpBonus: number; healEfficiency: number; defPercent: number
  critRate: number; critDamage: number; damageBonus: number
  artsMastery: number; energyRecharge: number
  physicalResist: number; magicResist: number
}

export interface CharConfig {
  baseAtk: number; baseHp: number
  baseStr: number; baseAgi: number; baseInt: number; baseWil: number
  mainAttr: string; subAttr: string
  trustLevel: number
}

export interface WeaponConfig {
  baseAtk: number
  affix1Type?: string
  affix1Value?: number
}

export interface EquipStats {
  str: number; agi: number; int: number; wil: number
  atkPercent: number; hpPercent: number
  defPercent: number; critRate: number; critDamage: number; damageBonus: number
  artsMastery: number; energyRecharge: number
  baseDef: number
}

export type StatKey =
  | 'hp' | 'atk' | 'def' | 'hpPercent' | 'atkPercent' | 'defPercent'
  | 'str' | 'agi' | 'int' | 'wil'
  | 'mainAttrFlat' | 'mainAttrPercent' | 'subAttrFlat' | 'subAttrPercent'
  | 'critRate' | 'critDamage'
  | 'physicalDmgBonus' | 'burnDmgBonus' | 'electroDmgBonus' | 'frostDmgBonus' | 'natureDmgBonus' | 'extraDmgBonus'
  | 'normalAtkDmgBonus' | 'skillDmgBonus' | 'chainDmgBonus' | 'ultimateDmgBonus' | 'staggerDmgBonus'
  | 'physicalDmgReduction' | 'burnDmgReduction' | 'electroDmgReduction' | 'frostDmgReduction' | 'natureDmgReduction' | 'extraDmgReduction'
  | 'physicalAmplify' | 'burnAmplify' | 'electroAmplify' | 'frostAmplify' | 'natureAmplify' | 'extraAmplify'
  | 'weaken' | 'shelter'
  | 'physicalFragile' | 'burnFragile' | 'electroFragile' | 'frostFragile' | 'natureFragile' | 'extraFragile'
  | 'physicalVulnerable' | 'burnVulnerable' | 'electroVulnerable' | 'frostVulnerable' | 'natureVulnerable' | 'extraVulnerable'
  | 'staggerEfficiency'
  | 'physicalResist' | 'burnResist' | 'electroResist' | 'frostResist' | 'natureResist' | 'extraResist'
  | 'healEfficiency' | 'healReceivedEfficiency'
  | 'artsMastery' | 'energyRecharge'

export type StatLayer = Record<string, number>

export interface LayerBreakdown {
  base: StatLayer
  weapon: StatLayer
  equip: StatLayer
  set: StatLayer
  gains: StatLayer
  final: StatLayer
}

export interface StatDef {
  label: string
  category: string
  format: 'number' | 'percent'
}

export const STAT_DEFS: Record<string, StatDef> = {
  hp: { label: '生命值', category: '基础属性', format: 'number' },
  atk: { label: '攻击力', category: '基础属性', format: 'number' },
  def: { label: '防御力', category: '基础属性', format: 'number' },
  hpPercent: { label: '生命值%', category: '基础属性', format: 'percent' },
  atkPercent: { label: '攻击力%', category: '基础属性', format: 'percent' },
  defPercent: { label: '防御力%', category: '基础属性', format: 'percent' },
  str: { label: '力量', category: '能力值', format: 'number' },
  agi: { label: '敏捷', category: '能力值', format: 'number' },
  int: { label: '智识', category: '能力值', format: 'number' },
  wil: { label: '意志', category: '能力值', format: 'number' },
  mainAttrFlat: { label: '主能力', category: '能力值', format: 'number' },
  mainAttrPercent: { label: '主能力%', category: '能力值', format: 'percent' },
  subAttrFlat: { label: '副能力', category: '能力值', format: 'number' },
  subAttrPercent: { label: '副能力%', category: '能力值', format: 'percent' },
  critRate: { label: '暴击率', category: '暴击', format: 'percent' },
  critDamage: { label: '暴击伤害', category: '暴击', format: 'percent' },
  physicalDmgBonus: { label: '物理伤害加成', category: '伤害加成', format: 'percent' },
  burnDmgBonus: { label: '灼热伤害加成', category: '伤害加成', format: 'percent' },
  electroDmgBonus: { label: '电磁伤害加成', category: '伤害加成', format: 'percent' },
  frostDmgBonus: { label: '寒冷伤害加成', category: '伤害加成', format: 'percent' },
  natureDmgBonus: { label: '自然伤害加成', category: '伤害加成', format: 'percent' },
  extraDmgBonus: { label: '超域伤害加成', category: '伤害加成', format: 'percent' },
  normalAtkDmgBonus: { label: '普通攻击伤害加成', category: '伤害加成', format: 'percent' },
  skillDmgBonus: { label: '战技伤害加成', category: '伤害加成', format: 'percent' },
  chainDmgBonus: { label: '连携技伤害加成', category: '伤害加成', format: 'percent' },
  ultimateDmgBonus: { label: '终结技伤害加成', category: '伤害加成', format: 'percent' },
  staggerDmgBonus: { label: '对失衡目标伤害加成', category: '伤害加成', format: 'percent' },
  physicalDmgReduction: { label: '物理减免', category: '伤害减免', format: 'percent' },
  burnDmgReduction: { label: '灼热减免', category: '伤害减免', format: 'percent' },
  electroDmgReduction: { label: '电磁减免', category: '伤害减免', format: 'percent' },
  frostDmgReduction: { label: '寒冷减免', category: '伤害减免', format: 'percent' },
  natureDmgReduction: { label: '自然减免', category: '伤害减免', format: 'percent' },
  extraDmgReduction: { label: '超域减免', category: '伤害减免', format: 'percent' },
  physicalAmplify: { label: '物理增幅', category: '增幅', format: 'percent' },
  burnAmplify: { label: '灼热增幅', category: '增幅', format: 'percent' },
  electroAmplify: { label: '电磁增幅', category: '增幅', format: 'percent' },
  frostAmplify: { label: '寒冷增幅', category: '增幅', format: 'percent' },
  natureAmplify: { label: '自然增幅', category: '增幅', format: 'percent' },
  extraAmplify: { label: '超域增幅', category: '增幅', format: 'percent' },
  weaken: { label: '虚弱', category: '虚弱', format: 'percent' },
  shelter: { label: '庇护', category: '庇护', format: 'percent' },
  physicalFragile: { label: '物理脆弱', category: '脆弱', format: 'percent' },
  burnFragile: { label: '灼热脆弱', category: '脆弱', format: 'percent' },
  electroFragile: { label: '电磁脆弱', category: '脆弱', format: 'percent' },
  frostFragile: { label: '寒冷脆弱', category: '脆弱', format: 'percent' },
  natureFragile: { label: '自然脆弱', category: '脆弱', format: 'percent' },
  extraFragile: { label: '超域脆弱', category: '脆弱', format: 'percent' },
  physicalVulnerable: { label: '物理易伤', category: '易伤', format: 'percent' },
  burnVulnerable: { label: '灼热易伤', category: '易伤', format: 'percent' },
  electroVulnerable: { label: '电磁易伤', category: '易伤', format: 'percent' },
  frostVulnerable: { label: '寒冷易伤', category: '易伤', format: 'percent' },
  natureVulnerable: { label: '自然易伤', category: '易伤', format: 'percent' },
  extraVulnerable: { label: '超域易伤', category: '易伤', format: 'percent' },
  staggerEfficiency: { label: '失衡效率加成', category: '失衡', format: 'percent' },
  physicalResist: { label: '物理抗性', category: '抗性', format: 'percent' },
  burnResist: { label: '灼热抗性', category: '抗性', format: 'percent' },
  electroResist: { label: '电磁抗性', category: '抗性', format: 'percent' },
  frostResist: { label: '寒冷抗性', category: '抗性', format: 'percent' },
  natureResist: { label: '自然抗性', category: '抗性', format: 'percent' },
  extraResist: { label: '超域抗性', category: '抗性', format: 'percent' },
  healEfficiency: { label: '治疗效率加成', category: '治疗', format: 'percent' },
  healReceivedEfficiency: { label: '受治疗效率加成', category: '治疗', format: 'percent' },
  artsMastery: { label: '源石技艺强度', category: '源石技艺强度', format: 'number' },
  energyRecharge: { label: '充能效率', category: '其他', format: 'percent' },
  damageReduction: { label: '减伤率', category: '防御', format: 'percent' },
}

const GAIN_TO_STAT: Record<string, string> = {
  '基础属性|生命值': 'hp', '基础属性|生命值%': 'hpPercent',
  '基础属性|攻击力': 'atk', '基础属性|攻击力%': 'atkPercent',
  '基础属性|防御力': 'def', '基础属性|防御力%': 'defPercent',
  '能力值|力量': 'str', '能力值|敏捷': 'agi',
  '能力值|智识': 'int', '能力值|意志': 'wil',
  '能力值|主能力': 'mainAttrFlat',
  '能力值|主能力%': 'mainAttrPercent',
  '能力值|副能力': 'subAttrFlat',
  '能力值|副能力%': 'subAttrPercent',
  '暴击|暴击率': 'critRate', '暴击|暴击伤害': 'critDamage',
  '伤害加成|物理伤害加成': 'physicalDmgBonus',
  '伤害加成|灼热伤害加成': 'burnDmgBonus',
  '伤害加成|电磁伤害加成': 'electroDmgBonus',
  '伤害加成|寒冷伤害加成': 'frostDmgBonus',
  '伤害加成|自然伤害加成': 'natureDmgBonus',
  '伤害加成|超域伤害加成': 'extraDmgBonus',
  '伤害加成|普通攻击伤害加成': 'normalAtkDmgBonus',
  '伤害加成|战技伤害加成': 'skillDmgBonus',
  '伤害加成|连携技伤害加成': 'chainDmgBonus',
  '伤害加成|终结技伤害加成': 'ultimateDmgBonus',
  '伤害加成|对失衡目标伤害加成': 'staggerDmgBonus',
  '伤害减免|物理减免': 'physicalDmgReduction',
  '伤害减免|灼热减免': 'burnDmgReduction',
  '伤害减免|电磁减免': 'electroDmgReduction',
  '伤害减免|寒冷减免': 'frostDmgReduction',
  '伤害减免|自然减免': 'natureDmgReduction',
  '伤害减免|超域减免': 'extraDmgReduction',
  '增幅|物理增幅': 'physicalAmplify',
  '增幅|灼热增幅': 'burnAmplify',
  '增幅|电磁增幅': 'electroAmplify',
  '增幅|寒冷增幅': 'frostAmplify',
  '增幅|自然增幅': 'natureAmplify',
  '增幅|超域增幅': 'extraAmplify',
  '虚弱|虚弱': 'weaken',
  '庇护|庇护': 'shelter',
  '脆弱|物理脆弱': 'physicalFragile',
  '脆弱|灼热脆弱': 'burnFragile',
  '脆弱|电磁脆弱': 'electroFragile',
  '脆弱|寒冷脆弱': 'frostFragile',
  '脆弱|自然脆弱': 'natureFragile',
  '脆弱|超域脆弱': 'extraFragile',
  '易伤|物理易伤': 'physicalVulnerable',
  '易伤|灼热易伤': 'burnVulnerable',
  '易伤|电磁易伤': 'electroVulnerable',
  '易伤|寒冷易伤': 'frostVulnerable',
  '易伤|自然易伤': 'natureVulnerable',
  '易伤|超域易伤': 'extraVulnerable',
  '失衡|失衡效率加成': 'staggerEfficiency',
  '抗性|物理抗性': 'physicalResist',
  '抗性|灼热抗性': 'burnResist',
  '抗性|电磁抗性': 'electroResist',
  '抗性|寒冷抗性': 'frostResist',
  '抗性|自然抗性': 'natureResist',
  '抗性|超域抗性': 'extraResist',
  '治疗|治疗效率加成': 'healEfficiency',
  '治疗|受治疗效率加成': 'healReceivedEfficiency',
  '源石技艺强度|源石技艺强度': 'artsMastery',
}

/**
 * 增益效果分类 → 伤害乘区分类 映射表
 * 将后端的 effectCategory 映射到 DAMAGE_CATEGORIES 的 key
 */
export const GAIN_CATEGORY_TO_DAMAGE_CAT: Record<string, string> = {
  '增伤': 'DMG_Dealt',
  '易伤': 'DMG_Taken',
  '脆弱': 'Susceptibility',
  '增幅': 'Arts_Amp',
  '抗性': 'Resistance',
  '连击': 'Link',
  '失衡': 'Staggered',
  '处决': 'Finisher',
}

/**
 * 将后端 Gain 对象转换为 EffectDef 数组
 * 仅在 effectCategory 映射到 DAMAGE_CATEGORIES 时生成
 */
export function gainToEffectDef(g: {
  effectCategory?: string
  effectType?: string
  effectValue?: number
  valueType?: string
  condition?: { skillType?: string; element?: string }
}): { category: string; value: number; condition?: { skillType?: string; element?: string } } | null {
  if (!g.effectCategory || g.effectValue == null) return null
  const cat = GAIN_CATEGORY_TO_DAMAGE_CAT[g.effectCategory]
  if (!cat) return null
  const val = g.valueType === 'percentage' ? g.effectValue : g.effectValue
  return { category: cat, value: val, condition: g.condition }
}

const DESC_TO_STAT: Record<string, string> = {
  '力量': 'str', '敏捷': 'agi', '智识': 'int', '意志': 'wil',
  '攻击力': 'atkPercent', '生命值': 'hpPercent', '防御力': 'defPercent',
  '物理伤害加成': 'physicalDmgBonus',
  '灼热伤害加成': 'burnDmgBonus',
  '电磁伤害加成': 'electroDmgBonus',
  '寒冷伤害加成': 'frostDmgBonus',
  '自然伤害加成': 'natureDmgBonus',
  '超域伤害加成': 'extraDmgBonus',
  '暴击率': 'critRate', '暴击伤害': 'critDamage',
  '治疗效果加成': 'healEfficiency',
  '受治疗效率加成': 'healReceivedEfficiency',
  '源石技艺强度': 'artsMastery',
  '伤害加成': 'damageBonus',
  '增伤': 'damageBonus',
  '充能效率': 'energyRecharge',
  '充能': 'energyRecharge',
  '基础防御力': 'def',
}

export function classifyGain(g: { effectCategory?: string; effectType?: string }): string | undefined {
  if (!g.effectCategory || !g.effectType) return undefined
  return GAIN_TO_STAT[`${g.effectCategory}|${g.effectType}`]
}

export function descToStat(desc: string): string | undefined {
  return DESC_TO_STAT[desc]
}

export function formatStatValue(key: string, val: number, defs: Record<string, StatDef> = STAT_DEFS): string {
  const d = defs[key]
  if (d?.format === 'percent') return `${(val).toFixed(2)}%`
  return `${val.toFixed(2)}`
}

export function addToLayer(layer: StatLayer, key: string, value: number) {
  layer[key] = (layer[key] || 0) + value
}

export function buildBaseLayer(char: CharConfig): StatLayer {
  const layer: StatLayer = {}
  layer['hp'] = char.baseHp
  layer['atk'] = char.baseAtk
  layer['str'] = char.baseStr
  layer['agi'] = char.baseAgi
  layer['int'] = char.baseInt
  layer['wil'] = char.baseWil
  layer['critRate'] = 5
  layer['critDamage'] = 50
  return layer
}

export function buildWeaponLayer(
  weapon: { baseAtk: number; affix1Type?: string; affix1Value?: number; affix2Type?: string; affix2Value?: number }
): StatLayer {
  const layer: StatLayer = {}
  if (weapon.baseAtk) layer['atk'] = (layer['atk'] || 0) + weapon.baseAtk
  const affVal1 = weapon.affix1Value ?? 0
  const affType1 = weapon.affix1Type
  if (affVal1 && affType1) {
    const sk = ['str', 'agi', 'int', 'wil'].includes(affType1) ? affType1 : undefined
    if (sk) layer[sk] = (layer[sk] || 0) + affVal1
  }
  const affVal2 = weapon.affix2Value ?? 0
  const affType2 = weapon.affix2Type
  if (affVal2 && affType2) {
    if (['str', 'agi', 'int', 'wil'].includes(affType2)) {
      layer[affType2] = (layer[affType2] || 0) + affVal2
    } else {
      // Map affix key to stat key (atk→atkPercent, hp→hpPercent, etc.)
      const AFFIX_MAP: Record<string, string> = {
        atk: 'atkPercent',
        hp: 'hpPercent',
        phydam: 'physicalDmgBonus',
        crit_up: 'critRate', crirate: 'critRate',
        heal_up: 'healEfficiency',
        poise_up: 'staggerEfficiency',
        phy_spell_up: 'artsMastery',
      }
      const mapped = AFFIX_MAP[affType2] || affType2
      const d = STAT_DEFS[mapped]
      const val = d?.format === 'percent' ? affVal2 * 100 : affVal2
      layer[mapped] = (layer[mapped] || 0) + val
    }
  }
  return layer
}

export function equipSubStatsToLayer(items: Array<{ desc: string; value: number }>): StatLayer {
  const layer: StatLayer = {}
  for (const item of items) {
    const sk = DESC_TO_STAT[item.desc]
    if (sk) {
      const d = STAT_DEFS[sk]
      const val = d?.format === 'percent' ? item.value * 100 : item.value
      addToLayer(layer, sk, val)
    }
  }
  return layer
}

export function buildGainsLayer(gains: Array<{
  effectCategory?: string; effectType?: string; effectValue?: number; valueType?: string
}>): StatLayer {
  const layer: StatLayer = {}
  for (const g of gains) {
    if (!g.effectValue) continue
    const sk = classifyGain(g)
    if (sk) {
      const val = g.valueType === 'percentage' ? g.effectValue : g.effectValue
      addToLayer(layer, sk, val)
    }
  }
  return layer
}

/**
 * 将装备套组效果转换为 StatLayer
 * @param setEffects - 装备的 set_effect1/2 字段数组，每个包含 name/type/etype/value
 * @param activeSetNames - 已激活(>=3件)的套装名称列表
 */
export function buildSetEffectsLayer(
  setEffects: Array<{ setName: string; etype?: string; value?: number; desc?: string }>,
  activeSetNames: string[]
): StatLayer {
  const layer: StatLayer = {}
  for (const eff of setEffects) {
    if (!eff.setName || !activeSetNames.includes(eff.setName)) continue
    if (eff.value == null || !eff.etype) continue
    // etype 到 StatKey 的映射
    const ETYPE_MAP: Record<string, string> = {
      hp: 'hp', hp_up: 'hpPercent', atk: 'atkPercent', def: 'defPercent',
      str: 'str', agi: 'agi', int: 'int', wil: 'wil',
      crit_rate: 'critRate', crit_damage: 'critDamage',
      phys_dmg_up: 'physicalDmgBonus', phy_dmg_up: 'physicalDmgBonus',
      burn_dmg_up: 'burnDmgBonus', blaze_dmg_up: 'burnDmgBonus',
      electro_dmg_up: 'electroDmgBonus', emag_dmg_up: 'electroDmgBonus',
      frost_dmg_up: 'frostDmgBonus', cold_dmg_up: 'frostDmgBonus',
      nature_dmg_up: 'natureDmgBonus', extra_dmg_up: 'extraDmgBonus',
      all_dmg_up: 'damageBonus',
      skill_dmg_up: 'skillDmgBonus',
      link_dmg_up: 'chainDmgBonus',
      ult_dmg_up: 'ultimateDmgBonus',
      normal_atk_dmg_up: 'normalAtkDmgBonus',
      stagger_dmg_up: 'staggerDmgBonus',
      heal_eff_up: 'healEfficiency',
      arts_mastery: 'artsMastery',
      ult_charge_eff: 'energyRecharge',
      def_up: 'def',
    }
    const sk = ETYPE_MAP[eff.etype]
    if (sk) {
      addToLayer(layer, sk, eff.value)
    }
  }
  return layer
}

export function mergeLayers(layers: StatLayer[]): StatLayer {
  const result: StatLayer = {}
  for (const layer of layers) {
    for (const [key, val] of Object.entries(layer)) {
      result[key] = (result[key] || 0) + val
    }
  }
  return result
}

export function computeDerivedFinal(allLayers: StatLayer[], char: CharConfig): StatLayer {
  const raw = mergeLayers(allLayers)

  // Apply mainAttrFlat/subAttrFlat to raw attributes first (so attrBonus includes trust)
  const mainAttrFlat = raw['mainAttrFlat'] || 0
  const subAttrFlat = raw['subAttrFlat'] || 0
  if (mainAttrFlat > 0) raw[char.mainAttr] = (raw[char.mainAttr] || 0) + mainAttrFlat
  if (subAttrFlat > 0) raw[char.subAttr] = (raw[char.subAttr] || 0) + subAttrFlat
  delete raw['mainAttrFlat']
  delete raw['subAttrFlat']

  const final: StatLayer = { ...raw }

  // attrBonus
  const mainVal = getAttrVal(raw.str || 0, raw.agi || 0, raw.int || 0, raw.wil || 0, char.mainAttr)
  const subVal = getAttrVal(raw.str || 0, raw.agi || 0, raw.int || 0, raw.wil || 0, char.subAttr)
  const attrBonus = Math.floor(mainVal) * 0.005 + Math.floor(subVal) * 0.002
  final['attrBonus'] = attrBonus

  // Final attack: (baseAtk + weapon atk) * (1 + atkPercent/100) * (1 + attrBonus)
  const baseAtk = char.baseAtk
  const weaponAtk = (raw['atk'] || 0) - baseAtk
  const atkPercent = raw['atkPercent'] || 0
  if (atkPercent > 0 || attrBonus > 0) {
    final['atk'] = (baseAtk + weaponAtk) * (1 + (atkPercent / 100)) * (1 + attrBonus)
  }

  // Final hp: baseHp * (1 + hpPercent) + strHpBonus
  const baseHp = char.baseHp
  const hpPercent = raw['hpPercent'] || 0
  const strHpBonus = 5 * Math.floor(raw['str'] || 0)
  final['hp'] = baseHp * (1 + hpPercent / 100) + strHpBonus

  // defense: raw.def (from equipment baseDef)
  const defense = raw['def'] || 0
  final['defense'] = defense
  final['damageReduction'] = defense > 0 ? (defense / (defense + 100)) * 100 : 0

  // Physical resist from agi
  const agi = Math.floor(raw['agi'] || 0)
  final['physicalResist'] = agi > 0 ? Math.ceil(100 - 100 / (0.001 * agi + 1)) : 0

  // Elemental resists from int (distribute to all four element resist types)
  const intel = Math.floor(raw['int'] || 0)
  const er = intel > 0 ? Math.ceil(100 - 100 / (0.001 * intel + 1)) : 0
  if (er > 0) {
    final['burnResist'] = (final['burnResist'] || 0) + er
    final['electroResist'] = (final['electroResist'] || 0) + er
    final['frostResist'] = (final['frostResist'] || 0) + er
    final['natureResist'] = (final['natureResist'] || 0) + er
  }

  // healEfficiency from wil
  const wil = Math.floor(raw['wil'] || 0)
  if (wil > 0) final['healEfficiency'] = (final['healEfficiency'] || 0) + 0.1 * wil

  // Remove intermediate values already reflected in final stats
  delete final['atkPercent']
  delete final['attrBonus']
  delete final['strHpBonus']

  return final
}

const trustMap: Record<number, number> = { 1: 10, 2: 25, 3: 40, 4: 60 }

function matchAttr(type: string | undefined, target: string): number {
  if (!type) return 0
  if (type === target) return 1
  if ((type === 'str' || type === '力量') && target === 'str') return 1
  if ((type === 'agi' || type === '敏捷') && target === 'agi') return 1
  if ((type === 'int' || type === '智识') && target === 'int') return 1
  if ((type === 'wil' || type === '意志') && target === 'wil') return 1
  return 0
}

export function calcFinalStats(
  char: CharConfig,
  weapon: WeaponConfig,
  equip: EquipStats,
): FinalStats {
  const trustBonus = trustMap[char.trustLevel] || 0
  const weaponBonusVal = weapon.affix1Value ?? 0

  const str = calcStat({
    base: char.baseStr, trustBonus, weaponBonus: matchAttr(weapon.affix1Type, 'str') * weaponBonusVal,
    equipBonus: equip.str, percentBonus: 0,
  })
  const agi = calcStat({
    base: char.baseAgi, trustBonus, weaponBonus: matchAttr(weapon.affix1Type, 'agi') * weaponBonusVal,
    equipBonus: equip.agi, percentBonus: 0,
  })
  const int = calcStat({
    base: char.baseInt, trustBonus, weaponBonus: matchAttr(weapon.affix1Type, 'int') * weaponBonusVal,
    equipBonus: equip.int, percentBonus: 0,
  })
  const wil = calcStat({
    base: char.baseWil, trustBonus, weaponBonus: matchAttr(weapon.affix1Type, 'wil') * weaponBonusVal,
    equipBonus: equip.wil, percentBonus: 0,
  })

  const mainVal = getAttrVal(str, agi, int, wil, char.mainAttr)
  const subVal = getAttrVal(str, agi, int, wil, char.subAttr)
  const attrBonus = Math.floor(mainVal) * 0.005 + Math.floor(subVal) * 0.002

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
  const artsMastery = equip.artsMastery
  const energyRecharge = equip.energyRecharge

  const defense = equip.baseDef
  const damageReduction = defense > 0 ? defense / (defense + 100) : 0

  const mainInt = Math.floor(int)
  const mainAgi = Math.floor(agi)
  const physicalResist = mainAgi > 0 ? 100 - 100 / (0.001 * mainAgi + 1) : 0
  const magicResist = mainInt > 0 ? 100 - 100 / (0.001 * mainInt + 1) : 0

  const mainWil = Math.floor(wil)
  const strHpBonus = 5 * Math.floor(str)
  const healEfficiency = mainWil > 0 ? 0.001 * mainWil : 0

  return { attack, hp, defense, damageReduction, str, agi, int, wil, attrBonus, strHpBonus, healEfficiency, defPercent, critRate, critDamage, damageBonus, artsMastery, energyRecharge, physicalResist, magicResist }
}

function getAttrVal(str: number, agi: number, int: number, wil: number, attr: string): number {
  switch (attr) {
    case 'str': return str; case 'agi': return agi
    case 'int': return int; case 'wil': return wil
    default: return 0
  }
}
