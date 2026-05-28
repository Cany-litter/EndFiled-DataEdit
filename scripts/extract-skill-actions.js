const fs = require('fs');
const path = require('path');

const GAMEDATA = path.join(__dirname, '..', 'reference', 'endaxis', 'public', 'gamedata.json');
const OUT_DIR = path.join(__dirname, '..', 'data', 'extracted');

const data = JSON.parse(fs.readFileSync(GAMEDATA, 'utf8'));
const characters = data.characterRoster || [];

// 1. Extract skill_actions
const skillActions = {};

for (const c of characters) {
  const cid = c.id;

  const skillTypes = [
    { key: 'skill', type: 'skill', label: '战技' },
    { key: 'link', type: 'chain', label: '连携技' },
    { key: 'ultimate', type: 'ultimate', label: '终结技' },
    { key: 'execution', type: 'normal', label: '处决' },
  ];

  for (const st of skillTypes) {
    const dur = c[st.key + '_duration'];
    if (dur == null) continue;

    const skillId = cid + '_' + st.key;
    const action = {
      skill_id: skillId,
      character_id: cid,
      character_name: c.name,
      skill_type: st.type,
      skill_type_label: st.label,
      duration: dur,
      cast_time: dur,
      sp_cost: c[st.key + '_spCost'] ?? null,
      gauge_gain: c[st.key + '_gaugeGain'] ?? null,
      team_gauge_gain: c[st.key + '_teamGaugeGain'] ?? null,
      cooldown: st.key === 'link' ? (c[st.key + '_cooldown'] ?? null) : null,
      allowed_types: c[st.key + '_allowed_types'] || [],
      damage_ticks: (c[st.key + '_damage_ticks'] || []).map(t => ({
        offset: t.offset,
        stagger: t.stagger ?? 0,
        sp: t.sp ?? 0,
      })),
      anomalies: (c[st.key + '_anomalies'] || []).map((group, gi) => ({
        group_index: gi,
        types: group.map(a => ({ type: a.type, stacks: a.stacks ?? 1, duration: a.duration ?? 0, offset: a.offset ?? 0 })),
      })),
    };

    if (st.key === 'ultimate') {
      action.ultimate_gauge_max = c[st.key + '_gaugeMax'] ?? null;
      action.ultimate_gauge_reply = c[st.key + '_gaugeReply'] ?? null;
    }

    skillActions[skillId] = action;
  }

  // Variants (重击 / 特殊变体攻击)
  const variants = c.variants || {};
  for (const [vtype, vlist] of Object.entries(variants)) {
    const arr = Array.isArray(vlist) ? vlist : [vlist];
    arr.forEach((v, vi) => {
      const dur = v.duration;
      if (dur == null) return;
      const vid = `${cid}_variant_${vtype}_${vi}`;
      skillActions[vid] = {
        skill_id: vid,
        character_id: cid,
        character_name: c.name,
        skill_type: 'variant_' + vtype,
        skill_type_label: '变体-' + vtype,
        duration: dur,
        cast_time: dur,
        sp_cost: v.spCost ?? null,
        gauge_gain: v.gaugeGain ?? null,
        allowed_types: v.allowed_types || [],
        damage_ticks: (v.damage_ticks || []).map(t => ({
          offset: t.offset, stagger: t.stagger ?? 0, sp: t.sp ?? 0,
        })),
        anomalies: (v.anomalies || []).map((group, gi) => ({
          group_index: gi,
          types: group.map(a => ({ type: a.type, stacks: a.stacks ?? 1, duration: a.duration ?? 0, offset: a.offset ?? 0 })),
        })),
      };
    });
  }
}

// 2. Extract attack_segments
const attackSegments = {};

for (const c of characters) {
  const segs = c.attack_segments || [];
  if (segs.length === 0) continue;
  attackSegments[c.id] = {
    character_id: c.id,
    character_name: c.name,
    segments: segs.map((s, i) => ({
      segment_index: i,
      duration: s.duration,
      gauge_gain: s.gaugeGain ?? 0,
      allowed_types: s.allowed_types || [],
      damage_ticks: (s.damage_ticks || []).map(t => ({
        offset: t.offset, stagger: t.stagger ?? 0, sp: t.sp ?? 0,
      })),
      anomalies: (s.anomalies || []).map((group, gi) => ({
        group_index: gi,
        types: group.map(a => ({ type: a.type, stacks: a.stacks ?? 1, duration: a.duration ?? 0, offset: a.offset ?? 0 })),
      })),
    })),
  };
}

// Write output
fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, 'skill_actions.json'), JSON.stringify(skillActions, null, 2), 'utf8');
fs.writeFileSync(path.join(OUT_DIR, 'attack_segments.json'), JSON.stringify(attackSegments, null, 2), 'utf8');

// Print summary
console.log('=== 提取完成 ===');
console.log(`输出目录: ${OUT_DIR}`);
console.log(`\n角色总数: ${characters.length}`);
console.log(`技能动作总数: ${Object.keys(skillActions).length}`);
const typeCounts = {};
for (const sa of Object.values(skillActions)) {
  typeCounts[sa.skill_type_label] = (typeCounts[sa.skill_type_label] || 0) + 1;
}
console.log('技能类型分布:');
for (const [k, v] of Object.entries(typeCounts)) {
  console.log(`  ${k}: ${v}`);
}
console.log(`有普攻分段的角色: ${Object.keys(attackSegments).length}`);
