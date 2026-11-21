import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Bookmark, ChevronRight, Crosshair, Lightbulb, Network, X } from 'lucide-react';
import {
  adjacency, autoLinksByTopic, nodeById, nodesByTopic, projects, resourceById, resourcesOfTopic, topicById,
} from '../../lib/data';
import { useStore } from '../../lib/store';
import { KIND_META, KIND_ORDER, STATUS_META, AREA_META } from '../../lib/meta';
import { InlineMd, cn } from '../../lib/utils';
import { prerequisitesFor } from '../../lib/prerequisites';
import { AreaBadge, PriorityBadge } from '../ui';
import { ResourceCard } from '../ResourceLibrary/ResourceCard';
import type { DescBlock, Resource, ResourceKind, Status, Topic } from '../../types';

function Block({ b }: { b: DescBlock }) {
  if (b.type === 'p') return <p className="text-sm leading-relaxed text-slate-700"><InlineMd text={b.text} /></p>;
  if (b.type === 'ul') return <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">{b.items.map((i, k) => <li key={k}><InlineMd text={i} /></li>)}</ul>;
  return (
    <blockquote className="rounded-lg border-l-4 border-slate-300 bg-surface px-3 py-2 text-sm text-slate-700">
      {b.paragraphs.map((p, i) => <p key={i} className={i ? 'mt-2' : ''}><InlineMd text={p} /></p>)}
      <footer className="mt-1.5 text-xs text-muted">— <a className="font-medium text-brand hover:underline" href={b.url} target="_blank" rel="noopener noreferrer">{b.source}</a></footer>
    </blockquote>
  );
}

export function TopicPanel() {
  const { selection, closePanel, openNode, openTopic, progress, setStatus, toggleBookmark, setNote, showOnMap, goResources } = useStore();
  const scroller = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<'all' | ResourceKind>('all');
  const open = !!selection;
  const topic: Topic | undefined = selection ? topicById.get(selection.topicId) : undefined;
  const node = selection?.nodeId ? nodeById.get(selection.nodeId) : undefined;

  useEffect(() => { setFilter('all'); scroller.current?.scrollTo({ top: 0 }); }, [selection?.nodeId, selection?.topicId]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closePanel]);

  const key = node ? node.id : topic ? (nodesByTopic.get(topic.id)?.length === 1 ? nodesByTopic.get(topic.id)![0].id : `t-${topic.id}`) : '';

  // Topics covered by this panel: a graph node can cover several README topics (e.g. "ADC / DAC").
  const coveredIds = node ? node.topicIds : topic ? [topic.id] : [];
  const resources = useMemo(() => {
    const seen = new Set<string>();
    const list: Resource[] = [];
    for (const id of coveredIds) for (const r of resourcesOfTopic(id)) if (!seen.has(r.id)) { seen.add(r.id); list.push(r); }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection?.nodeId, selection?.topicId]);

  if (!topic) return null;
  const area = node?.area ?? topic.area;
  const priority = node?.priority ?? topic.priority;
  const title = node?.title ?? topic.title;
  const p = progress.topics[key];
  const status: Status = p?.status ?? 'not-started';

  const connections = node ? (adjacency.get(node.id) ?? []) : [];
  const autoRelated = coveredIds.flatMap((id) => autoLinksByTopic.get(id) ?? []).sort((a, b) => b.weight - a.weight);
  const connectedTopicIds = new Set(connections.map((c) => nodeById.get(c.other)?.primaryTopicId));
  const subtopics = coveredIds.flatMap((id) => topicById.get(id)?.childIds ?? []).map((id) => topicById.get(id)!).filter(Boolean);
  const descBlocks: DescBlock[] = coveredIds.flatMap((id) => topicById.get(id)?.description ?? []);
  const prereqs = node ? prerequisitesFor(node.id) : [];
  const related = projects.filter((pr) => node && pr.topics.includes(node.title));
  const breadcrumb = [...topic.path, ...(node ? [] : [topic.title])];
  const kindsPresent = KIND_ORDER.filter((k) => resources.some((r) => r.kind === k));
  const shown = filter === 'all' ? resources : resources.filter((r) => r.kind === filter);
  const grouped = KIND_ORDER.map((k) => ({ k, items: shown.filter((r) => r.kind === k) })).filter((g) => g.items.length);
  const m = AREA_META[area];

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/30 lg:hidden print:hidden" onClick={closePanel} aria-hidden />
      <aside role="dialog" aria-modal="false" aria-label={`Details: ${title}`}
        className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-line bg-white shadow-float sm:w-[460px] print:hidden">
        <header className="shrink-0 border-b border-line px-5 py-4" style={{ borderTop: `4px solid ${m.color}` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              {breadcrumb.length > 0 && (
                <nav aria-label="Breadcrumb" className="mb-1 flex flex-wrap items-center gap-0.5 text-[11px] text-muted">
                  {breadcrumb.map((b, i) => <span key={i} className="inline-flex items-center gap-0.5">{i > 0 && <ChevronRight size={10} />}{b}</span>)}
                </nav>
              )}
              <h3 className="font-display text-xl font-extrabold leading-tight">{title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <AreaBadge area={area} />
                <PriorityBadge priority={priority} />
                {node && <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-slate-600">{node.clusterTitle}</span>}
              </div>
            </div>
            <button onClick={closePanel} aria-label="Close details" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-surface"><X size={18} /></button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="status-select">Learning status</label>
            <select id="status-select" className="h-8 rounded-lg border border-line bg-white px-2 text-xs font-semibold" value={status} onChange={(e) => setStatus(key, e.target.value as Status)} style={{ color: STATUS_META[status].color }}>
              {(Object.keys(STATUS_META) as Status[]).map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select>
            <button onClick={() => toggleBookmark(key)} aria-pressed={!!p?.bookmarked} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold hover:bg-surface">
              <Bookmark size={14} className={cn(p?.bookmarked && 'fill-amber-400 text-amber-500')} /> {p?.bookmarked ? 'Bookmarked' : 'Bookmark'}
            </button>
            {!node && (nodesByTopic.get(topic.id)?.length ?? 0) > 0 && (
              <button onClick={() => showOnMap(topic.id)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line px-2.5 text-xs font-semibold hover:bg-surface"><Crosshair size={14} /> On roadmap</button>
            )}
          </div>
        </header>

        <div ref={scroller} className="scroll-thin flex-1 space-y-6 overflow-y-auto px-5 py-5">
          {node && node.topicIds.length > 1 && (
            <p className="rounded-lg bg-surface px-3 py-2 text-xs text-slate-600">This roadmap box covers: {node.topicIds.map((id, i) => <span key={id}>{i > 0 && ', '}<button className="font-semibold text-brand hover:underline" onClick={() => openTopic(id)}>{topicById.get(id)?.title}</button></span>)}.</p>
          )}

          <section aria-labelledby="tp-about">
            <h4 id="tp-about" className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">About this topic</h4>
            {descBlocks.length ? <div className="space-y-3">{descBlocks.map((b, i) => <Block key={i} b={b} />)}</div>
              : <p className="rounded-lg border border-dashed border-line px-3 py-3 text-sm text-muted">The original roadmap has no written description for this topic yet — it needs to be added. The resources below are still the original curated links.</p>}
          </section>

          {node && (
            <section aria-labelledby="tp-why">
              <h4 id="tp-why" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><Lightbulb size={13} /> Why it matters · how it connects</h4>
              {connections.length ? (
                <ul className="space-y-1.5">
                  {connections.map((c) => {
                    const o = nodeById.get(c.other)!;
                    return (
                      <li key={c.edgeId}>
                        <button onClick={() => openNode(o.id)} className="group flex w-full items-start gap-2 rounded-lg border border-line px-3 py-2 text-left hover:border-brand hover:bg-brand-soft/40">
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ background: AREA_META[o.area].color }} />
                          <span className="min-w-0"><span className="block text-sm font-semibold">{o.title}</span><span className="block text-xs leading-snug text-muted">{c.reason}</span></span>
                          <ArrowRight size={14} className="ml-auto mt-1 shrink-0 text-muted group-hover:text-brand" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="text-sm text-muted">No curated connections are defined for this topic.</p>}
            </section>
          )}

          <section aria-labelledby="tp-pre">
            <h4 id="tp-pre" className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><Network size={13} /> Prerequisites</h4>
            {prereqs.length ? (
              <>
                <div className="flex flex-wrap gap-1.5">{prereqs.map((n) => <button key={n.id} onClick={() => openNode(n.id)} className="rounded-full border border-line px-2.5 py-1 text-xs font-semibold hover:border-brand hover:text-brand">{n.title}</button>)}</div>
                <p className="mt-1.5 text-[11px] text-muted">Suggested foundations curated for this project; the original roadmap does not define strict prerequisites.</p>
              </>
            ) : <p className="rounded-lg border border-dashed border-line px-3 py-2 text-sm text-muted">No prerequisites have been added for this topic yet.</p>}
          </section>

          {subtopics.length > 0 && (
            <section aria-labelledby="tp-sub">
              <h4 id="tp-sub" className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Sub-topics ({subtopics.length})</h4>
              <div className="flex flex-wrap gap-1.5">{subtopics.map((s) => <button key={s.id} onClick={() => openTopic(s.id)} className="rounded-full border border-line bg-white px-2.5 py-1 text-xs font-semibold hover:border-brand hover:text-brand">{s.title}</button>)}</div>
            </section>
          )}

          {autoRelated.filter((a) => !connectedTopicIds.has(a.other)).length > 0 && (
            <section aria-labelledby="tp-also">
              <h4 id="tp-also" className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Also mentioned together</h4>
              <div className="flex flex-wrap gap-1.5">
                {autoRelated.filter((a) => !connectedTopicIds.has(a.other)).slice(0, 8).map((a) => (
                  <button key={a.other} title={a.mention ?? a.shared.join(', ')} onClick={() => openTopic(a.other)} className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-brand">{topicById.get(a.other)?.title}</button>
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="tp-res">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h4 id="tp-res" className="text-xs font-bold uppercase tracking-wider text-muted">Learning resources ({resources.length})</h4>
              {resources.length > 0 && <button className="text-xs font-semibold text-brand hover:underline" onClick={() => { closePanel(); goResources(title); }}>Open in library</button>}
            </div>
            {resources.length === 0 ? (
              <p className="rounded-lg border border-dashed border-line px-3 py-3 text-sm text-muted">No resources are attached directly to this topic. Check its sub-topics{subtopics.length ? ' above' : ''} or search the library.</p>
            ) : (
              <>
                {kindsPresent.length > 1 && (
                  <div className="mb-3 flex flex-wrap gap-1.5" role="group" aria-label="Filter resources by type">
                    <button className="chip" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>All {resources.length}</button>
                    {kindsPresent.map((k) => <button key={k} className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>{KIND_META[k].group} {resources.filter((r) => r.kind === k).length}</button>)}
                  </div>
                )}
                <div className="space-y-5">
                  {grouped.map((g) => (
                    <div key={g.k}>
                      <h5 className="mb-2 text-sm font-bold">{KIND_META[g.k].group}</h5>
                      <div className="grid gap-3">{g.items.map((r) => <ResourceCard key={r.id} r={resourceById.get(r.id)!} showTopics={false} />)}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section aria-labelledby="tp-proj">
            <h4 id="tp-proj" className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Suggested projects · practical exercises</h4>
            {related.length ? (
              <ul className="space-y-1.5">
                {related.map((pr) => (
                  <li key={pr.id}><a href="#projects" onClick={(e) => { e.preventDefault(); closePanel(); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); }} className="flex items-center justify-between rounded-lg border border-line px-3 py-2 text-sm font-semibold hover:border-brand">
                    {pr.name}<span className="text-[11px] font-medium capitalize text-muted">{pr.difficulty}</span></a></li>
                ))}
              </ul>
            ) : <p className="rounded-lg border border-dashed border-line px-3 py-2 text-sm text-muted">No project or exercise has been linked to this topic yet — it needs to be added.</p>}
          </section>

          <section aria-labelledby="tp-notes">
            <h4 id="tp-notes" className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Your notes</h4>
            <textarea className="input min-h-[96px] resize-y" placeholder="Private notes, saved in this browser only…" value={p?.note ?? ''} onChange={(e) => setNote(key, e.target.value)} aria-label={`Notes for ${title}`} maxLength={5000} />
          </section>
        </div>
      </aside>
    </>
  );
}
