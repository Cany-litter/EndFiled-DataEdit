export const elementMap: Record<string,string> = { pyro:'灼热', cryo:'寒冷', electro:'电磁', natural:'自然', physical:'物理' }
export const weaponMap: Record<string,string> = { sword:'单手剑', greatsword:'双手剑', polearm:'长柄武器', pistol:'手铳', caster_unit:'施术单元' }
export const professionMap: Record<string,string> = { assault:'突击', guard:'近卫', caster:'术师', heavy:'重装', vanguard:'先锋', support:'辅助' }
export const slotMap: Record<string,string> = { armor:'护甲', glove:'护手', accessory:'配件' }
export const skillTypeMap: Record<string,string> = {
  normal:'普通攻击', charged:'普通攻击·重击', execution:'普通攻击·处决', plunge:'普通攻击·下落攻击',
  skill:'战技', chain:'连携技', ultimate:'终结技',
  talent1:'天赋1', talent2:'天赋2', other:'其他',
}
export const mapSkillType = (v:string) => skillTypeMap[v] ?? v
export const damageTypeMap: Record<string,string> = { ...elementMap, ultra:'真实', true:'纯粹', other:'其他' }
export const attrTypeMap: Record<string,string> = { str:'力量', agi:'敏捷', int:'智识', wil:'意志' }
export const gainTypeMap: Record<string,string> = { permanent:'常驻', limited:'限定' }
export const valueTypeMap: Record<string,string> = { absolute:'固定值', percentage:'百分比' }
export const stackRuleMap: Record<string,string> = { add_same:'同名加算', multi_diff:'独立乘区' }
export const targetScopeMap: Record<string,string> = { self:'自身', team:'全队', character:'指定角色' }
export const affixSizeMap: Record<string,string> = { small:'小', medium:'中', large:'大' }
export const mapElement = (v:string) => elementMap[v] ?? v
export const mapWeapon = (v:string) => weaponMap[v] ?? v
export const mapProfession = (v:string) => professionMap[v] ?? v
export const mapSlot = (v:string) => slotMap[v] ?? v
export const mapDamageType = (v:string) => damageTypeMap[v] ?? v
export const mapAttrType = (v:string) => attrTypeMap[v] ?? v
export const mapGainType = (v:string) => gainTypeMap[v] ?? v
export const mapValueType = (v:string) => valueTypeMap[v] ?? v
export const mapStackRule = (v:string) => stackRuleMap[v] ?? v
export const mapTargetScope = (v:string) => targetScopeMap[v] ?? v
export const mapAffixSize = (v:string) => affixSizeMap[v] ?? v
export function formatPct(val: number | null | undefined): string {
  if (val == null) return ''
  if (Math.abs(val) < 1) return (val * 100).toFixed(2).replace(/\.?0+$/, '') + '%'
  return String(val)
}
export const elementOpts = Object.entries(elementMap)
export const weaponOpts = Object.entries(weaponMap)
export const professionOpts = Object.entries(professionMap)
export const slotOpts = Object.entries(slotMap)
export const skillTypeOpts = Object.entries(skillTypeMap)
export const damageTypeOpts = Object.entries(damageTypeMap)
export const attrTypeOpts = Object.entries(attrTypeMap)
export const gainTypeOpts = Object.entries(gainTypeMap)
export const valueTypeOpts = Object.entries(valueTypeMap)
export const stackRuleOpts = Object.entries(stackRuleMap)
export const targetScopeOpts = Object.entries(targetScopeMap)
export const affixSizeOpts = Object.entries(affixSizeMap)

export const sourceTypeOpts = [
  ['character', '角色'],
  ['weapon', '武器'],
  ['set', '套装'],
  ['other', '其他'],
]

export const gainCategoryEffectTypes: Record<string, string[]> = {
  '基础属性': ['生命值', '生命值%', '攻击力', '攻击力%', '防御力', '防御力%'],
  '能力值': ['力量', '敏捷', '智识', '意志', '主能力', '主能力%', '副能力', '副能力%'],
  '暴击': ['暴击率', '暴击伤害'],
  '伤害加成': ['物理伤害加成', '灼热伤害加成', '电磁伤害加成', '寒冷伤害加成', '自然伤害加成', '超域伤害加成', '普通攻击伤害加成', '战技伤害加成', '连携技伤害加成', '终结技伤害加成', '对失衡目标伤害加成'],
  '伤害减免': ['物理减免', '灼热减免', '电磁减免', '寒冷减免', '自然减免', '超域减免'],
  '增幅': ['物理增幅', '灼热增幅', '电磁增幅', '寒冷增幅', '自然增幅', '超域增幅'],
  '虚弱': ['虚弱'],
  '庇护': ['庇护'],
  '脆弱': ['物理脆弱', '灼热脆弱', '电磁脆弱', '寒冷脆弱', '自然脆弱', '超域脆弱'],
  '易伤': ['物理易伤', '灼热易伤', '电磁易伤', '寒冷易伤', '自然易伤', '超域易伤'],
  '失衡': ['失衡效率加成'],
  '抗性': ['物理抗性', '灼热抗性', '电磁抗性', '寒冷抗性', '自然抗性', '超域抗性'],
  '连击': ['连击'],
  '治疗': ['治疗效率加成', '受治疗效率加成'],
  '源石技艺强度': ['源石技艺强度'],
  '等级系数': ['90级物理异常[1.227倍独立加成]', '90级法术异常[1.454倍独立加成]'],
  '其他': [],
}

/** 清理技能描述中的 akedb 富文本标签，保留纯文本和换行 */
export function cleanSkillDesc(desc: string | null | undefined): string {
  if (!desc) return ''
  return desc.replace(/<[^>]+>/g, '').replace(/\\n/g, '\n')
}

export const durationTypeOpts = [
  ['permanent', '常驻'],
  ['limited', '限时'],
]

export const anomalyTypeMap: Record<string, string> = {
  break: '破防', armor_break: '碎甲', stagger: '猛击', knockdown: '倒地', knockup: '击飞',
  blaze_attach: '灼热附着', emag_attach: '电磁附着', cold_attach: '寒冷附着', nature_attach: '自然附着',
  blaze_burst: '灼热爆发', emag_burst: '电磁爆发', cold_burst: '寒冷爆发', nature_burst: '自然爆发',
  burning: '燃烧', conductive: '导电', frozen: '冻结', ice_shatter: '碎冰', corrosion: '腐蚀',
  physical_vulnerable: '物理脆弱', spell_vulnerable: '法术脆弱', affix_slow: '减速',
  weak: '虚弱', pulse_enhance: '脉冲增强', fire_enhance: '火焰增强',
  cryst_enhance: '结晶增强', natural_enhance: '自然增强',
  skillwater: '技能水', comboskillwater: '连携水', endmin_debuff: '源石封印',
}
export const mapAnomalyType = (v: string) => anomalyTypeMap[v] ?? v
export const anomalyTypeOpts = Object.entries(anomalyTypeMap)

/** 技能短名称：时间轴中简化为 "普1" "战2" "终F" 等 */
const SHORT_PREFIX: Record<string, string> = {
  normal: '普', charged: '重', execution: '处', plunge: '落',
  skill: '战', chain: '连', ultimate: '终',
  talent1: '天1', talent2: '天2', other: '?',
}
export function skillShortName(type: string, skillId: string): string {
  const prefix = SHORT_PREFIX[type]
  if (!prefix) return type
  if (skillId.endsWith('_finisher')) return '终F'
  if (type.startsWith('talent')) return prefix
  const m = skillId.match(/_(\d+)$/)
  if (m) return prefix + m[1]
  return prefix
}
