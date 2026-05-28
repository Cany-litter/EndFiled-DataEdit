const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'mapped');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'endfiled',
};

function last(arr) { return arr[arr.length - 1]; }

// Map Chinese names to internal keys
const ELEMENT_MAP = { '物理': 'physical', '电磁': 'electro', '灼热': 'pyro', '寒冷': 'cryo', '自然': 'natural' };
const WEAPON_TYPE_MAP = {
  '单手剑': 'sword', '大剑': 'greatsword', '长枪': 'polearm',
  '法杖': 'staff', '弓': 'bow', '医疗': 'medical',
  '施术单元': 'caster_unit', '手铳': 'pistol', '双手剑': 'greatsword', '长柄武器': 'polearm',
};
const SLOT_MAP = { '护甲': 'armor', '护手': 'glove', '配件': 'accessory' };
const ATTR_MAP = { '力量': 'str', '敏捷': 'agi', '智识': 'int', '意志': 'wil' };

const AFFIX_SIZE_MAP = { '小': 'small', '中': 'medium', '大': 'large' };

function skillTypeFromId(id) {
  if (id.includes('_talent_1')) return 'talent1';
  if (id.includes('_talent_2')) return 'talent2';
  if (id.includes('NormalAttack')) return 'normal';
  if (id.includes('NormalSkill')) return 'skill';
  if (id.includes('ComboSkill')) return 'chain';
  if (id.includes('UltimateSkill')) return 'ultimate';
  return 'other';
}

async function main() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log('Connected to MySQL endfiled');

  // Read mapped data
  const characters = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'characters.json'), 'utf8'));
  const weapons = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'weapons.json'), 'utf8'));
  const equipsList = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'equips.json'), 'utf8'));

  // ------- Import characters -------
  console.log(`\nImporting ${characters.length} characters...`);
  let charCount = 0;
  for (const c of characters) {
    // Use growth arrays at index 89 (0-based, = level 90)
    const LV90 = 89
    const baseHp = (c.growth['生命值'] || [])[LV90] ?? 0;
    const baseAtk = (c.growth['攻击力'] || [])[LV90] ?? 0;
    const baseStr = (c.growth['力量'] || [])[LV90] ?? 0;
    const baseAgi = (c.growth['敏捷'] || [])[LV90] ?? 0;
    const baseInt = (c.growth['智识'] || [])[LV90] ?? 0;
    const baseWil = (c.growth['意志'] || [])[LV90] ?? 0;

    await conn.execute(
      `INSERT INTO \`character\`
       (id, name, rarity, level, base_hp, base_atk, base_str, base_agi, base_int, base_wil,
        main_attr, sub_attr, profession, element, weapon_type)
       VALUES (?, ?, ?, 90, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name), rarity = VALUES(rarity), level = VALUES(level),
         base_hp = VALUES(base_hp), base_atk = VALUES(base_atk),
         base_str = VALUES(base_str), base_agi = VALUES(base_agi),
         base_int = VALUES(base_int), base_wil = VALUES(base_wil),
         main_attr = VALUES(main_attr), sub_attr = VALUES(sub_attr),
         profession = VALUES(profession), element = VALUES(element),
         weapon_type = VALUES(weapon_type)`,
      [
        c.id, c.name, c.rarity,
        baseHp, baseAtk, baseStr, baseAgi, baseInt, baseWil,
        ATTR_MAP[c.mainAttrType] || c.mainAttrType, ATTR_MAP[c.subAttrType] || c.subAttrType,
        c.profession, ELEMENT_MAP[c.charType] || c.charType,
        WEAPON_TYPE_MAP[c.weaponType] || c.weaponType,
      ]
    );
    charCount++;
  }
  console.log(`  Inserted ${charCount} characters`);

  // ------- Import character_stat (90 levels) -------
  let charStatCount = 0;
  for (const c of characters) {
    const hpArr = c.growth['生命值'] || [];
    const atkArr = c.growth['攻击力'] || [];
    const strArr = c.growth['力量'] || [];
    const agiArr = c.growth['敏捷'] || [];
    const intArr = c.growth['智识'] || [];
    const wilArr = c.growth['意志'] || [];
    const physArr = c.growth['物理异常伤害系数'] || [];
    const magicArr = c.growth['法术异常伤害系数'] || [];
    for (let lv = 0; lv < 90; lv++) {
      await conn.execute(
        `INSERT IGNORE INTO character_stat
         (character_id, level, hp, atk, str, agi, \`int\`, wil, phys_dmg_coeff, magic_dmg_coeff)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id, lv + 1,
          hpArr[lv] ?? null, atkArr[lv] ?? null,
          strArr[lv] ?? null, agiArr[lv] ?? null,
          intArr[lv] ?? null, wilArr[lv] ?? null,
          physArr[lv] ?? null, magicArr[lv] ?? null,
        ]
      );
      charStatCount++;
    }
  }
  console.log(`  Inserted ${charStatCount} character stat rows`);

  // ------- Import skills + skill_levels -------
  console.log(`\nImporting skills...`);
  let skillCount = 0;
  let skillLevelCount = 0;
  for (const c of characters) {
    if (!c.skills) continue;
    const charElement = ELEMENT_MAP[c.charType] || c.charType;
    for (const sk of c.skills) {
      const stype = skillTypeFromId(sk.id);
      // damage_type: use character element for normal/skill/chain/ultimate, 'passive' for others
      const dmgType = (stype === 'other') ? 'passive' : charElement;

      // Use raw description from akedb, fallback to value keys
      const desc = sk.description || Object.keys(sk.values || {}).join(', ');

      await conn.execute(
        `INSERT INTO skill (id, character_id, name, type, damage_type, description)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name), type = VALUES(type),
           damage_type = VALUES(damage_type), description = VALUES(description)`,
        [sk.id, c.id, sk.name, stype, dmgType, desc]
      );
      skillCount++;

      // Import skill_levels
      const atkScales = sk.values?.atk_scale;
      if (atkScales && Array.isArray(atkScales)) {
        for (let lv = 0; lv < atkScales.length; lv++) {
          await conn.execute(
            `INSERT IGNORE INTO skill_level (skill_id, level, multiplier)
             VALUES (?, ?, ?)`,
            [sk.id, lv + 1, atkScales[lv] * 100] // Convert to percentage
          );
          skillLevelCount++;
        }
      }

      // Import skill_costs
      const costValueArr = sk.values?.costValue;
      const coolDownArr = sk.values?.coolDown;
      const uspArr = sk.values?.usp;
      const poiseArr = sk.values?.poise;
      const airborneArr = sk.values?.airborne_scale;
      const maxLen = Math.max(
        costValueArr?.length || 0, coolDownArr?.length || 0,
        uspArr?.length || 0, poiseArr?.length || 0, airborneArr?.length || 0
      );
      if (maxLen > 0) {
        for (let lv = 0; lv < maxLen; lv++) {
          await conn.execute(
            `INSERT IGNORE INTO skill_cost (skill_id, level, cost_value, cool_down, usp, poise, airborne_scale)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              sk.id, lv + 1,
              costValueArr?.[lv] ?? null,
              coolDownArr?.[lv] ?? null,
              uspArr?.[lv] ?? null,
              poiseArr?.[lv] ?? null,
              airborneArr?.[lv] ?? null,
            ]
          );
        }
      }
    }
  }

  // ------- Import character_talents -------
  let talentCount = 0;
  console.log(`\nImporting talents...`);
  for (const c of characters) {
    if (!c.talents || !Array.isArray(c.talents)) continue;
    // Group talents by name to assign talent_index
    const seen = new Map();
    for (let i = 0; i < c.talents.length; i++) {
      const t = c.talents[i];
      if (!t.name) continue;
      if (!seen.has(t.name)) {
        seen.set(t.name, { talentIndex: seen.size + 1, stage: 0 });
      }
      const meta = seen.get(t.name);
      meta.stage++;
      const talentId = `${c.id}_talent_${meta.talentIndex}_${meta.stage}`;
      await conn.execute(
        `INSERT IGNORE INTO character_talent (id, character_id, name, talent_index, stage, description, \`values\`)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          talentId, c.id, t.name,
          meta.talentIndex, meta.stage,
          t.description || '',
          t.values ? JSON.stringify(t.values) : null,
        ]
      );
      talentCount++;
    }
  }
  console.log(`  Inserted ${skillCount} skills, ${skillLevelCount} skill levels, ${talentCount} talents`);

  // ------- Import weapons -------
  console.log(`\nImporting ${weapons.length} weapons...`);
  let weaponCount = 0;
  for (const w of weapons) {
    const baseAtk = last(w.baseAtk);
    const skilllist = w.skilllist || [];

    // affix1
    const aff1 = skilllist[0];
    const aff1Name = aff1?.skillName || null;
    const aff1Key = aff1?.blackboard?.[0]?.key || null;
    // Extract size from name
    let aff1Size = null;
    if (aff1Name) {
      const m = aff1Name.match(/[·]*(小|中|大)$/);
      if (m) aff1Size = AFFIX_SIZE_MAP[m[1]];
    }
    const aff1Level = 0;
    const aff1Value = aff1?.blackboard?.[0]?.value ? last(aff1.blackboard[0].value) : null;

    // affix2
    const aff2 = skilllist[1];
    const aff2Name = aff2?.skillName || null;
    const aff2Key = aff2?.blackboard?.[0]?.key || null;
    let aff2Size = null;
    if (aff2Name) {
      const m = aff2Name.match(/[·]*(小|中|大)$/);
      if (m) aff2Size = AFFIX_SIZE_MAP[m[1]];
    }
    const aff2Value = aff2?.blackboard?.[0]?.value ? last(aff2.blackboard[0].value) : null;

    // affix3 - weapon skill with multiple effects
    const aff3 = skilllist[2];
    const aff3Name = aff3?.skillName || null;
    const aff3Type = aff3?.blackboard?.[0]?.key || null; // use first key as type
    const aff3Effect1 = aff3?.blackboard?.[0] ? `${aff3.blackboard[0].key}=${last(aff3.blackboard[0].value)}` : null;
    const aff3Effect2 = aff3?.blackboard?.[1] ? `${aff3.blackboard[1].key}=${last(aff3.blackboard[1].value)}` : null;
    const aff3Effect3 = aff3?.blackboard?.[2] ? `${aff3.blackboard[2].key}=${last(aff3.blackboard[2].value)}` : null;

    await conn.execute(
      `INSERT IGNORE INTO weapon
       (id, name, rarity, potential, type, level, base_atk,
        affix1_name, affix1_type, affix1_size, affix1_level, affix1_value,
        affix2_name, affix2_type, affix2_size, affix2_level, affix2_value,
        affix3_name, affix3_type, affix3_effect1, affix3_effect2, affix3_effect3)
       VALUES (?, ?, ?, 0, ?, 90, ?,
               ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?,
               ?, ?, ?, ?, ?)`,
      [
        w.id, w.name, w.rarity, w.weaponType, baseAtk,
        aff1Name, aff1Key, aff1Size, aff1Level, aff1Value,
        aff2Name, aff2Key, aff2Size, aff1Level, aff2Value,
        aff3Name, aff3Type, aff3Effect1, aff3Effect2, aff3Effect3,
      ]
    );
    weaponCount++;

    // Import weapon_stat (90 levels)
    if (Array.isArray(w.baseAtk)) {
      for (let lv = 0; lv < w.baseAtk.length; lv++) {
        const val = w.baseAtk[lv];
        if (val != null) {
          await conn.execute(
            `INSERT IGNORE INTO weapon_stat (weapon_id, level, base_atk) VALUES (?, ?, ?)`,
            [w.id, lv + 1, val]
          );
        }
      }
    }

    // Import weapon_affix (3 affixes x 9 potentials)
    for (let ai = 0; ai < skilllist.length && ai < 3; ai++) {
      const aff = skilllist[ai];
      if (!aff) continue;
      const affName = aff.skillName || null;
      const affKey = aff.blackboard?.[0]?.key || null;
      let affSize = null;
      if (affName) {
        const m = affName.match(/[·]*(小|中|大)$/);
        if (m) affSize = AFFIX_SIZE_MAP[m[1]];
      }
      // Extract effects for affix3
      const effects = [];
      if (ai === 2 && aff.blackboard) {
        for (let bi = 0; bi < Math.min(aff.blackboard.length, 3); bi++) {
          const bb = aff.blackboard[bi];
          if (bb && bb.key && Array.isArray(bb.value)) {
            effects.push(`${bb.key}=${bb.value[bb.value.length - 1]}`);
          }
        }
      }
      // Write each potential level
      const values = aff.blackboard?.[0]?.value;
      if (Array.isArray(values)) {
        for (let p = 0; p < values.length; p++) {
          await conn.execute(
            `INSERT IGNORE INTO weapon_affix (weapon_id, affix_index, potential, name, type, size, value, effect1, effect2, effect3)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [w.id, ai + 1, p, affName, affKey, affSize, values[p], effects[0] || null, effects[1] || null, effects[2] || null]
          );
        }
      }
    }
  }
  console.log(`  Inserted ${weaponCount} weapons`);

  // ------- Import equipment -------
  console.log(`\nImporting equipment...`);
  let equipCount = 0;
  for (const suit of equipsList) {
    const suitName = suit['套组名称'];
    const setEffects = suit.value || {};

    // Build set effect descriptions
    const setEffectKeys = Object.keys(setEffects);
    const setEff1Name = setEffectKeys.length > 0 ? `${suitName} 套装效果` : null;
    const setEff1Value = setEffectKeys.length > 0 ? setEffects[setEffectKeys[0]] : null;

    const setEff2Name = setEffectKeys.length > 1 ? `${suitName} 套装效果2` : null;
    const setEff2Value = setEffectKeys.length > 1 ? setEffects[setEffectKeys[1]] : null;
    const setEff2Duration = setEffects.duration || null;
    const setEff1Desc = suit['技能描述'] || null;

    for (const item of suit.items) {
      const slot = SLOT_MAP[item['部位']] || item['部位'];

      // Handle potential undefined values
      const mainStatValue = item['主词条']?.value ?? 0;
      const subAttrs = item['副词条'] || [];

      // map sub attrs
      const attr1Type = subAttrs[0]?.desc || null;
      const attr1Value = subAttrs[0]?.value?.[0] ?? null;
      const attr1V1 = subAttrs[0]?.value?.[1] ?? null;
      const attr1V2 = subAttrs[0]?.value?.[2] ?? null;
      const attr1V3 = subAttrs[0]?.value?.[3] ?? null;

      const attr2Type = subAttrs[1]?.desc || null;
      const attr2Value = subAttrs[1]?.value?.[0] ?? null;
      const attr2V1 = subAttrs[1]?.value?.[1] ?? null;
      const attr2V2 = subAttrs[1]?.value?.[2] ?? null;
      const attr2V3 = subAttrs[1]?.value?.[3] ?? null;

      const attr3Type = subAttrs[2]?.desc || null;
      const attr3Value = subAttrs[2]?.value?.[0] ?? null;
      const attr3V1 = subAttrs[2]?.value?.[1] ?? null;
      const attr3V2 = subAttrs[2]?.value?.[2] ?? null;
      const attr3V3 = subAttrs[2]?.value?.[3] ?? null;

      await conn.execute(
       `INSERT INTO equipment
        (id, name, slot, level, base_def, set_name,
         attr1_type, attr1_refine, attr1_value, attr1_v1, attr1_v2, attr1_v3,
         attr2_type, attr2_refine, attr2_value, attr2_v1, attr2_v2, attr2_v3,
         attr3_type, attr3_refine, attr3_value, attr3_v1, attr3_v2, attr3_v3,
         set_effect1_name, set_effect1_value, set_effect1_desc,
         set_effect2_name, set_effect2_value, set_effect2_duration)
        VALUES (?, ?, ?, 70, ?, ?,
                ?, 0, ?, ?, ?, ?,
                ?, 0, ?, ?, ?, ?,
                ?, 0, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          set_effect1_name = VALUES(set_effect1_name),
          set_effect1_value = VALUES(set_effect1_value),
          set_effect1_desc = VALUES(set_effect1_desc),
          set_effect2_name = VALUES(set_effect2_name),
          set_effect2_value = VALUES(set_effect2_value),
          set_effect2_duration = VALUES(set_effect2_duration)`,
       [
         item.id, item.name, slot, mainStatValue, suitName,
         attr1Type, attr1Value, attr1V1, attr1V2, attr1V3,
         attr2Type, attr2Value, attr2V1, attr2V2, attr2V3,
         attr3Type, attr3Value, attr3V1, attr3V2, attr3V3,
         setEff1Name, setEff1Value, setEff1Desc,
         setEff2Name, setEff2Value, setEff2Duration,
       ]
      );
      equipCount++;
    }
  }
  console.log(`  Inserted ${equipCount} equipment pieces`);

  // ------- Import gains -------
  console.log(`\nImporting gains...`);
  const gains = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'gains.json'), 'utf8'));
  let gainCount = 0;
  for (const g of gains) {
    await conn.execute(
      `INSERT IGNORE INTO gain
       (id, name, source, gain_type, effect_category, effect_type, effect_value,
        value_type, stack_rule, target_scope, trigger_condition, duration, max_stacks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        g.id, g.name, g.source, g.gainType,
        g.effectCategory, g.effectType, g.effectValue,
        g.valueType, g.stackRule, g.targetScope,
        g.triggerCondition ?? null, g.duration ?? null, g.maxStacks ?? 1,
      ]
    );
    gainCount++;
  }
  console.log(`  Inserted ${gainCount} gains`);

  await conn.end();
  console.log('\nImport complete!');
}

main().catch(err => {
  console.error('Import failed:', err);
  process.exit(1);
});
