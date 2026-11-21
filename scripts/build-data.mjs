// Builds src/data/{roadmap,resources}.json from the reference README + map.json.
// Run: npm run build:data
// Roadmap content: m3y54m/Embedded-Engineering-Roadmap (CC BY-SA 4.0), (c) Meysam Parvizi.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRoadmap, slugify, normalizeUrl } from './parser.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readme = fs.readFileSync(path.join(root, 'reference/README.original.md'), 'utf8');
const map = JSON.parse(fs.readFileSync(path.join(root, 'reference/map.original.json'), 'utf8'));
const dataDir = path.join(root, 'src/data');

const parsed = parseRoadmap(readme);
const report = { generatedFrom: 'reference/README.original.md + reference/map.original.json', warnings: [], notes: [] };
const warn = (m) => report.warnings.push(m);

// ---------- helpers ----------
const norm = (s) => s.normalize('NFKC').replace(/µ/g, 'μ').trim();
const topicByTitle = new Map();
for (const t of parsed.topics) if (!topicByTitle.has(norm(t.title))) topicByTitle.set(norm(t.title), t);

function resolveTopics(title) {
  const t = norm(title);
  if (topicByTitle.has(t)) return [topicByTitle.get(t)];
  const viaMap = map.readme?.[title] || (title === 'IPC' ? ['Inter-Process Communication (IPC)'] : null);
  if (viaMap) {
    const found = viaMap.map((n) => topicByTitle.get(norm(n))).filter(Boolean);
    if (found.length) return found;
  }
  const loose = parsed.topics.find((x) => norm(x.title).startsWith(`${t} (`) || norm(x.title).startsWith(`${t} /`) || norm(x.title).startsWith(`${t} `));
  return loose ? [loose] : [];
}

const AREA_BY_BAND = { SOFTWARE: 'software', 'SOFTWARE ∩ HARDWARE': 'both', HARDWARE: 'hardware', 'SOFT SKILLS': 'soft' };
const BAND_ID = { software: 'software', both: 'both', hardware: 'hardware', soft: 'soft' };
const CLUSTER_TITLE = {
  languages: 'Programming Languages', fundamentals: 'Programming Fundamentals', debugging: 'Debugging', sdlc: 'SDLC Models',
  vcs: 'Version Control', build: 'Build Systems', testing: 'Testing', specialized: 'Specialized Topics', osBase: 'Operating Systems',
  linux: 'Embedded Linux', rtos: 'Real-Time Operating Systems', mcu: 'Microcontroller Fundamentals', bridge: 'Core Concepts',
  basic: 'Basic Communication', wireless: 'Wireless Communication', highSpeed: 'High-Speed Communication',
  industrial: 'Industrial Communication', cellular: 'Cellular', network: 'Networking', automotive: 'Automotive Communication',
  display: 'Display & Camera', electronics: 'Electronics', equipment: 'Test Equipment', prototyping: 'Prototyping',
  fpga: 'Advanced Hardware', soft: 'Soft Skills',
};
const PRIORITY = { required: 'required', recommended: 'recommended', possible: 'optional' };
const PRIO_RANK = { required: 3, recommended: 2, optional: 1 };

// ---------- graph nodes ----------
const nodes = [];
const nodeByTitle = new Map();
const bands = [];
for (const band of map.bands) {
  const area = AREA_BY_BAND[band.label];
  bands.push({ id: BAND_ID[area], label: band.label, area, clusterIds: Object.keys(band.clusters) });
  for (const [cid, c] of Object.entries(band.clusters)) {
    for (const [title, prio] of c.topics) {
      const tops = resolveTopics(title);
      if (!tops.length) warn(`map topic "${title}" has no README topic`);
      const id = `n-${slugify(title)}`;
      if (nodes.some((n) => n.id === id)) warn(`duplicate node id ${id}`);
      const node = {
        id, title, area, clusterId: cid, clusterTitle: CLUSTER_TITLE[cid] || c.header || c.caption || cid,
        priority: PRIORITY[prio] || 'optional',
        topicIds: tops.map((t) => t.id),
        primaryTopicId: tops[0]?.id ?? null,
      };
      nodes.push(node);
      nodeByTitle.set(title, node);
    }
  }
}
const clusters = [];
for (const band of map.bands) {
  for (const [cid, c] of Object.entries(band.clusters)) {
    clusters.push({
      id: cid, title: CLUSTER_TITLE[cid] || c.header || c.caption || cid, bandId: BAND_ID[AREA_BY_BAND[band.label]],
      per: c.per ?? (c.topics.length <= 3 ? 1 : 2), nodeIds: c.topics.map(([t]) => nodeByTitle.get(t).id),
    });
  }
}

// curated edges
const edges = [];
for (const [a, b, why] of map.links) {
  const na = nodeByTitle.get(a), nb = nodeByTitle.get(b);
  if (!na || !nb) { warn(`map link refers to unknown topic: ${a} -> ${b}`); continue; }
  edges.push({ id: `e-${na.id}__${nb.id}`, source: na.id, target: nb.id, reason: why });
}

// ---------- README topics ----------
const TOP_AREA = {
  'Soft Skills': 'soft',
  Electronics: 'hardware', 'Using Test Equipment': 'hardware', 'Prototyping Skills': 'hardware', 'FPGA Development': 'hardware',
  'Programming Fundamentals': 'software', 'Programming Languages': 'software', 'Operating Systems': 'software', Debugging: 'software',
  'Build System': 'software', 'Software Development Life Cycle (SDLC) Models': 'software', 'Version Control Systems': 'software',
  Testing: 'software', 'Embedded Security': 'software', 'Embedded GUI': 'software', 'IoT (Internet of Things)': 'software',
  'Edge AI': 'software', 'AUTOSAR Architecture': 'software',
  Microcontrollers: 'both', 'Interfaces, Protocols & Communication Technologies': 'both', 'Memory Technologies & File Systems': 'both',
  'Hardware Simulation / Emulation': 'both', 'Sensors & Actuators': 'both', 'Digital Signal Processing': 'both', 'Control Theory': 'both',
};
const nodesByTopic = new Map();
for (const n of nodes) for (const tid of n.topicIds) { if (!nodesByTopic.has(tid)) nodesByTopic.set(tid, []); nodesByTopic.get(tid).push(n); }

const childIdsOf = (t) => t.children.map((c) => c.id);
const topicOut = new Map();
function visit(t, inherited) {
  const mapped = nodesByTopic.get(t.id) || [];
  const best = [...mapped].sort((a, b) => PRIO_RANK[b.priority] - PRIO_RANK[a.priority])[0];
  const topLevel = t.parent && t.parent.id === 'root';
  let area = best ? best.area : inherited.area;
  if (topLevel && !best) area = TOP_AREA[t.title] || 'general';
  const priority = best ? best.priority : inherited.priority;
  topicOut.set(t.id, {
    id: t.id, title: t.title, icon: t.icon || '', parentId: t.parent && t.parent.id !== 'root' ? t.parent.id : null,
    depth: t.depth, path: t.path, section: t.group, area: area || 'general', priority: priority || null,
    nodeIds: mapped.map((n) => n.id), childIds: childIdsOf(t), resourceKeys: t.resources.map((r) => r), description: t.description,
    ownResourceCount: t.resources.length, totalResourceCount: t.total,
  });
  for (const c of t.children) visit(c, { area, priority });
}
for (const top of parsed.topics.filter((t) => t.parent.id === 'root')) visit(top, { area: null, priority: null });

// ---------- resources ----------
const YT_HOST = /(^|\.)youtube\.com$|(^|\.)youtu\.be$|(^|\.)youtube-nocookie\.com$/;
function parseYouTube(url) {
  let u; try { u = new URL(url); } catch { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, '');
  if (!YT_HOST.test(host)) return null;
  const list = u.searchParams.get('list');
  const t = u.searchParams.get('t') || u.searchParams.get('start');
  if (host === 'youtu.be') { const id = u.pathname.slice(1).split('/')[0]; return id ? { kind: 'video', videoId: id, listId: list || undefined, start: t || undefined } : null; }
  const p = u.pathname;
  if (p === '/watch' && u.searchParams.get('v')) return { kind: 'video', videoId: u.searchParams.get('v'), listId: list || undefined, start: t || undefined };
  if (p === '/playlist' && list) return { kind: 'playlist', listId: list };
  const m = p.match(/^\/(embed|live|shorts|v)\/([\w-]{6,})/);
  if (m) return { kind: 'video', videoId: m[2], start: t || undefined };
  if (/^\/(@|c\/|channel\/|user\/)/.test(p)) return { kind: 'channel' };
  return { kind: 'other' };
}
const BOOK_HOSTS = /(^|\.)(a\.co|amzn\.to|amazon\.[a-z.]+|packtpub\.com|link\.springer\.com|nostarch\.com|manning\.com|pragprog\.com|wiley\.com|routledge\.com|elsevier\.com|sciencedirect\.com)$/;
const COURSE_HOSTS = /(^|\.)(edx\.org|ocw\.mit\.edu|udacity\.com|pluralsight\.com|skillshare\.com|futurelearn\.com|khanacademy\.org|openlearninglibrary\.mit\.edu|nptel\.ac\.in|swayam\.gov\.in)$/;
const TOOL_PATH = /Development Environments|Vendor IDEs|VS Code Extensions|PlatformIO/;
function classify(url, title, origType, topicPath) {
  const yt = parseYouTube(url);
  let host = ''; try { host = new URL(url).hostname.replace(/^www\./, ''); } catch { /* invalid */ }
  if (yt) {
    if (yt.kind === 'video') return ['youtube-video', yt];
    if (yt.kind === 'playlist') return ['youtube-playlist', yt];
    if (yt.kind === 'channel') return ['youtube-channel', yt];
    return ['other-video', yt];
  }
  if (/(^|\.)coursera\.org$/.test(host)) return ['coursera', null];
  if (/(^|\.)udemy\.com$/.test(host)) return ['udemy', null];
  if (origType === 'book' || origType === 'audio' || BOOK_HOSTS.test(host) || (/(^|\.)oreilly\.com$/.test(host) && /\/library\/view\//.test(url))) return ['book', null];
  if (COURSE_HOSTS.test(host)) return ['course', null];
  if (/\.pdf($|\?|#)/i.test(url) || /datasheet/i.test(title)) return ['datasheet', null];
  if (TOOL_PATH.test(topicPath) || /(^|\.)(platformio\.org|marketplace\.visualstudio\.com|code\.visualstudio\.com)$/.test(host)) return ['tool', null];
  if (/(^|\.)(github\.com|gitlab\.com|codeberg\.org)$/.test(host)) return ['repository', null];
  if (/^docs\./.test(host) || /readthedocs|\.docs\.|\/docs?(\/|$)|\/documentation|\/manual/i.test(url) || /\b(documentation|manual|reference manual|docs)\b/i.test(title)) return ['documentation', null];
  if (origType === 'video') return ['other-video', null];
  return ['article', null];
}

const resources = new Map(); // normalized url -> resource
const originalUrlsSeen = new Set();
let assocCount = 0;
function addResource(r, topic, source) {
  const key = normalizeUrl(r.url);
  originalUrlsSeen.add(r.url);
  const tpath = [...(topic?.path || []), topic?.title || ''].join(' > ');
  let res = resources.get(key);
  if (!res) {
    const [kind, yt] = classify(r.url, r.title || '', r.type, tpath);
    let urlValid = true, protocol = '';
    try { protocol = new URL(r.url).protocol; urlValid = /^https?:$/.test(protocol); } catch { urlValid = false; }
    res = {
      id: `r${String(resources.size + 1).padStart(4, '0')}`, url: r.url, title: r.title || '', kind, domain: r.domain || '',
      beginner: !!r.beginner, gem: !!r.gem, audio: r.type === 'audio', note: r.note || '', topicIds: [], associations: [],
      source, youtube: yt || undefined, urlVariants: [], validation: { urlValid, issues: [] }, linkStatus: 'unchecked',
    };
    if (!urlValid) res.validation.issues.push('invalid-url-structure');
    if (!res.title) res.validation.issues.push('missing-title');
    resources.set(key, res);
  } else {
    if (res.url !== r.url && !res.urlVariants.includes(r.url)) res.urlVariants.push(r.url);
    res.beginner ||= !!r.beginner; res.gem ||= !!r.gem;
    if (!res.title && r.title) { res.title = r.title; res.validation.issues = res.validation.issues.filter((i) => i !== 'missing-title'); }
    if (!res.note && r.note) res.note = r.note;
  }
  if (topic && !res.topicIds.includes(topic.id)) {
    res.topicIds.push(topic.id);
    res.associations.push({ topicId: topic.id, title: r.title || '', note: r.note || '' });
    assocCount += 1;
  }
}
for (const t of parsed.topics) for (const r of t.resources) addResource(r, t, 'readme-list');

// Second pass: any README URL that the list parser did not capture (inline links in prose etc.)
const URL_RE = /https?:\/\/[^\s()<>\]"'`]+(?:\([^\s()]*\)[^\s()<>\]"'`]*)*/g;
const headingRe = /^(#{1,6})\s+(.+)$/;
const preorder = parsed.topics; // doc order == pre-order
let hIdx = -1, currentTopic = null;
const inlineExtras = [];
const excluded = [];
for (const line of readme.replace(/\r\n?/g, '\n').split('\n')) {
  const h = line.match(headingRe);
  if (h) { if (h[1].length >= 3) { hIdx += 1; currentTopic = preorder[hIdx] || currentTopic; } else currentTopic = null; }
  for (let m of line.matchAll(URL_RE)) {
    let url = m[0].replace(/[.,;:!?*_]+$/, '');
    if (/img\.shields\.io|github\.com\/m3y54m\/Embedded-Engineering-Roadmap\/(stargazers|forks|graphs|releases|watchers)|m3y54m\.github\.io\/Embedded-Engineering-Roadmap|creativecommons\.org/.test(url)) { excluded.push(url); continue; }
    if (!resources.has(normalizeUrl(url))) {
      const lm = line.match(/\[([^\]]+)\]\(([^)]*)\)/g);
      let title = '';
      for (const mm of lm || []) { const q = mm.match(/\[([^\]]+)\]\(([^)]*)\)/); if (q[2].startsWith(url)) title = q[1]; }
      inlineExtras.push(url);
      addResource({ url, title: title.replace(/^[\p{Extended_Pictographic}\uFE0F\u200D\s]+/u, ''), type: 'link', domain: '', beginner: false, gem: false, note: '' }, currentTopic, 'readme-inline');
    }
  }
}
report.notes.push(`${inlineExtras.length} README URL(s) were not in list-style entries and were added from inline text: ${inlineExtras.slice(0, 20).join(' | ')}`);
report.notes.push(`${excluded.length} badge/license URL(s) were intentionally excluded (shields.io badges, repo stargazer/fork links, license).`);

// title fallbacks (never invented: only from the README's own labels)
const resList = [...resources.values()];
for (const r of resList) {
  if (!r.title) { r.validation.issues.push('missing-title'); }
  if (!r.topicIds.length) r.validation.issues.push('no-topic-association');
  if (/^http:\/\//.test(r.url)) r.validation.issues.push('insecure-http');
  r.needsVerification = r.validation.issues.some((i) => ['invalid-url-structure', 'missing-title', 'no-topic-association'].includes(i));
  r.validation.issues = [...new Set(r.validation.issues)];
  if (!r.title) r.displayTitleFallback = r.domain || (() => { try { return new URL(r.url).hostname; } catch { return r.url; } })();
}

// every raw README URL must be present
const rawAll = new Set((readme.match(URL_RE) || []).map((u) => u.replace(/[.,;:!?*_]+$/, '')));
const missing = [...rawAll].filter((u) => !resources.has(normalizeUrl(u)) && !excluded.includes(u));
if (missing.length) warn(`README URLs missing from dataset: ${missing.join(', ')}`);
const rawYoutube = (readme.match(URL_RE) || []).filter((u) => /youtube\.com|youtu\.be/.test(u));

// ---------- topic-level resource ids ----------
const keyOf = (u) => resources.get(normalizeUrl(u)).id;
for (const t of parsed.topics) {
  const out = topicOut.get(t.id);
  out.resourceIds = [...new Set(t.resources.map((r) => keyOf(r.url)))];
  delete out.resourceKeys;
}
// (inline extras are also attached through resource.topicIds; merge them into topics)
for (const r of resList) for (const tid of r.topicIds) { const o = topicOut.get(tid); if (o && !o.resourceIds.includes(r.id)) o.resourceIds.push(r.id); }

// ---------- auto links from the README text ----------
const autoLinks = parsed.links.map((l) => ({
  a: l.source.id, b: l.target.id, weight: l.weight,
  shared: l.shared, mentions: l.mentions.map((m) => ({ topicId: m.topic.id, text: m.text })),
}));

// ---------- write ----------
const roadmap = {
  title: 'Embedded Systems Engineering Roadmap',
  source: { name: 'Embedded Engineering Roadmap', author: 'Meysam Parvizi', repo: 'https://github.com/m3y54m/Embedded-Engineering-Roadmap', license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  bands, clusters, nodes, edges, autoLinks,
  topics: [...topicOut.values()],
  sections: parsed.groups.map((g) => ({ title: g.title, topicIds: g.topics.map((t) => t.id) })),
};
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, 'roadmap.json'), JSON.stringify(roadmap));
fs.writeFileSync(path.join(dataDir, 'resources.json'), JSON.stringify(resList));

// ---------- validation report ----------
const kinds = {};
for (const r of resList) kinds[r.kind] = (kinds[r.kind] || 0) + 1;
const dupRaw = {};
for (const u of readme.match(URL_RE) || []) { const k = u.replace(/[.,;:!?*_]+$/, ''); dupRaw[k] = (dupRaw[k] || 0) + 1; }
report.summary = {
  readmeTopics: parsed.topics.length, graphNodes: nodes.length, curatedEdges: edges.length, autoLinks: autoLinks.length,
  uniqueResources: resList.length, resourceTopicAssociations: assocCount,
  youtubeUrlOccurrencesInReadme: rawYoutube.length, uniqueYoutubeUrlsInReadme: new Set(rawYoutube).size,
  youtubeResourcesInDataset: resList.filter((r) => r.kind.startsWith('youtube')).length,
  byKind: kinds, needsVerification: resList.filter((r) => r.needsVerification).length,
  withIssues: resList.filter((r) => r.validation.issues.length).length,
};
report.duplicateRawUrls = Object.entries(dupRaw).filter(([, n]) => n > 1).map(([u, n]) => ({ url: u, occurrences: n }));
report.needsVerification = resList.filter((r) => r.needsVerification).map((r) => ({ id: r.id, url: r.url, issues: r.validation.issues, topicIds: r.topicIds }));
report.multiTopicResources = resList.filter((r) => r.topicIds.length > 1).length;
report.networkCheck = 'Not performed at build time (offline sandbox). Run `npm run check:links` locally to verify HTTP status of every link.';
fs.writeFileSync(path.join(dataDir, 'validation-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary, null, 2));
console.log('warnings:', report.warnings);
console.log(report.notes);
