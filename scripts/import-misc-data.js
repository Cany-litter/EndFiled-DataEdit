/**
 * 导入 modifier_def, weapon_modifier_template, equipment_adapter_template 数据
 *
 * 从 data/mapped/*.json 读取并写入 MySQL
 * 用法: node scripts/import-misc-data.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const MAPPED_DIR = path.join(__dirname, '..', 'data', 'mapped');
const DB_CONFIG = {
  host: 'localhost', port: 3306, user: 'root', password: '1234', database: 'endfiled',
};

async function main() {
  const conn = await mysql.createConnection(DB_CONFIG);
  console.log('已连接 MySQL\n');

  // 1. modifier_def
  const defs = JSON.parse(fs.readFileSync(path.join(MAPPED_DIR, 'modifier-defs.json'), 'utf8'));
  let defCount = 0;
  for (const d of defs) {
    await conn.execute(
      'INSERT IGNORE INTO modifier_def (id, label, unit) VALUES (?, ?, ?)',
      [d.id, d.label, d.unit ?? 'flat']
    );
    defCount++;
  }
  console.log(`modifier_def: ${defCount} 条`);

  // 2. weapon_modifier_template
  const wpnMods = JSON.parse(fs.readFileSync(path.join(MAPPED_DIR, 'weapon-modifier-templates.json'), 'utf8'));
  let wpnCount = 0;
  for (const m of wpnMods) {
    await conn.execute(
      'INSERT IGNORE INTO weapon_modifier_template (modifier_id, size, level, value) VALUES (?, ?, ?, ?)',
      [m.modifierId, m.size, m.level, m.value]
    );
    wpnCount++;
  }
  console.log(`weapon_modifier_template: ${wpnCount} 条`);

  // 3. equipment_adapter_template
  const eqAdapters = JSON.parse(fs.readFileSync(path.join(MAPPED_DIR, 'equipment-adapter-templates.json'), 'utf8'));
  let eqCount = 0;
  for (const a of eqAdapters) {
    await conn.execute(
      'INSERT IGNORE INTO equipment_adapter_template (modifier_id, slot, config, refine, value) VALUES (?, ?, ?, ?, ?)',
      [a.modifierId, a.slot, a.config, a.refine, a.value]
    );
    eqCount++;
  }
  console.log(`equipment_adapter_template: ${eqCount} 条`);

  await conn.end();
  console.log('\n导入完成');
}

main().catch(err => { console.error('失败:', err); process.exit(1); });
