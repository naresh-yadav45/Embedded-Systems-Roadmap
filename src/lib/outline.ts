import type { Area, Topic } from '../types';
import { AREA_ORDER, AREA_META, PRIORITY_META } from './meta';
import { roadmap, topicById, topLevelTopics } from './data';

export interface OutlineItem { topic: Topic; children: OutlineItem[] }
export interface OutlineGroup { area: Area; items: OutlineItem[] }

function build(t: Topic): OutlineItem {
  return { topic: t, children: t.childIds.map((id) => build(topicById.get(id)!)) };
}

export function buildOutline(): OutlineGroup[] {
  return AREA_ORDER.map((area) => ({
    area,
    items: topLevelTopics.filter((t) => t.area === area).map(build),
  })).filter((g) => g.items.length);
}

export function countItems(items: OutlineItem[]): number {
  return items.reduce((s, i) => s + 1 + countItems(i.children), 0);
}

export function flattenOutline(groups: OutlineGroup[]): { depth: number; topic: Topic; area: Area }[] {
  const out: { depth: number; topic: Topic; area: Area }[] = [];
  const walk = (items: OutlineItem[], depth: number, area: Area) => {
    for (const it of items) { out.push({ depth, topic: it.topic, area }); walk(it.children, depth + 1, area); }
  };
  for (const g of groups) walk(g.items, 1, g.area);
  return out;
}

export function outlineMarkdown(): string {
  const lines: string[] = [`# ${roadmap.title}`, '', 'Designed & developed by Naresh Yadav (https://github.com/naresh-yadav45)', ''];
  for (const g of buildOutline()) {
    lines.push(`## ${AREA_META[g.area].label}`, '');
    const walk = (items: OutlineItem[], depth: number) => {
      for (const it of items) {
        const p = it.topic.priority ? ` _(${PRIORITY_META[it.topic.priority].label})_` : '';
        lines.push(`${'  '.repeat(depth)}- ${it.topic.title}${p}`);
        walk(it.children, depth + 1);
      }
    };
    walk(g.items, 0);
    lines.push('');
  }
  lines.push('---', 'Roadmap content based on the Embedded Engineering Roadmap by Meysam Parvizi (CC BY-SA 4.0).');
  return lines.join('\n');
}
