const fs = require('fs');
const path = require('path');

const GAMEDATA = path.join(__dirname, '..', 'reference', 'endaxis', 'public', 'gamedata.json');
const OUT_DIR = path.join(__dirname, '..', 'data', 'mapped');
const SQL_OUT = path.join(OUT_DIR, 'import-gamedata.sql');

const data = JSON.parse(fs.readFileSync(GAMEDATA, 'utf8'));
const sqlLines = [];

function esc(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v;
  return "'" + String(v).replace(/'/g, "''") + "'";
}

function sqli(table, cols, rows) {
  if (rows.length === 0) return;
  sqlLines.push(`-- ${table}`);
  // Batch INSERT in groups of 50
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const vals = batch.map(r =>
      '(' + cols.map(c => esc(r[c])).join(', ') + ')'
    ).join(',\n');
    sqlLines.push(`INSERT INTO \`${table}\` (${cols.map(c => '`' + c + '`').join(', ')}) VALUES\n${vals};`);
  }
  sqlLines.push('');
}

// ── modifier_def ──
const modifierRows = (data.misc.modifierDefs || []).map(m => ({
  id: m.id,
  label: m.label,
  unit: (data.misc.domainConfig?.weapon?.units?.[m.id] || 'flat'),
}));
sqli('modifier_def', ['id', 'label', 'unit'], modifierRows);
fs.writeFileSync(path.join(OUT_DIR, 'modifier-defs.json'), JSON.stringify(modifierRows, null, 2));

// ── weapon_modifier_template ──
const wpnModRows = [];
const wcm = data.misc.weaponCommonModifiers || {};
for (const [modId, sizes] of Object.entries(wcm)) {
  for (const [size, levels] of Object.entries(sizes)) {
    if (!Array.isArray(levels)) continue;
    levels.forEach((val, lv) => {
      if (val > 0) {
        wpnModRows.push({ modifierId: modId, size, level: lv, value: val });
      }
    });
  }
}
sqli('weapon_modifier_template', ['modifier_id', 'size', 'level', 'value'], wpnModRows);
fs.writeFileSync(path.join(OUT_DIR, 'weapon-modifier-templates.json'), JSON.stringify(wpnModRows, null, 2));

// ── equipment_adapter_template ──
const eqAdapterRows = [];
const eat = data.misc.equipmentAdapterTable || {};
for (const [modId, slots] of Object.entries(eat)) {
  for (const [key, vals] of Object.entries(slots)) {
    if (!Array.isArray(vals)) continue;
    // key format: "armorSingle", "armorDual", "glovesSingle", ...
    const match = key.match(/^(\w+)(Single|Dual)$/);
    if (!match) continue;
    const slot = match[1] === 'gloves' ? 'gloves' : match[1];
    const config = match[2];
    vals.forEach((val, ri) => {
      if (val > 0) {
        eqAdapterRows.push({ modifierId: modId, slot, config, refine: ri, value: val });
      }
    });
  }
}
sqli('equipment_adapter_template', ['modifier_id', 'slot', 'config', 'refine', 'value'], eqAdapterRows);
fs.writeFileSync(path.join(OUT_DIR, 'equipment-adapter-templates.json'), JSON.stringify(eqAdapterRows, null, 2));

// ── enemy ──
const enemyRows = (data.enemyDatabase || []).map(e => ({
  id: e.id,
  name: e.name,
  category: e.category || null,
  tier: e.tier || null,
  max_stagger: e.maxStagger ?? 0,
  stagger_node_count: e.staggerNodeCount ?? 1,
  stagger_node_duration: e.staggerNodeDuration ?? null,
  stagger_break_duration: e.staggerBreakDuration ?? null,
  execution_recovery: e.executionRecovery ?? null,
}));
sqli('enemy', ['id', 'name', 'category', 'tier', 'max_stagger', 'stagger_node_count', 'stagger_node_duration', 'stagger_break_duration', 'execution_recovery'], enemyRows);
fs.writeFileSync(path.join(OUT_DIR, 'enemies.json'), JSON.stringify(enemyRows, null, 2));

// ── skill reference: collect all skills by character ──
// Build a map of skill_id -> character_id + type from the skill table
// We need this to link characterRoster data to skill_action rows
// Since we're generating SQL, we use the ENDAXIS character ID as the skill ID prefix
// Skill ID convention: {charId}_{type} e.g. ENDMINISTRATOR_skill

const charMap = {};
for (const c of data.characterRoster || []) {
  const cid = c.id;
  charMap[cid] = { name: c.name, element: c.element, weapon: c.weapon, rarity: c.rarity };

  const skillTypes = [
    { type: 'skill', data: c, prefix: 'skill' },
    { type: 'chain', data: c, prefix: 'link' },
    { type: 'ultimate', data: c, prefix: 'ultimate' },
    { type: 'normal', data: c, prefix: 'execution' },
  ];

  for (const st of skillTypes) {
    const dur = c[st.prefix + '_duration'];
    if (dur == null) continue;

    const skillId = cid + '_' + st.type;
    const spCost = c[st.prefix + '_spCost'];
    const gaugeGain = c[st.prefix + '_gaugeGain'];
    const teamGaugeGain = c[st.prefix + '_teamGaugeGain'];
    const cooldown = st.type === 'chain' ? c[st.prefix + '_cooldown'] : null;
    const ultimateGaugeMax = st.type === 'ultimate' ? c[st.prefix + '_gaugeMax'] : null;
    const ultimateGaugeReply = st.type === 'ultimate' ? c[st.prefix + '_gaugeReply'] : null;
    const allowedTypes = c[st.prefix + '_allowed_types'] || [];

    // skill_action row
    const saCols = ['skill_id', 'duration', 'sp_cost', 'gauge_gain', 'team_gauge_gain', 'cooldown', 'allowed_types', 'ultimate_gauge_max', 'ultimate_gauge_reply', 'cast_time'];
    const saRow = {
      skill_id: skillId,
      duration: dur,
      sp_cost: spCost ?? null,
      gauge_gain: gaugeGain ?? null,
      team_gauge_gain: teamGaugeGain ?? null,
      cooldown: cooldown ?? null,
      allowed_types: allowedTypes.length ? JSON.stringify(allowedTypes) : null,
      ultimate_gauge_max: ultimateGaugeMax ?? null,
      ultimate_gauge_reply: ultimateGaugeReply ?? null,
      cast_time: dur,
    };
    const saRows = [saRow];
    sqli('skill_action', saCols, saRows);

    // skill_damage_tick
    const ticks = c[st.prefix + '_damage_ticks'] || [];
    const tickRows = ticks.map((t, i) => ({
      skill_id: skillId,
      tick_index: i,
      offset: t.offset,
      stagger: t.stagger ?? 0,
      sp: t.sp ?? 0,
      bound_effects: (t.boundEffects && t.boundEffects.length) ? JSON.stringify(t.boundEffects) : null,
    }));
    sqli('skill_damage_tick', ['skill_id', 'tick_index', 'offset', 'stagger', 'sp', 'bound_effects'], tickRows);

    // skill_anomaly
    const anomalies = c[st.prefix + '_anomalies'] || [];
    const delays = c[st.prefix + '_anomaly_delays'] || [];
    const anomalyRows = [];
    let ai = 0;
    anomalies.forEach((group, gi) => {
      (group || []).forEach(a => {
        anomalyRows.push({
          skill_id: skillId,
          anomaly_index: ai++,
          group_index: gi,
          type: a.type,
          stacks: a.stacks ?? 1,
          duration: a.duration ?? 0,
          offset: a.offset ?? 0,
          delay: delays[gi] ?? 0,
        });
      });
    });
    sqli('skill_anomaly', ['skill_id', 'anomaly_index', 'group_index', 'type', 'stacks', 'duration', 'offset', 'delay'], anomalyRows);
  }

  // ── attack_segment ──
  const segments = c.attack_segments || [];
  const segRows = segments.map((s, i) => ({
    character_id: cid,
    segment_index: i,
    duration: s.duration,
    gauge_gain: s.gaugeGain ?? 0,
    allowed_types: (s.allowed_types && s.allowed_types.length) ? JSON.stringify(s.allowed_types) : null,
  }));
  sqli('attack_segment', ['character_id', 'segment_index', 'duration', 'gauge_gain', 'allowed_types'], segRows);

  // ── attack_segment_tick ──
  const segTickRows = [];
  segments.forEach((s, si) => {
    (s.damage_ticks || []).forEach((t, ti) => {
      segTickRows.push({
        character_id: cid,
        segment_index: si,
        tick_index: ti,
        offset: t.offset,
        stagger: t.stagger ?? 0,
        sp: t.sp ?? 0,
      });
    });
  });
  sqli('attack_segment_tick', ['character_id', 'segment_index', 'tick_index', 'offset', 'stagger', 'sp'], segTickRows);
}

// Write SQL file
fs.writeFileSync(SQL_OUT, sqlLines.join('\n'), 'utf8');

console.log('=== gamedata.json 导入完成 ===');
console.log('表数据概览:');
console.log('  modifier_def:                ', modifierRows.length, '条');
console.log('  weapon_modifier_template:    ', wpnModRows.length, '条');
console.log('  equipment_adapter_template:  ', eqAdapterRows.length, '条');
console.log('  enemy:                       ', enemyRows.length, '条');
console.log('');
console.log('输出文件:');
console.log('  JSON:', path.join(OUT_DIR, '*.json'));
console.log('  SQL: ', SQL_OUT);
