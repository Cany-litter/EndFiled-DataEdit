/**
 * AKEDatabase → 数据模型 映射脚本
 *
 * 将 data/akedb/ 下的原始 JSON 映射为应用数据格式
 * 用法: node scripts/map-akedb.js
 */

const fs = require('fs');
const path = require('path');

const RAW_DIR = path.join(__dirname, '..', 'data', 'akedb');
const OUT_DIR = path.join(__dirname, '..', 'data', 'mapped');

const WEAPON_TYPE_MAP = { '1': 'sword', '2': 'caster_unit', '3': 'greatsword', '5': 'polearm', '6': 'pistol' };

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function loadDir(dir) {
  const p = path.join(RAW_DIR, dir);
  if (!fs.existsSync(p)) return [];
  return fs.readdirSync(p)
    .filter(f => f.endsWith('.json') && f !== 'manifest.json')
    .map(f => JSON.parse(fs.readFileSync(path.join(p, f), 'utf-8')));
}

/** 映射角色 */
function mapCharacter(raw) {
  const g = raw.growth || {};
  return {
    id: raw.charId,
    name: raw.name,
    charType: raw.charType,
    rarity: raw.rarity,
    weaponType: raw.weapontype,
    profession: raw.profession,
    mainAttrType: raw.mainAttrType,
    subAttrType: raw.subAttrType,
    charBattleTag: raw.charBattleTag || [],
    growth: {
      力量: g['力量'] || [], 敏捷: g['敏捷'] || [],
      智识: g['智识'] || [], 意志: g['意志'] || [],
      生命值: g['生命值'] || [], 攻击力: g['攻击力'] || [],
      法术异常伤害系数: g['法术异常伤害系数'] || [],
      物理异常伤害系数: g['物理异常伤害系数'] || [],
    },
    talents: raw.talents || [],
    potentials: raw.potentials || [],
    skills: raw.skill ? Object.entries(raw.skill).map(([id, s]) => ({
      id, name: s.name,
      values: { atk_scale: s.values?.atk_scale || [], costValue: s.values?.costValue || [], coolDown: s.values?.coolDown }
    })) : [],
  };
}

/** 映射武器 */
function mapWeapon(raw) {
  return {
    id: raw.weaponId,
    name: raw.title,
    rarity: raw.rarity,
    weaponType: WEAPON_TYPE_MAP[String(raw.weapontype)] || String(raw.weapontype),
    baseAtk: raw.baseAtk || [],
    skilllist: (raw.skilllist || []).map(s => ({
      skillName: s.skillName,
      blackboard: (s.blackboard || []).map(b => ({ key: b.key, value: b.value || [] }))
    })),
  };
}

/** 映射装备 */
function mapEquipment(raw) {
  const equip = raw.equip || {};
  const items = Object.entries(equip).map(([id, e]) => ({
    id, name: e.name, 部位: e['部位'],
    主词条: e['主词条'] ? { desc: e['主词条'].desc, value: e['主词条'].value } : null,
    副词条: e['副词条'] ? Object.entries(e['副词条']).map(([k, v]) => ({ key: k, desc: v.desc, value: v.value })) : [],
  }));
  return { suitID: raw.suitID, 套组名称: raw['套组名称'], value: raw.value, items };
}

function main() {
  console.log('=== 数据映射开始 ===\n');

  const characters = loadDir('character').map(mapCharacter);
  fs.writeFileSync(path.join(OUT_DIR, 'characters.json'), JSON.stringify(characters, null, 2));
  console.log(`角色: ${characters.length}`);

  const weapons = loadDir('weapon').map(mapWeapon);
  fs.writeFileSync(path.join(OUT_DIR, 'weapons.json'), JSON.stringify(weapons, null, 2));
  console.log(`武器: ${weapons.length}`);

  const equips = loadDir('equip').map(mapEquipment);
  fs.writeFileSync(path.join(OUT_DIR, 'equips.json'), JSON.stringify(equips, null, 2));
  console.log(`装备(套装): ${equips.length}`);

  console.log('\n映射完成, 输出到:', OUT_DIR);
}

ensureDir(OUT_DIR);
main();
