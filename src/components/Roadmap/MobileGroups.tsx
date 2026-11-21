import { useState } from 'react';
import { Check, ChevronDown, CircleDashed } from 'lucide-react';
import { clusterById, nodeById, roadmap } from '../../lib/data';
import { AREA_META } from '../../lib/meta';
import { useStore } from '../../lib/store';
import { PriorityBadge } from '../ui';
import { cn } from '../../lib/utils';

/** Touch-friendly alternative to the desktop graph: expandable groups of topics. */
export function MobileGroups() {
  const { openNode, priorityFilter, progress } = useStore();
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setOpen((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  return (
    <div className="space-y-6">
      {roadmap.bands.map((band) => {
        const m = AREA_META[band.area];
        return (
          <div key={band.id}>
            <h3 className="mb-2 flex items-center gap-2 font-display text-base font-extrabold" style={{ color: m.text }}>
              <span className="h-3 w-3 rounded-sm" style={{ background: m.color }} aria-hidden /> {band.label}
            </h3>
            <div className="space-y-2">
              {band.clusterIds.map((cid) => {
                const c = clusterById.get(cid)!;
                const expanded = open.has(cid);
                return (
                  <div key={cid} className="overflow-hidden rounded-xl border" style={{ borderColor: `${m.color}40`, background: `${m.color}08` }}>
                    <button onClick={() => toggle(cid)} aria-expanded={expanded} className="flex min-h-[48px] w-full items-center justify-between gap-2 px-4 py-3 text-left">
                      <span className="text-sm font-bold">{c.title} <span className="font-normal text-muted">· {c.nodeIds.length}</span></span>
                      <ChevronDown size={18} className={cn('shrink-0 transition-transform', expanded && 'rotate-180')} />
                    </button>
                    {expanded && (
                      <ul className="divide-y divide-line border-t border-line bg-white">
                        {c.nodeIds.map((nid) => {
                          const n = nodeById.get(nid)!;
                          const st = progress.topics[nid]?.status;
                          const dim = priorityFilter !== 'all' && n.priority !== priorityFilter;
                          return (
                            <li key={nid}>
                              <button onClick={() => openNode(nid)} className={cn('flex min-h-[48px] w-full items-center justify-between gap-3 px-4 py-2.5 text-left', dim && 'opacity-35')}>
                                <span className="flex min-w-0 items-center gap-2 text-sm font-medium">
                                  <span className="truncate">{n.title}</span>
                                  {st === 'completed' && <Check size={14} className="shrink-0 text-emerald-600" aria-label="Completed" />}
                                  {st === 'in-progress' && <CircleDashed size={14} className="shrink-0 text-amber-600" aria-label="In progress" />}
                                </span>
                                <PriorityBadge priority={n.priority} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
