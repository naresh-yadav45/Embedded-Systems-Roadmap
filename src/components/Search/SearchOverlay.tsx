import { useEffect, useMemo, useRef, useState } from 'react';
import { BookOpen, CornerDownLeft, Search, X } from 'lucide-react';
import { useStore } from '../../lib/store';
import { search, suggestions, type Hit } from '../../lib/search';
import { AREA_META, AREA_ORDER, KIND_META, PRIORITY_META, PRIORITY_ORDER } from '../../lib/meta';
import { highlight, cn, resourceTitle } from '../../lib/utils';
import { topicById } from '../../lib/data';
import { PriorityBadge } from '../ui';
import type { Area, Priority } from '../../types';

export function SearchOverlay() {
  const { searchOpen, setSearchOpen, showOnMap, openTopic, goResources } = useStore();
  const [q, setQ] = useState('');
  const [area, setArea] = useState<Area | 'all'>('all');
  const [prio, setPrio] = useState<Priority | 'all'>('all');
  const [idx, setIdx] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSearchOpen(!searchOpen); }
      else if (e.key === '/' && !searchOpen && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement)) { e.preventDefault(); setSearchOpen(true); }
      else if (e.key === 'Escape' && searchOpen) setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen, setSearchOpen]);

  useEffect(() => { if (searchOpen) { setTimeout(() => input.current?.focus(), 30); } }, [searchOpen]);

  const result = useMemo(() => search(q, { area, priority: prio }), [q, area, prio]);
  const hits: Hit[] = useMemo(() => [...result.topics.slice(0, 12), ...result.resources.slice(0, 10)], [result]);
  useEffect(() => setIdx(0), [q, area, prio]);
  useEffect(() => { list.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }); }, [idx]);

  if (!searchOpen) return null;
  const choose = (h: Hit) => {
    setSearchOpen(false);
    if (h.type === 'topic') showOnMap(h.topic.id);
    else { goResources(resourceTitle(h.resource)); }
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(hits.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter' && hits[idx]) { e.preventDefault(); choose(hits[idx]); }
  };
  const nTopics = Math.min(12, result.topics.length);

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-900/40 px-3 pt-[8vh] print:hidden" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}>
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-float" onKeyDown={onKeyDown}>
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={18} className="text-muted" />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search topics, protocols, tools and resources…" className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-slate-400" role="combobox" aria-expanded="true" aria-controls="search-results" aria-activedescendant={hits[idx] ? `hit-${idx}` : undefined} aria-label="Search" />
          <button onClick={() => setSearchOpen(false)} aria-label="Close search" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface"><X size={16} /></button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 border-b border-line bg-surface px-4 py-2">
          <select aria-label="Filter by category" className="h-7 rounded-md border border-line bg-white px-2 text-xs" value={area} onChange={(e) => setArea(e.target.value as Area | 'all')}>
            <option value="all">All categories</option>
            {AREA_ORDER.map((a) => <option key={a} value={a}>{AREA_META[a].label}</option>)}
          </select>
          <select aria-label="Filter by priority" className="h-7 rounded-md border border-line bg-white px-2 text-xs" value={prio} onChange={(e) => setPrio(e.target.value as Priority | 'all')}>
            <option value="all">Any priority</option>
            {PRIORITY_ORDER.map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
          </select>
          <span className="ml-auto text-[11px] text-muted">↑↓ navigate · Enter open · Esc close</span>
        </div>
        <ul id="search-results" ref={list} role="listbox" className="scroll-thin flex-1 overflow-y-auto p-2">
          {!q.trim() && (
            <li className="px-3 py-4 text-sm text-muted">
              Try a suggestion:
              <div className="mt-2 flex flex-wrap gap-1.5">{suggestions().map((s) => <button key={s} className="chip" onClick={() => setQ(s)}>{s}</button>)}</div>
            </li>
          )}
          {q.trim() && hits.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">No results for “{q}”. Try fewer words or clear the filters.</li>}
          {hits.map((h, i) => (
            <div key={h.type === 'topic' ? `t-${h.topic.id}` : `r-${h.resource.id}`}>
              {i === 0 && nTopics > 0 && <li role="presentation" className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted">Topics</li>}
              {i === nTopics && <li role="presentation" className="px-3 pb-1 pt-3 text-[11px] font-bold uppercase tracking-wider text-muted">Resources</li>}
              <li id={`hit-${i}`} role="option" aria-selected={i === idx} onMouseEnter={() => setIdx(i)} onClick={() => choose(h)}
                className={cn('flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2', i === idx ? 'bg-brand-soft' : 'hover:bg-surface')}>
                {h.type === 'topic' ? (
                  <>
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: AREA_META[h.area].color }} aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold">{highlight(h.topic.title, q)}</span><PriorityBadge priority={h.priority} /></span>
                      <span className="block truncate text-xs text-muted">{h.topic.path.length ? `${h.topic.path.join(' › ')} · ` : ''}{highlight(h.snippet, q)}</span>
                    </span>
                    <button className="shrink-0 self-center rounded px-1.5 py-0.5 text-[11px] font-semibold text-muted hover:bg-white hover:text-brand" onClick={(e) => { e.stopPropagation(); setSearchOpen(false); openTopic(h.topic.id); }}>Details</button>
                  </>
                ) : (
                  <>
                    <BookOpen size={15} className="mt-1 shrink-0 text-muted" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{highlight(resourceTitle(h.resource), q)}</span>
                      <span className="block truncate text-xs text-muted">{KIND_META[h.resource.kind].label} · {h.resource.topicIds.slice(0, 2).map((id) => topicById.get(id)?.title).join(', ')}</span>
                    </span>
                  </>
                )}
                {i === idx && <CornerDownLeft size={14} className="mt-1 shrink-0 text-muted" />}
              </li>
            </div>
          ))}
        </ul>
      </div>
    </div>
  );
}
