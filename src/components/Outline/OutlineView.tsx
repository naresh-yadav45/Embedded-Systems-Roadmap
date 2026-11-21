import { useMemo, useState } from 'react';
import { Bookmark, Check, ChevronRight, CircleDashed, Download, Search } from 'lucide-react';
import { buildOutline, countItems, outlineMarkdown, type OutlineItem } from '../../lib/outline';
import { AREA_META } from '../../lib/meta';
import { progressKey } from '../../lib/data';
import { useStore } from '../../lib/store';
import { downloadText, highlight, cn } from '../../lib/utils';
import { PriorityBadge, EmptyState } from '../ui';

function filterItems(items: OutlineItem[], q: string): OutlineItem[] {
  if (!q) return items;
  const out: OutlineItem[] = [];
  for (const it of items) {
    const kids = filterItems(it.children, q);
    if (it.topic.title.toLowerCase().includes(q) || kids.length) out.push({ topic: it.topic, children: kids.length || it.topic.title.toLowerCase().includes(q) ? (kids.length ? kids : it.children) : [] });
  }
  return out;
}

export function OutlineView() {
  const groups = useMemo(buildOutline, []);
  const { openTopic, progress, selection } = useStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const allIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (items: OutlineItem[]) => items.forEach((i) => { if (i.children.length) ids.push(i.topic.id); walk(i.children); });
    groups.forEach((g) => walk(g.items));
    return ids;
  }, [groups]);

  const toggle = (id: string) => setExpanded((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const filtered = groups.map((g) => ({ ...g, items: filterItems(g.items, q) })).filter((g) => g.items.length);
  const total = groups.reduce((s, g) => s + countItems(g.items), 0);

  const renderItem = (it: OutlineItem, depth: number) => {
    const t = it.topic;
    const hasKids = it.children.length > 0;
    const open = !!q || expanded.has(t.id);
    const key = progressKey(t.id);
    const st = progress.topics[key]?.status;
    const bm = progress.topics[key]?.bookmarked;
    const active = selection?.topicId === t.id;
    return (
      <li key={t.id}>
        <div className={cn('group flex items-center gap-1 rounded-lg py-1 pr-2 hover:bg-surface', active && 'bg-brand-soft')} style={{ paddingLeft: depth * 18 + 4 }}>
          {hasKids ? (
            <button onClick={() => toggle(t.id)} aria-expanded={open} aria-label={`${open ? 'Collapse' : 'Expand'} ${t.title}`} className="grid h-6 w-6 shrink-0 place-items-center rounded text-muted hover:bg-white">
              <ChevronRight size={15} className={cn('transition-transform', open && 'rotate-90')} />
            </button>
          ) : <span className="h-6 w-6 shrink-0" aria-hidden />}
          <button onClick={() => openTopic(t.id)} className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left text-sm font-medium text-ink">
            <span className="truncate">{highlight(t.title, q)}</span>
            {hasKids && <span className="shrink-0 text-xs font-normal text-muted">{countItems(it.children)}</span>}
          </button>
          <span className="flex shrink-0 items-center gap-1.5">
            {bm && <Bookmark size={13} className="fill-amber-400 text-amber-500" aria-label="Bookmarked" />}
            {st === 'completed' && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"><Check size={13} />Done</span>}
            {st === 'in-progress' && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600"><CircleDashed size={13} />In progress</span>}
            <span className="hidden sm:block"><PriorityBadge priority={t.priority} /></span>
          </span>
        </div>
        {hasKids && open && <ul>{it.children.map((c) => renderItem(c, depth + 1))}</ul>}
      </li>
    );
  };

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" placeholder="Search the outline…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search outline" />
        </div>
        <button className="btn-outline !py-2" onClick={() => setExpanded(new Set(allIds))}>Expand all</button>
        <button className="btn-outline !py-2" onClick={() => setExpanded(new Set())}>Collapse all</button>
        <button className="btn-outline !py-2" onClick={() => downloadText('embedded-roadmap-outline.md', outlineMarkdown(), 'text/markdown')}><Download size={15} /> Export outline</button>
      </div>
      <p className="mt-3 text-xs text-muted">{total} topics and sub-topics, grouped by area. Colour dots show learning priority where the roadmap defines one.</p>
      {filtered.length === 0 ? (
        <div className="mt-4"><EmptyState title="No topics match your search" hint="Try a shorter term, such as a protocol, language or tool name." /></div>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          {filtered.map((g) => {
            const m = AREA_META[g.area];
            return (
              <section key={g.area} aria-label={m.label} className={cn(g.area === 'software' && 'lg:col-span-1')}>
                <h3 className="mb-1 flex items-center gap-2 border-b-2 pb-2 font-display text-base font-extrabold" style={{ borderColor: m.color, color: m.text }}>
                  <span className="h-3 w-3 rounded-sm" style={{ background: m.color }} aria-hidden /> {m.label}
                  <span className="text-xs font-semibold text-muted">{countItems(g.items)}</span>
                </h3>
                <ul>{g.items.map((it) => renderItem(it, 0))}</ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
