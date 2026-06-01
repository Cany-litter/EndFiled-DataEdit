const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const DB_CONFIG = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '1234',
  database: 'endfiled',
};

const DATA_DIR = path.join(__dirname, '..', 'data');
const CHAR_DIR = path.join(DATA_DIR, '华法琳Wiki', '角色');
const EXTRACTED_DIR = path.join(DATA_DIR, 'extracted');

const LV_MAP = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const SKIP_PREFIXES = ['失衡值', '冷却时间', '封印时间', '获得终结技能量', '所需终结技能量', '第一击失衡值', '浮空时间'];
const TYPE_MARKERS = ['普通攻击', '战技', '连携技', '终结技'];

const NUM_MAP = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };

function parseMultipliers(line) {
  const parts = line.split('\t');
  const values = parts.slice(1).map(v => {
    const cleaned = v.replace('%', '').replace(',', '').trim();
    return parseFloat(cleaned);
  });
  if (!values.length || values.every(v => isNaN(v))) return [];
  return values.map(v => v / 100);
}

function detectHitCount(description) {
  const m = description.match(/进行(\d+)段斩击/) || description.match(/进行(\d+)段攻击/);
  return m ? parseInt(m[1], 10) : null;
}

function loadAttackSegments() {
  const data = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, 'attack_segments.json'), 'utf8'));
  const byName = {};
  for (const entry of Object.values(data)) {
    byName[entry.character_name] = entry.segments || [];
  }
  return byName;
}

function loadSkillActions() {
  const data = JSON.parse(fs.readFileSync(path.join(EXTRACTED_DIR, 'skill_actions.json'), 'utf8'));
  const byCharAndType = {};
  for (const entry of Object.values(data)) {
    byCharAndType[`${entry.character_name}::${entry.skill_type}`] = entry;
  }
  return byCharAndType;
}

function findNormalAtkTicks(segmentsByName, charName, segmentIndex) {
  const segs = segmentsByName[charName];
  if (!segs || !segs[segmentIndex]) return [];
  return (segs[segmentIndex].damage_ticks || []).map(t => ({
    offset: t.offset ?? 0, stagger: t.stagger ?? 0, sp: t.sp ?? 0,
  }));
}

function findSkillActionTicks(actionsByKey, charName, skillType) {
  const key = `${charName}::${skillType}`;
  const entry = actionsByKey[key];
  if (!entry || !entry.damage_ticks) return [];
  return entry.damage_ticks.map(t => ({
    offset: t.offset ?? 0, stagger: t.stagger ?? 0, sp: t.sp ?? 0,
  }));
}

function extractCharName(content, filename) {
  const headingMatch = content.match(/^(.+?)\s*\n\d+★/m);
  if (headingMatch) return headingMatch[1].trim();

  const nameMatch = content.match(/名字\t(.+?)(?:\t|\n)/);
  if (nameMatch) return nameMatch[1].trim();

  return filename.replace('.txt', '');
}

function parseSkills(fileContent, charId, element) {
  const skills = [];
  const lines = fileContent.split('\n');

  let skillIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '技能') {
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      const nameLine = j < lines.length ? lines[j].trim() : '';
      j++;
      while (j < lines.length && !lines[j].trim()) j++;
      if (j < lines.length && TYPE_MARKERS.includes(lines[j].trim())) {
        skillIdx = i;
        break;
      }
    }
  }
  if (skillIdx < 0) return skills;

  let curSection = null;
  let curHeading = '';
  let curDesc = [];
  let collectingDesc = false;
  let inTable = false;

  function splitNormalDesc(lines) {
    const text = lines.join('\n');
    const plungeIdx = lines.findIndex(l => l.includes('下落攻击'));
    const execIdx = lines.findIndex(l => l.includes('处决攻击'));
    const normalDesc = plungeIdx > 0 ? lines.slice(0, plungeIdx).filter(l => l.trim()).join('\n') : text;
    const plungeDesc = plungeIdx >= 0 && execIdx > plungeIdx
      ? lines.slice(plungeIdx, execIdx).filter(l => l.trim()).join('\n') : '';
    const execDesc = execIdx >= 0 ? lines.slice(execIdx).filter(l => l.trim()).join('\n') : '';
    return { normalDesc, plungeDesc, execDesc };
  }

  function handleTableRow(rowLine) {
    const trimmed = rowLine.trim();
    if (!trimmed) return;
    for (const prefix of SKIP_PREFIXES) {
      if (trimmed.startsWith(prefix)) return;
    }
    const label = trimmed.split('\t')[0];
    const mults = parseMultipliers(trimmed);
    if (!mults.length) return;

    if (curSection === 'normal') {
      const { normalDesc, plungeDesc, execDesc } = splitNormalDesc(curDesc);
      const nthMatch = label.match(/普攻第([一二三四五六七八九十])段倍率/);
      if (nthMatch) {
        const n = NUM_MAP[nthMatch[1]];
        if (n) {
          skills.push({
            id: `${charId}_normal_${n}`,
            character_id: charId,
            name: `${curHeading}·普通攻击·${nthMatch[1]}段`,
            type: n === 5 ? 'charged' : 'normal',
            damage_type: element,
            description: normalDesc,
            multipliers: mults,
          });
        }
        return;
      }
      if (label.includes('处决攻击倍率')) {
        skills.push({
          id: `${charId}_execution`,
          character_id: charId,
          name: `${curHeading}·普通攻击·处决`,
          type: 'execution',
          damage_type: element,
          description: execDesc,
          multipliers: mults,
        });
        return;
      }
      if (label.includes('下落攻击倍率')) {
        skills.push({
          id: `${charId}_plunge`,
          character_id: charId,
          name: `${curHeading}·普通攻击·下落攻击`,
          type: 'plunge',
          damage_type: element,
          description: plungeDesc,
          multipliers: mults,
        });
        return;
      }
      return;
    }

    function extractHitNumber(label) {
      const m = label.match(/([一二三四五六七八九十])段伤害倍率/);
      if (m) return NUM_MAP[m[1]];
      return 1;
    }

    function makeHitSkill(baseType, typeName) {
      const hitNum = extractHitNumber(label);
      const cnNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][hitNum] || String(hitNum);
      const suffix = hitNum > 1 ? `·${cnNum}段` : '';
      const sid = `${charId}_${baseType}${hitNum > 1 ? '_' + hitNum : ''}`;
      if (skills.find(s => s.id === sid)) return;
      skills.push({
        id: sid,
        character_id: charId,
        name: `${curHeading}·${typeName}${suffix}`,
        type: baseType,
        damage_type: element,
        description: curDesc.join('\n'),
        multipliers: mults,
      });
    }

    if (curSection === 'skill') {
      if (label.includes('伤害倍率') && !label.includes('强化')) {
        makeHitSkill('skill', '战技');
      }
      return;
    }

    if (curSection === 'chain') {
      if (label.includes('伤害倍率') && !label.includes('强化')) {
        makeHitSkill('chain', '连携技');
      }
      return;
    }

    if (curSection === 'ultimate') {
      const descText = curDesc.join('\n');
      const hitCount = detectHitCount(descText);

      if (label.includes('斩击伤害倍率') && hitCount) {
        for (let h = 1; h <= hitCount; h++) {
          const cnNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][h] || String(h);
          skills.push({
            id: `${charId}_ultimate_${h}`,
            character_id: charId,
            name: `${curHeading}·终结技·${cnNum}段`,
            type: 'ultimate',
            damage_type: element,
            description: descText,
            multipliers: mults,
          });
        }
        return;
      }
      if (label.includes('终结一击伤害倍率')) {
        skills.push({
          id: `${charId}_ultimate_finisher`,
          character_id: charId,
          name: `${curHeading}·终结技·终结一击`,
          type: 'ultimate',
          damage_type: element,
          description: descText,
          multipliers: mults,
        });
        return;
      }
      if (label.includes('伤害倍率') && !label.includes('强化')) {
        makeHitSkill('ultimate', '终结技');
        return;
      }
    }
  }

  for (let i = skillIdx + 1; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (trimmed === '技能升级材料') {
      inTable = false;
      collectingDesc = false;
      continue;
    }

    if (trimmed === '后勤技能') {
      break;
    }

    if (TYPE_MARKERS.includes(trimmed)) {
      const prevLine = lines[i - 1] ? lines[i - 1].trim() : '';
      if (prevLine && prevLine !== '技能' && prevLine !== '技能升级材料' && !TYPE_MARKERS.includes(prevLine)) {
        curHeading = prevLine;
        curSection = trimmed === '普通攻击' ? 'normal' :
                     trimmed === '战技' ? 'skill' :
                     trimmed === '连携技' ? 'chain' : 'ultimate';
        curDesc = [];
        collectingDesc = true;
        inTable = false;
        continue;
      }
    }

    if (collectingDesc && !inTable) {
      if (/^\d+\t\d+\t\d+/.test(trimmed) && trimmed.includes('M3')) {
        inTable = true;
        continue;
      }
      if (trimmed) {
        curDesc.push(trimmed);
      }
      continue;
    }

    if (inTable && trimmed) {
      handleTableRow(lines[i]);
      continue;
    }

    if (inTable && !trimmed) {
      inTable = false;
      collectingDesc = false;
    }
  }

  return skills;
}

async function upsertSkill(conn, skill) {
  await conn.execute('DELETE FROM skill_damage_tick WHERE skill_id = ?', [skill.id]);
  await conn.execute('DELETE FROM skill_action WHERE skill_id = ?', [skill.id]);
  await conn.execute('DELETE FROM skill_level WHERE skill_id = ?', [skill.id]);
  await conn.execute('DELETE FROM skill WHERE id = ?', [skill.id]);

  await conn.execute(
    `INSERT INTO skill (id, character_id, name, type, damage_type, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [skill.id, skill.character_id, skill.name, skill.type, skill.damage_type, skill.description || null]
  );

  for (let lv = 0; lv < skill.multipliers.length; lv++) {
    const dbLevel = LV_MAP[lv];
    if (dbLevel === undefined) break;
    const val = skill.multipliers[lv];
    if (val === undefined || val === null || isNaN(val)) continue;
    await conn.execute(
      'INSERT INTO skill_level (skill_id, level, multiplier) VALUES (?, ?, ?)',
      [skill.id, dbLevel, val]
    );
  }
}

async function upsertDamageTicks(conn, skillId, ticks) {
  await conn.execute(
    'INSERT INTO skill_action (skill_id) VALUES (?) ON DUPLICATE KEY UPDATE skill_id=skill_id',
    [skillId]
  );
  await conn.execute('DELETE FROM skill_damage_tick WHERE skill_id = ?', [skillId]);
  for (let ti = 0; ti < ticks.length; ti++) {
    const t = ticks[ti];
    await conn.execute(
      `INSERT INTO skill_damage_tick (skill_id, tick_index, offset, stagger, sp)
       VALUES (?, ?, ?, ?, ?)`,
      [skillId, ti, t.offset ?? 0, t.stagger ?? 0, t.sp ?? 0]
    );
  }
}

async function main() {
  console.log('=== 开始导入技能数据 ===\n');

  const segmentsByName = loadAttackSegments();
  const actionsByKey = loadSkillActions();

  const conn = await mysql.createConnection(DB_CONFIG);
  console.log('已连接 MySQL');

  // Cleanup old-format skills
  const oldSuffixes = ['NormalSkill', 'ComboSkill', 'UltimateSkill', 'NormalAttack'];
  for (const suffix of oldSuffixes) {
    const pattern = `%_${suffix}`;
    await conn.execute('DELETE FROM skill_damage_tick WHERE skill_id LIKE ?', [pattern]);
    await conn.execute('DELETE FROM skill_action WHERE skill_id LIKE ?', [pattern]);
    await conn.execute('DELETE FROM skill_anomaly WHERE skill_id LIKE ?', [pattern]);
    await conn.execute('DELETE FROM skill_level WHERE skill_id LIKE ?', [pattern]);
    const [del] = await conn.execute('DELETE FROM skill WHERE id LIKE ?', [pattern]);
    if (del.affectedRows > 0) console.log(`  清理旧格式技能: ${suffix} (${del.affectedRows}个)`);
  }
  // Cleanup old-style skill names
  const oldNamePatterns = ['普通攻击一段', '普通攻击二段', '普通攻击三段', '普通攻击四段', '普通攻击五段',
    '战技一段伤害', '战技二段伤害', '战技三段伤害',
    '连携技一段伤害', '连携技二段伤害', '连携技三段伤害',
    '终结技一段伤害', '终结技二段伤害', '终结技三段伤害', '终结技四段伤害', '终结技五段伤害'];
  for (const name of oldNamePatterns) {
    const [del] = await conn.execute('DELETE FROM skill_level WHERE skill_id IN (SELECT id FROM skill WHERE name = ?)', [name]);
    await conn.execute('DELETE FROM skill_damage_tick WHERE skill_id IN (SELECT id FROM skill WHERE name = ?)', [name]);
    await conn.execute('DELETE FROM skill_action WHERE skill_id IN (SELECT id FROM skill WHERE name = ?)', [name]);
    await conn.execute('DELETE FROM skill_anomaly WHERE skill_id IN (SELECT id FROM skill WHERE name = ?)', [name]);
    const [del2] = await conn.execute('DELETE FROM skill WHERE name = ?', [name]);
    if (del2.affectedRows > 0) console.log(`  清理旧名称技能: ${name} (${del2.affectedRows}个)`);
  }

  const [charRows] = await conn.execute(
    `SELECT id, name, element FROM \`character\``
  );
  const charMap = {};
  for (const r of charRows) {
    charMap[r.name] = { id: r.id, element: r.element || 'physical' };
  }
  console.log(`数据库中角色数: ${charRows.length}`);

  let charFiles;
  try {
    charFiles = fs.readdirSync(CHAR_DIR).filter(f => f.endsWith('.txt'));
  } catch (e) {
    console.error(`无法读取角色目录: ${CHAR_DIR}`, e.message);
    await conn.end();
    process.exit(1);
  }

  let totalChars = 0;
  let totalSkills = 0;

  for (const file of charFiles) {
    const filePath = path.join(CHAR_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const charName = extractCharName(content, file);
    const dbChar = charMap[charName];
    if (!dbChar) {
      console.warn(`  ⚠ 未在数据库中找到角色: "${charName}" (文件: ${file})，跳过`);
      continue;
    }

    const { id: charId, element } = dbChar;
    console.log(`读取角色: ${charName} (${charId})`);

    const skills = parseSkills(content, charId, element);
    if (!skills.length) {
      console.warn(`  ⚠ 未解析到任何技能: ${charName}`);
      continue;
    }

    for (const skill of skills) {
      try {
        await upsertSkill(conn, skill);
        const maxMult = skill.multipliers[skill.multipliers.length - 1] || 0;
        console.log(`  - 创建: ${skill.name} (${skill.type}), 倍率: ${maxMult.toFixed(2)}`);

        let ticks = [];

        if (skill.type === 'normal' || skill.type === 'charged') {
          const segIdx = skill.id.match(/_(\d+)$/);
          if (segIdx) {
            ticks = findNormalAtkTicks(segmentsByName, charName, parseInt(segIdx[1], 10) - 1);
          }
        } else if (skill.type === 'execution') {
          ticks = findSkillActionTicks(actionsByKey, charName, 'normal');
        } else if (skill.type === 'plunge') {
          ticks = [{ offset: 0.5, stagger: 0, sp: 0 }];
        } else if (skill.type === 'skill') {
          const allTicks = findSkillActionTicks(actionsByKey, charName, 'skill');
          const hitNum = skill.id.match(/_(\d+)$/);
          if (hitNum) {
            const idx = parseInt(hitNum[1], 10) - 1;
            ticks = idx < allTicks.length ? [allTicks[idx]] : [];
          } else {
            ticks = allTicks;
          }
        } else if (skill.type === 'chain') {
          const allTicks = findSkillActionTicks(actionsByKey, charName, 'chain');
          const hitNum = skill.id.match(/_(\d+)$/);
          if (hitNum) {
            const idx = parseInt(hitNum[1], 10) - 1;
            ticks = idx < allTicks.length ? [allTicks[idx]] : [];
          } else {
            ticks = allTicks;
          }
        } else if (skill.type === 'ultimate') {
          const allTicks = findSkillActionTicks(actionsByKey, charName, 'ultimate');
          if (skill.id.endsWith('_finisher')) {
            ticks = allTicks.length > 0 ? [allTicks[allTicks.length - 1]] : [];
          } else {
            const hitNum = skill.id.match(/_(\d+)$/);
            if (hitNum) {
              const idx = parseInt(hitNum[1], 10) - 1;
              ticks = idx < allTicks.length ? [allTicks[idx]] : [];
            } else {
              ticks = allTicks;
            }
          }
        }

        if (ticks.length > 0) {
          await upsertDamageTicks(conn, skill.id, ticks);
        }

        totalSkills++;
      } catch (err) {
        console.warn(`  ⚠ 技能写入失败: ${skill.id} (${charName}) - ${err.message}`);
      }
    }

    totalChars++;
  }

  await conn.end();
  console.log(`\n=== 技能导入完成 ===`);
  console.log(`共处理 ${totalChars} 个角色, 创建 ${totalSkills} 个技能`);
}

main().catch(err => {
  console.error('导入失败:', err);
  process.exit(1);
});
