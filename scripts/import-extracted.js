/**
 * 将提取的技能动作数据导入 MySQL 数据库
 *
 * 读取 data/extracted/skill_actions.json 和 attack_segments.json
 * 将 gamedata 角色/技能 ID 映射为 AKEDB ID，然后写入 MySQL
 *
 * 用法: node scripts/import-extracted.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const EXTRACTED_DIR = path.join(__dirname, '..', 'data', 'extracted');
const MAPPED_DIR = path.join(__dirname, '..', 'data', 'mapped');
const GAMEDATA = path.join(__dirname, '..', 'reference', 'endaxis', 'public', 'gamedata.json');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'endfiled',
};

/**
 * Build mapping: gamedata char name → AKEDB char id
 */
function buildCharNameMap() {
  const gd = JSON.parse(fs.readFileSync(GAMEDATA, 'utf8'));
  const gdByName = {};
  for (const c of (gd.characterRoster || [])) {
    gdByName[c.name] = { gdId: c.id, name: c.name };
  }

  const akeChars = JSON.parse(fs.readFileSync(path.join(MAPPED_DIR, 'characters.json'), 'utf8'));
  const akeByName = {};
  for (const c of akeChars) {
    akeByName[c.name] = c.id;
  }

  // Match by name
  const map = {};
  for (const [name, info] of Object.entries(gdByName)) {
    const akeId = akeByName[name];
    if (akeId) {
      map[info.gdId] = akeId;
    } else {
      console.warn(`  ⚠ 未找到角色名称映射: "${name}" (gamedata ID: ${info.gdId})`);
    }
  }
  return map;
}

/**
 * Map gamedata skill type to AKEDB skill ID suffix
 */
const SKILL_TYPE_TO_DB_SUFFIX = {
  'skill': 'NormalSkill',
  'chain': 'ComboSkill',
  'ultimate': 'UltimateSkill',
  'normal': 'NormalAttack',
};

async function main() {
  console.log('=== 开始导入提取的技能动作数据 ===\n');

  const charIdMap = buildCharNameMap();
  console.log(`\n角色映射对: ${Object.keys(charIdMap).length}`);

  // Read extracted data
  const skillActions = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, 'skill_actions.json'), 'utf8'));
  const attackSegments = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, 'attack_segments.json'), 'utf8'));

  const conn = await mysql.createConnection(DB_CONFIG);
  console.log('已连接 MySQL');

  // ── 1. Import skill_action + skill_damage_tick + skill_anomaly ──
  let saCount = 0, tickCount = 0, anomalyCount = 0;

  for (const [gdSkillId, sa] of Object.entries(skillActions)) {
    // Skip variants (no corresponding skill record in DB)
    if (sa.skill_type.startsWith('variant')) continue;

    const gdCharId = sa.character_id;
    const akeCharId = charIdMap[gdCharId];
    if (!akeCharId) {
      if (!sa.character_name) console.warn(`  ⚠ 跳过未知角色: ${gdCharId}`);
      continue;
    }

    // Map skill_id: gamedata → AKEDB format
    const dbTypeSuffix = SKILL_TYPE_TO_DB_SUFFIX[sa.skill_type];
    const dbSkillId = `${akeCharId}_${dbTypeSuffix}`;

    // Verify the skill exists in DB
    const [skillCheck] = await conn.execute('SELECT id FROM skill WHERE id = ?', [dbSkillId]);
    if (skillCheck.length === 0) {
      console.warn(`  ⚠ 跳过不存在于skill表的技能: ${dbSkillId} (${sa.character_name} - ${sa.skill_type_label})`);
      continue;
    }

    // Check if skill_action already exists
    const [existing] = await conn.execute('SELECT skill_id FROM skill_action WHERE skill_id = ?', [dbSkillId]);
    if (existing.length > 0) {
      // Update existing
      await conn.execute(
        `UPDATE skill_action SET
          duration = ?, sp_cost = ?, gauge_gain = ?, team_gauge_gain = ?,
          cooldown = ?, allowed_types = ?, ultimate_gauge_max = ?, ultimate_gauge_reply = ?,
          cast_time = ?
         WHERE skill_id = ?`,
        [
          sa.duration ?? null, sa.sp_cost ?? null, sa.gauge_gain ?? null, sa.team_gauge_gain ?? null,
          sa.cooldown ?? null, sa.allowed_types?.length ? JSON.stringify(sa.allowed_types) : null,
          sa.ultimate_gauge_max ?? null, sa.ultimate_gauge_reply ?? null, sa.duration ?? null,
          dbSkillId,
        ]
      );
    } else {
      // Insert new
      await conn.execute(
        `INSERT INTO skill_action
         (skill_id, duration, sp_cost, gauge_gain, team_gauge_gain, cooldown, allowed_types,
          ultimate_gauge_max, ultimate_gauge_reply, cast_time)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          dbSkillId, sa.duration ?? null, sa.sp_cost ?? null, sa.gauge_gain ?? null,
          sa.team_gauge_gain ?? null, sa.cooldown ?? null,
          sa.allowed_types?.length ? JSON.stringify(sa.allowed_types) : null,
          sa.ultimate_gauge_max ?? null, sa.ultimate_gauge_reply ?? null, sa.duration ?? null,
        ]
      );
    }
    saCount++;

    // ── Skill Damage Ticks ──
    const ticks = sa.damage_ticks || [];
    // Delete existing ticks for this skill
    await conn.execute('DELETE FROM skill_damage_tick WHERE skill_id = ?', [dbSkillId]);

    for (let ti = 0; ti < ticks.length; ti++) {
      const t = ticks[ti];
      await conn.execute(
        `INSERT INTO skill_damage_tick (skill_id, tick_index, offset, stagger, sp)
         VALUES (?, ?, ?, ?, ?)`,
        [dbSkillId, ti, t.offset ?? 0, t.stagger ?? 0, t.sp ?? 0]
      );
      tickCount++;
    }

    // ── Skill Anomalies ──
    const anomalies = sa.anomalies || [];
    // Delete existing anomalies for this skill
    await conn.execute('DELETE FROM skill_anomaly WHERE skill_id = ?', [dbSkillId]);

    let ai = 0;
    for (const group of anomalies) {
      for (const a of group.types || []) {
        await conn.execute(
          `INSERT INTO skill_anomaly (skill_id, anomaly_index, group_index, type, stacks, duration, offset, delay)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [dbSkillId, ai++, group.group_index, a.type, a.stacks ?? 1, a.duration ?? 0, a.offset ?? 0, 0]
        );
        anomalyCount++;
      }
    }
  }

  console.log(`\n技能动作: ${saCount}`);
  console.log(`伤害判定帧: ${tickCount}`);
  console.log(`异常附着: ${anomalyCount}`);

  // ── 2. Import Attack Segments ──
  let segCount = 0, segTickCount = 0;

  for (const [gdCharId, segData] of Object.entries(attackSegments)) {
    // Map character ID (attack_segments use character_id differently)
    // The attack_segments keys may be gamedata IDs from the extraction
    // We need to find the actual character
    const akeCharId = charIdMap[gdCharId];
    if (!akeCharId) {
      // Try direct lookup from DB
      console.warn(`  ⚠ 无法映射攻击段角色ID: ${gdCharId} (${segData.character_name})`);
      continue;
    }

    // Delete existing for this character
    await conn.execute('DELETE FROM attack_segment_tick WHERE character_id = ?', [akeCharId]);
    await conn.execute('DELETE FROM attack_segment WHERE character_id = ?', [akeCharId]);

    for (const seg of segData.segments) {
      await conn.execute(
        `INSERT INTO attack_segment (character_id, segment_index, duration, gauge_gain, allowed_types)
         VALUES (?, ?, ?, ?, ?)`,
        [
          akeCharId, seg.segment_index, seg.duration ?? 0,
          seg.gauge_gain ?? 0,
          seg.allowed_types?.length ? JSON.stringify(seg.allowed_types) : null,
        ]
      );
      segCount++;

      // Attack segment ticks
      const ticks = seg.damage_ticks || [];
      for (let ti = 0; ti < ticks.length; ti++) {
        const t = ticks[ti];
        await conn.execute(
          `INSERT INTO attack_segment_tick (character_id, segment_index, tick_index, offset, stagger, sp)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [akeCharId, seg.segment_index, ti, t.offset ?? 0, t.stagger ?? 0, t.sp ?? 0]
        );
        segTickCount++;
      }
    }
  }

  console.log(`攻击分段: ${segCount}`);
  console.log(`攻击段伤害帧: ${segTickCount}`);

  await conn.end();
  console.log('\n=== 导入完成 ===');
}

main().catch(err => {
  console.error('导入失败:', err);
  process.exit(1);
});
