// Verifies every resource URL over HTTP and writes src/data/link-check-report.json.
// Run locally (needs internet): npm run check:links
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resources = JSON.parse(fs.readFileSync(path.join(root, 'src/data/resources.json'), 'utf8'));
const CONCURRENCY = 8;
const results = [];
let i = 0;

async function check(r) {
  const started = Date.now();
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(r.url, { method, redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'Mozilla/5.0 (link-checker)' } });
      if (res.ok || method === 'GET') return { id: r.id, url: r.url, status: res.status, ok: res.ok, ms: Date.now() - started };
    } catch (e) {
      if (method === 'GET') return { id: r.id, url: r.url, status: 0, ok: false, error: String(e.cause?.code || e.message), ms: Date.now() - started };
    }
  }
}
async function worker() {
  while (i < resources.length) {
    const r = resources[i++];
    const out = await check(r);
    results.push(out);
    if (!out.ok) console.log(`[${out.status || 'ERR'}] ${r.url}`);
    if (results.length % 50 === 0) console.log(`${results.length}/${resources.length}`);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));
const broken = results.filter((r) => !r.ok);
fs.writeFileSync(path.join(root, 'src/data/link-check-report.json'), JSON.stringify({ checkedAt: new Date().toISOString(), total: results.length, broken: broken.length, results }, null, 2));
console.log(`Done. ${results.length - broken.length} OK, ${broken.length} need attention (some sites block bots: re-check those by hand).`);
