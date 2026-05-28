const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mapped');

function round4(v) { return Math.round(v * 10000) / 10000; }

const KEY_MAP = {
  'str': { cat: '能力值', type: '力量', vt: 'absolute' },
  'agi': { cat: '能力值', type: '敏捷', vt: 'absolute' },
  'wisd': { cat: '能力值', type: '智识', vt: 'absolute' },
  'will': { cat: '能力值', type: '意志', vt: 'absolute' },
  'mainattr': { cat: '能力值', type: '主能力', vt: 'absolute' },
  'primary_attr_up': { cat: '能力值', type: '主能力%', vt: 'percentage' },
  'second_attr_up': { cat: '能力值', type: '副能力%', vt: 'percentage' },
  'all_attr_up': { cat: '能力值', type: '主能力%', vt: 'percentage' },
  'atk': { cat: '基础属性', type: '攻击力%', vt: 'percentage' },
  'hp': { cat: '基础属性', type: '生命值%', vt: 'percentage' },
  'hp_up': { cat: '基础属性', type: '生命值', vt: 'absolute' },
  'def_up': { cat: '基础属性', type: '防御力%', vt: 'percentage' },
  'hp_add': { cat: '基础属性', type: '生命值', vt: 'absolute' },
  'phydam': { cat: '伤害加成', type: '物理伤害加成', vt: 'percentage' },
  'firedam': { cat: '伤害加成', type: '灼热伤害加成', vt: 'percentage' },
  'electrondam': { cat: '伤害加成', type: '电磁伤害加成', vt: 'percentage' },
  'crystdam': { cat: '伤害加成', type: '寒冷伤害加成', vt: 'percentage' },
  'naturaldam': { cat: '伤害加成', type: '自然伤害加成', vt: 'percentage' },
  'spelldam': { cat: '伤害加成', type: '超域伤害加成', vt: 'percentage' },
  'crit_up': { cat: '暴击', type: '暴击率', vt: 'percentage' },
  'crirate': { cat: '暴击', type: '暴击率', vt: 'percentage' },
  'poise_up': { cat: '失衡', type: '失衡效率加成', vt: 'percentage' },
  'heal_up': { cat: '治疗', type: '治疗效率加成', vt: 'percentage' },
  'phy_spell_up': { cat: '源石技艺强度', type: '源石技艺强度', vt: 'absolute' },
  'physpell': { cat: '源石技艺强度', type: '源石技艺强度', vt: 'absolute' },
  // Conditional _up keys (affix3 / set effects)
  'dmg_up': { cat: '伤害加成', type: '全伤害加成', vt: 'percentage' },
  'dmg_up2': { cat: '伤害加成', type: '全伤害加成', vt: 'percentage' },
  'phy_dmg_up': { cat: '伤害加成', type: '物理伤害加成', vt: 'percentage' },
  'phy_damage_up': { cat: '伤害加成', type: '物理伤害加成', vt: 'percentage' },
  'spell_dmg_up': { cat: '伤害加成', type: '超域伤害加成', vt: 'percentage' },
  'fire_dmg_up': { cat: '伤害加成', type: '灼热伤害加成', vt: 'percentage' },
  'pulse_dmg_up': { cat: '伤害加成', type: '电磁伤害加成', vt: 'percentage' },
  'cryst_dmg_up': { cat: '伤害加成', type: '寒冷伤害加成', vt: 'percentage' },
  'nature_dmg_up': { cat: '伤害加成', type: '自然伤害加成', vt: 'percentage' },
  'normal_atk_up': { cat: '伤害加成', type: '普通攻击伤害加成', vt: 'percentage' },
  'skill_dmg_up': { cat: '伤害加成', type: '战技伤害加成', vt: 'percentage' },
  'spell_up': { cat: '伤害加成', type: '全伤害加成', vt: 'percentage' },
  'dmg_taken_down': { cat: '伤害减免', type: '物理减免', vt: 'percentage' },
  'dmg_taken_down2': { cat: '伤害减免', type: '物理减免', vt: 'percentage' },
  'comboskill_cooldown': { cat: '其他', type: '连携技冷却缩减', vt: 'percentage' },
  'ultimate_gain_up': { cat: '其他', type: '终结技充能效率', vt: 'percentage' },
  'atb_recover': { cat: '其他', type: '技力回复', vt: 'absolute' },
};

const POTENTIAL_KEY_MAP = {
  'Str': { cat: '能力值', type: '力量', vt: 'absolute' },
  'Agi': { cat: '能力值', type: '敏捷', vt: 'absolute' },
  'Wisd': { cat: '能力值', type: '智识', vt: 'absolute' },
  'PhysicalDamageIncrease': { cat: '伤害加成', type: '物理伤害加成', vt: 'percentage' },
  'HealOutputIncrease': { cat: '治疗', type: '治疗效率加成', vt: 'percentage' },
};

const TRUST_GAINS = [
  { id: 'gain_trust_1', name: '信赖1+能力值+10', val: 10 },
  { id: 'gain_trust_2', name: '信赖2+能力值+25', val: 25 },
  { id: 'gain_trust_3', name: '信赖3+能力值+40', val: 40 },
  { id: 'gain_trust_4', name: '信赖4+能力值+60', val: 60 },
];

function last(arr) { return arr ? arr[arr.length - 1] : null; }

function gainName(source, cat, val, vt) {
  return `${source}+${cat}+${round4(val)}${vt === 'percentage' ? '%' : ''}`;
}

// Weapon affix3 only (conditional weapon skills)
function mapWeaponGains(w) {
  const gains = [];
  const skilllist = w.skilllist || [];
  if (skilllist.length < 3) return gains;
  const aff = skilllist[2];
  if (!aff || !aff.blackboard) return gains;
  const src = `武器-${w.name}-词条3`;
  for (const bb of aff.blackboard) {
    if (!bb.key) continue;
    const m = KEY_MAP[bb.key];
    if (!m) continue;
    const valArr = bb.value;
    if (!Array.isArray(valArr) || !valArr.length) continue;
    const val = last(valArr);
    const pctVal = m.vt === 'percentage' ? round4(val * 100) : val;
    const duration = aff.blackboard.find(b => b.key === 'duration')?.value;
    const maxStacks = aff.blackboard.find(b => b.key === 'max_stack')?.value;
    gains.push({
      id: `gain_wpn_${w.id}_aff3_${bb.key}`,
      name: gainName(src, m.cat, pctVal, m.vt),
      source: w.name,
      gainType: 'limited',
      sourceType: 'weapon',
      sourceRefId: w.id,
      effectCategory: m.cat,
      effectType: m.type,
      effectValue: pctVal,
      valueType: m.vt,
      stackRule: 'add_same',
      targetScope: 'self',
      triggerCondition: '触发条件待补充',
      duration: duration ? last(duration) : null,
      maxStacks: maxStacks ? last(maxStacks) : 1,
    });
  }
  return gains;
}

// Equipment set effects only
function mapEquipSetGains(suit) {
  const gains = [];
  const setEffects = suit.value || {};
  const src = `装备-${suit['套组名称']}-套装效果`;
  for (const [key, val] of Object.entries(setEffects)) {
    const m = KEY_MAP[key];
    if (!m) continue;
    if (['duration', 'duration2', 'cd', 'hp_ratio', 'hp_ratio_c', 'stack_cond', 'max_stack'].includes(key)) continue;
    const pctVal = m.vt === 'percentage' ? round4(val * 100) : val;
    gains.push({
      id: `gain_equip_${suit.suitID}_set_${key}`,
      name: gainName(src, m.cat, pctVal, m.vt),
      source: suit['套组名称'],
      gainType: 'permanent',
      sourceType: 'set',
      sourceRefId: suit['套组名称'],
      effectCategory: m.cat,
      effectType: m.type,
      effectValue: pctVal,
      valueType: m.vt,
      stackRule: 'add_same',
      targetScope: 'self',
      triggerCondition: null,
      duration: setEffects.duration || null,
      maxStacks: setEffects.max_stack || 1,
    });
  }
  return gains;
}

// Character potentials
function mapCharacterPotentialGains(c) {
  const gains = [];
  if (!c.potentials || !Array.isArray(c.potentials)) return gains;
  for (let pi = 0; pi < c.potentials.length; pi++) {
    const pot = c.potentials[pi];
    if (!pot || !pot.values) continue;
    for (const [key, val] of Object.entries(pot.values)) {
      const m = POTENTIAL_KEY_MAP[key];
      if (!m) continue;
      if (val == null || val === 0) continue;
      const pctVal = m.vt === 'percentage' ? round4(val * 100) : val;
      const src = `角色-${c.name}-潜能${pi+1}`;
      gains.push({
        id: `gain_chr_${c.id}_potential${pi+1}_${key}`,
        name: gainName(src, m.cat, pctVal, m.vt),
        source: c.name,
        gainType: 'permanent',
        sourceType: 'character',
        sourceRefId: c.id,
        effectCategory: m.cat,
        effectType: m.type,
        effectValue: pctVal,
        valueType: m.vt,
        stackRule: 'add_same',
        targetScope: 'self',
        triggerCondition: null,
        duration: null,
        maxStacks: 1,
      });
    }
  }
  return gains;
}

// Trust level gains (4 fixed entries, not per-character)
function mapTrustGains() {
  return TRUST_GAINS.map(t => ({
    id: t.id,
    name: t.name,
    source: t.name.split('+')[0],
    gainType: 'permanent',
    sourceType: 'other',
    effectCategory: '能力值',
    effectType: '主能力',
    effectValue: t.val,
    valueType: 'absolute',
    stackRule: 'add_same',
    targetScope: 'self',
    triggerCondition: null,
    duration: null,
    maxStacks: 1,
  }));
}

function main() {
  console.log('=== 增益数据提取开始 ===\n');

  let allGains = [];

  // Weapon affix3 only
  const weapons = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'weapons.json'), 'utf8'));
  for (const w of weapons) allGains.push(...mapWeaponGains(w));
  console.log(`武器增益(仅词条3): ${allGains.filter(g => g.id.startsWith('gain_wpn')).length} 条`);

  // Equipment set effects only
  const equips = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'equips.json'), 'utf8'));
  const equipBefore = allGains.length;
  for (const suit of equips) allGains.push(...mapEquipSetGains(suit));
  console.log(`装备增益(仅套装效果): ${allGains.length - equipBefore} 条`);

  // Character potentials
  const characters = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'characters.json'), 'utf8'));
  const potBefore = allGains.length;
  for (const c of characters) allGains.push(...mapCharacterPotentialGains(c));
  console.log(`角色潜能增益: ${allGains.length - potBefore} 条`);

  // Trust gains (fixed 4 entries)
  const trustBefore = allGains.length;
  allGains.push(...mapTrustGains());
  console.log(`信赖增益: ${allGains.length - trustBefore} 条`);

  fs.writeFileSync(path.join(DATA_DIR, 'gains.json'), JSON.stringify(allGains, null, 2));
  console.log(`\n总增益: ${allGains.length} 条`);
  console.log('输出到:', path.join(DATA_DIR, 'gains.json'));
}

main();
