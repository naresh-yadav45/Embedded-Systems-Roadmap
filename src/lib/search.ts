import type { Area, Priority, Resource, Topic } from '../types';
import { nodesByTopic, resources, roadmap, topicById, resourceById } from './data';
import { resourceTitle } from './utils';
import { KIND_META } from './meta';

export interface TopicHit { type: 'topic'; topic: Topic; score: number; snippet: string; area: Area; priority: Priority | null }
export interface ResourceHit { type: 'resource'; resource: Resource; score: number }
export type Hit = TopicHit | ResourceHit;

const descText = (t: Topic) =>
  t.description.map((b) => (b.type === 'p' ? b.text : b.type === 'ul' ? b.items.join(' ') : b.paragraphs.join(' '))).join(' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_`]/g, '');

interface TopicIndexItem { topic: Topic; title: string; path: string; desc: string; extra: string }
const topicIndex: TopicIndexItem[] = roadmap.topics.map((t) => ({
  topic: t,
  title: t.title.toLowerCase(),
  path: t.path.join(' ').toLowerCase(),
  desc: descText(t).toLowerCase(),
  extra: (nodesByTopic.get(t.id) ?? []).map((n) => `${n.title} ${n.clusterTitle}`).join(' ').toLowerCase(),
}));
const resourceIndex = resources.map((r) => ({
  r,
  title: resourceTitle(r).toLowerCase(),
  rest: `${r.note} ${r.domain} ${r.url} ${KIND_META[r.kind].label} ${r.topicIds.map((id) => topicById.get(id)?.title ?? '').join(' ')}`.toLowerCase(),
}));

function snippetFor(text: string, tokens: string[]): string {
  const lower = text.toLowerCase();
  let idx = -1;
  for (const tk of tokens) { idx = lower.indexOf(tk); if (idx >= 0) break; }
  if (idx < 0) return text.slice(0, 120);
  const start = Math.max(0, idx - 40);
  return (start > 0 ? '…' : '') + text.slice(start, start + 140) + (start + 140 < text.length ? '…' : '');
}

export interface SearchFilters { area: Area | 'all'; priority: Priority | 'all' }

export function search(query: string, filters: SearchFilters, limit = 40): { topics: TopicHit[]; resources: ResourceHit[] } {
  const q = query.trim().toLowerCase();
  const tokens = q.split(/\s+/).filter(Boolean);
  if (!tokens.length) return { topics: [], resources: [] };
  const topics: TopicHit[] = [];
  for (const it of topicIndex) {
    const t = it.topic;
    if (filters.area !== 'all' && t.area !== filters.area) continue;
    if (filters.priority !== 'all' && t.priority !== filters.priority) continue;
    let score = 0;
    let ok = true;
    for (const tk of tokens) {
      let s = 0;
      if (it.title === tk) s = 100;
      else if (it.title.startsWith(tk)) s = 60;
      else if (it.title.includes(tk)) s = 40;
      else if (it.extra.includes(tk)) s = 25;
      else if (it.path.includes(tk)) s = 15;
      else if (it.desc.includes(tk)) s = 8;
      if (!s) { ok = false; break; }
      score += s;
    }
    if (!ok) continue;
    if (nodesByTopic.has(t.id)) score += 3;
    topics.push({ type: 'topic', topic: t, score, snippet: snippetFor(descText(t), tokens), area: t.area, priority: t.priority });
  }
  topics.sort((a, b) => b.score - a.score);

  const res: ResourceHit[] = [];
  for (const it of resourceIndex) {
    const r = it.r;
    if (filters.priority !== 'all' || filters.area !== 'all') {
      const match = r.topicIds.some((id) => {
        const t = topicById.get(id);
        return t && (filters.area === 'all' || t.area === filters.area) && (filters.priority === 'all' || t.priority === filters.priority);
      });
      if (!match) continue;
    }
    let score = 0;
    let ok = true;
    for (const tk of tokens) {
      let s = 0;
      if (it.title.includes(tk)) s = it.title.startsWith(tk) ? 30 : 20;
      else if (it.rest.includes(tk)) s = 6;
      if (!s) { ok = false; break; }
      score += s;
    }
    if (ok) res.push({ type: 'resource', resource: r, score });
  }
  res.sort((a, b) => b.score - a.score);
  return { topics: topics.slice(0, limit), resources: res.slice(0, limit) };
}

export function suggestions(): string[] {
  return ['FreeRTOS', 'I2C', 'CAN bus', 'Interrupts', 'Yocto', 'PCB', 'MQTT', 'Rust'];
}

export { resourceById };
