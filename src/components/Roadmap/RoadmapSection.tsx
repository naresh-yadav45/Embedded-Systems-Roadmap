import { lazy, Suspense, useEffect, useState } from 'react';
import { Info, LayoutGrid, ListTree } from 'lucide-react';
import { useStore } from '../../lib/store';
import { stats } from '../../lib/data';
import { AREA_META, PRIORITY_META, PRIORITY_ORDER } from '../../lib/meta';
import { cn } from '../../lib/utils';
import { MobileGroups } from './MobileGroups';
import { OutlineView } from '../Outline/OutlineView';

const RoadmapGraph = lazy(() => import('./RoadmapGraph').then((m) => ({ default: m.RoadmapGraph })));

function useIsDesktop() {
  const [v, setV] = useState(() => window.matchMedia('(min-width: 900px)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const on = () => setV(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return v;
}

export function RoadmapSection() {
  const { priorityFilter, setPriorityFilter } = useStore();
  const [view, setView] = useState<'graph' | 'outline'>('graph');
  const desktop = useIsDesktop();
  const [full, setFull] = useState(false);
  useEffect(() => { if (!full) return; const on = (e: KeyboardEvent) => { if (e.key === 'Escape') setFull(false); }; window.addEventListener('keydown', on); return () => window.removeEventListener('keydown', on); }, [full]);

  const filters: { key: typeof priorityFilter; label: string; count: number }[] = [
    { key: 'all', label: 'Show All', count: stats.mapTopics },
    { key: 'required', label: 'Required Only', count: stats.byPriority.required },
    { key: 'recommended', label: 'Recommended Only', count: stats.byPriority.recommended },
    { key: 'optional', label: 'Optional Only', count: stats.byPriority.optional },
  ];
  const visible = priorityFilter === 'all' ? stats.mapTopics : stats.byPriority[priorityFilter];

  return (
    <section id="roadmap" className="scroll-mt-16 border-b border-line bg-white py-12 sm:py-16" aria-labelledby="roadmap-title">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="eyebrow">Interactive roadmap</p>
            <h2 id="roadmap-title" className="h2 mt-2">The embedded systems roadmap</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted">
              {desktop ? 'Select a topic to highlight what it connects to and open its resources. Drag to pan, scroll or use the toolbar to zoom.' : 'Open a group and tap a topic to see its details and learning resources.'}
            </p>
          </div>
          <div className="inline-flex rounded-lg border border-line bg-surface p-1" role="tablist" aria-label="Roadmap view">
            <button role="tab" aria-selected={view === 'graph'} onClick={() => setView('graph')} className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold', view === 'graph' ? 'bg-white text-brand shadow-sm' : 'text-muted')}><LayoutGrid size={15} /> {desktop ? 'Graph' : 'Groups'}</button>
            <button role="tab" aria-selected={view === 'outline'} onClick={() => setView('outline')} className={cn('flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold', view === 'outline' ? 'bg-white text-brand shadow-sm' : 'text-muted')}><ListTree size={15} /> Outline</button>
          </div>
        </div>

        {view === 'graph' && (
          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by learning priority">
              {filters.map((f) => (
                <button key={f.key} className="chip" aria-pressed={priorityFilter === f.key} onClick={() => setPriorityFilter(f.key)}>
                  {f.key !== 'all' && <span className="h-2 w-2 rounded-full" style={{ background: PRIORITY_META[f.key].color }} aria-hidden />}
                  {f.label} <span className="text-muted">({f.count})</span>
                </button>
              ))}
              <span className="ml-auto text-xs text-muted" aria-live="polite">Showing {visible} of {stats.mapTopics} topics highlighted</span>
            </div>
            <Legend />
            <p className="flex items-start gap-2 text-xs text-muted"><Info size={14} className="mt-0.5 shrink-0" /> Learning priorities are general guidance. The ideal order may vary depending on your career goals and specialization.</p>
          </div>
        )}

        <div className="mt-4">
          {view === 'outline' ? <OutlineView /> : desktop ? (
            <div className={cn('overflow-hidden border border-line bg-white shadow-card', full ? 'fixed inset-x-0 bottom-0 top-16 z-[45] rounded-none' : 'h-[calc(100vh-110px)] min-h-[620px] max-h-[980px] rounded-2xl')}>
              <Suspense fallback={<div className="grid h-full place-items-center text-sm text-muted">Loading roadmap…</div>}>
                <RoadmapGraph full={full} onToggleFull={() => setFull((v) => !v)} />
              </Suspense>
            </div>
          ) : <MobileGroups />}
        </div>
      </div>
    </section>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3 text-xs" aria-label="Legend">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold text-ink">Area</span>
        {(['software', 'both', 'hardware', 'soft'] as const).map((a) => (
          <span key={a} className="inline-flex items-center gap-1.5"><span className="h-3 w-1.5 rounded-sm" style={{ background: AREA_META[a].color }} />{AREA_META[a].label}</span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold text-ink">Priority dot</span>
        {PRIORITY_ORDER.map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: PRIORITY_META[p].color, opacity: p === 'optional' ? 0.55 : 1 }} />{PRIORITY_META[p].label}</span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold text-ink">Lines</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-px w-6 bg-slate-400" />related topics</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-6 bg-brand" />connections of the selected topic</span>
      </div>
    </div>
  );
}
