const https = require('https');
const fs = require('fs');
const path = require('path');

const RAW_BASE = 'https://raw.githubusercontent.com/nagiyume/AKEDatabase/refs/heads/main/public/CH';
const DATA_DIR = path.join(__dirname, '..', 'data', 'akedb');
const CATEGORIES = ['character', 'weapon', 'equip', 'enemy'];

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

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function saveJson(filePath, obj) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2));
}

async function fetchAndSave(url, filePath) {
  if (fs.existsSync(filePath)) return;
  const raw = await fetch(url);
  const parsed = JSON.parse(raw);
  saveJson(filePath, parsed);
  return parsed;
}

async function syncCategory(category) {
  console.log(`\n[${category}]`);

  // 1. fetch manifest
  const manifestUrl = `${RAW_BASE}/${category}/manifest.json`;
  const manifestPath = path.join(DATA_DIR, category, 'manifest.json');
  console.log(`  manifest -> ${manifestUrl}`);
  const manifest = await fetchAndSave(manifestUrl, manifestPath);
  if (!manifest) return;

  // 2. download each file listed in manifest
  const files = manifest.map(entry => {
    const contentFile = entry.contentFile || entry.file || `${category}/${entry.id || entry.charId || entry.weaponId || entry.suitID}.json`;
    return {
      id: entry.id || entry.charId || entry.weaponId || entry.suitID || entry.name,
      relPath: contentFile.replace(/^\/?public\/CH\//, ''),
    };
  });

  console.log(`  files: ${files.length}`);
  for (const f of files) {
    const url = `${RAW_BASE}/${f.relPath}`;
    const outPath = path.join(DATA_DIR, f.relPath);
    if (fs.existsSync(outPath)) continue;
    try {
      await fetchAndSave(url, outPath);
      console.log(`    ✓ ${f.id}`);
    } catch (err) {
      console.error(`    ✗ ${f.id}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('=== AKEDatabase 数据同步 ===\n');
  console.log(`源: ${RAW_BASE}`);
  console.log(`目标: ${DATA_DIR}\n`);

  for (const cat of CATEGORIES) {
    await syncCategory(cat);
  }

  console.log('\n=== 同步完成 ===');
}

main().catch((err) => { console.error('失败:', err.message); process.exit(1); });
