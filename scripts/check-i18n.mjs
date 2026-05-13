#!/usr/bin/env node
/**
 * Ensures tr / en / ru / ar locale JSON files share the same dotted key paths.
 * Run: node scripts/check-i18n.mjs  |  npm run i18n:check
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.join(__dirname, '../src/i18n/locales');
const REF = 'tr';
const LOCALES = ['tr', 'en', 'ru', 'ar'];

/** @param {unknown} v */
function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** @param {Record<string, unknown>} obj */
function flattenKeys(obj, prefix = '') {
  /** @type {string[]} */
  const keys = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (isPlainObject(v)) {
      keys.push(...flattenKeys(/** @type {Record<string, unknown>} */ (v), key));
    } else {
      keys.push(key);
    }
  }
  return keys;
}

function load(locale) {
  const p = path.join(localesDir, `${locale}.json`);
  const raw = fs.readFileSync(p, 'utf8');
  return JSON.parse(raw);
}

const refData = load(REF);
const refKeys = new Set(flattenKeys(refData));
let failed = false;

for (const loc of LOCALES) {
  if (loc === REF) continue;
  const data = load(loc);
  const keys = new Set(flattenKeys(data));
  const missing = [...refKeys].filter((k) => !keys.has(k)).sort();
  const extra = [...keys].filter((k) => !refKeys.has(k)).sort();
  if (missing.length || extra.length) {
    failed = true;
    console.error(`\n[${loc}] out of sync with ${REF}.json:`);
    if (missing.length) {
      console.error(`  Missing (${missing.length}):`);
      missing.forEach((k) => console.error(`    - ${k}`));
    }
    if (extra.length) {
      console.error(`  Extra (${extra.length}):`);
      extra.forEach((k) => console.error(`    + ${k}`));
    }
  }
}

if (failed) {
  console.error('\ni18n: fix key parity across locale files.\n');
  process.exit(1);
}

console.log(`i18n: ${LOCALES.join(', ')} key paths match (${refKeys.size} keys under ${REF}).`);
