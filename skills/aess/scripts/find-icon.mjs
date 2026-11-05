#!/usr/bin/env node
// Search the bundled icon set by English keyword. Usage: node find-icon.mjs heart sleep "credit card"
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const names = Object.keys(JSON.parse(fs.readFileSync(path.join(HERE, '../assets/icons.json'), 'utf8')));
const queries = process.argv.slice(2);
if (!queries.length) { console.error('usage: find-icon.mjs <keyword> [keyword...]'); process.exit(2); }
for (const q of queries) {
  const tokens = q.toLowerCase().trim().split(/[\s_-]+/).filter(Boolean), slug = tokens.join('-');
  const hits = names.map(n => {
    const parts = n.split('-'); let score = 0;
    if (n === slug) score = 100;
    else if (tokens.every(t => parts.includes(t))) score = 50 - parts.length;
    else if (tokens.every(t => n.includes(t))) score = 25 - parts.length;
    return [n, score];
  }).filter(h => h[1] > 0).sort((a, b) => b[1] - a[1] || a[0].length - b[0].length).slice(0, 12).map(h => h[0]);
  console.log(`${q}: ${hits.length ? hits.join(', ') : '(no match, try a synonym)'}`);
}
