/**
 * AKEDatabase 数据同步脚本
 *
 * 方案：构建时从 raw.githubusercontent.com 拉取 JSON（方案二）
 * 优点：不依赖 git submodule，不影响克隆项目的其他人
 *
 * 用法：
 *   node scripts/fetch-akedb.js          # 全量拉取
 *   node scripts/fetch-akedb.js --cache  # 使用缓存（不重新下载）
 *
 * 数据源：https://github.com/nagiyume/AKEDatabase
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const RAW_BASE = 'https://raw.githubusercontent.com/nagiyume/AKEDatabase/refs/heads/main/public/CH';
const DATA_DIR = path.join(__dirname, '..', 'data', 'akedb');
const MANIFESTS = ['character', 'weapon', 'equip', 'enemy'];

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { rejectUnauthorized: false }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function fetchManifest(category) {
  const url = `${RAW_BASE}/${category}/manifest.json`;
  console.log(`  [manifest] ${url}`);
  const raw = await fetch(url);
  const json = JSON.parse(raw);
  const outPath = path.join(DATA_DIR, category, 'manifest.json');
  await ensureDir(path.dirname(outPath));
  fs.writeFileSync(outPath, JSON.stringify(json, null, 2));
  return json;
}

async function fetchAllFiles(category, manifest) {
  // manifest 结构: { "chr_0005_chen": "character/chr_0005_chen.json", ... }
  const entries = Object.entries(manifest);
  console.log(`  [files] ${category}: ${entries.length} files`);
  for (const [id, relPath] of entries) {
    const url = `${RAW_BASE}/${relPath}`;
    const outPath = path.join(DATA_DIR, relPath);
    if (fs.existsSync(outPath)) continue; // 跳过已缓存
    try {
      const raw = await fetch(url);
      await ensureDir(path.dirname(outPath));
      // 美化格式方便阅读
      const parsed = JSON.parse(raw);
      fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2));
      console.log(`    ✓ ${id}`);
    } catch (err) {
      console.error(`    ✗ ${id}: ${err.message}`);
    }
  }
}

async function fetchCategory(category) {
  console.log(`\n[${category}]`);
  const manifest = await fetchManifest(category);
  await fetchAllFiles(category, manifest);
}

async function main() {
  console.log('=== AKEDatabase 数据同步 ===\n');
  console.log(`源: ${RAW_BASE}`);
  console.log(`目标: ${DATA_DIR}\n`);

  for (const cat of MANIFESTS) {
    await fetchCategory(cat);
  }

  console.log('\n=== 同步完成 ===');
  console.log(`数据已保存到: ${DATA_DIR}`);
}

main().catch((err) => {
  console.error('同步失败:', err.message);
  process.exit(1);
});
