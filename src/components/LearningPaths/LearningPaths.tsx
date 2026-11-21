import { useState } from 'react';
import { Wrench, FolderKanban, Info } from 'lucide-react';
import { learningPaths, nodeByTitle, projects } from '../../lib/data';
import { PRIORITY_META } from '../../lib/meta';
import { useStore } from '../../lib/store';
import { SectionHeading } from '../ui';
import { cn } from '../../lib/utils';

export function LearningPaths() {
  const [id, setId] = useState(learningPaths[0].id);
  const { openNode, progress, goSection } = useStore();
  const path = learningPaths.find((p) => p.id === id)!;
  const all = path.sequence.flatMap((s) => s.topics);
  const done = all.filter((t) => { const n = nodeByTitle.get(t); return n && progress.topics[n.id]?.status === 'completed'; }).length;

  return (
    <section id="paths" className="scroll-mt-16 border-b border-line bg-surface py-14 sm:py-20" aria-labelledby="paths-title">
      <div className="container-x">
        <SectionHeading eyebrow="Learning paths" title="Pick a path that matches your goal">
          Each path is built from topics on the roadmap. The stages show a recommended learning order, which is different from strict prerequisites listed separately.
        </SectionHeading>
        <h3 id="paths-title" className="sr-only">Learning paths</h3>
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" role="tablist" aria-label="Learning paths">
            {learningPaths.map((p) => (
              <button key={p.id} role="tab" aria-selected={p.id === id} onClick={() => setId(p.id)}
                className={cn('shrink-0 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors lg:shrink', p.id === id ? 'border-brand bg-white text-brand shadow-card' : 'border-line bg-white/60 text-slate-700 hover:bg-white')}>
                {p.title}
              </button>
            ))}
          </div>
          <div className="card p-5 sm:p-6" role="tabpanel">
            <h3 className="font-display text-xl font-extrabold">{path.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{path.summary}</p>
            <p className="mt-1 text-xs text-muted">Good for: {path.audience}</p>
            <p className="mt-3 text-xs font-semibold text-muted">{done} of {all.length} topics completed in your tracker</p>

            <ol className="mt-5 space-y-4">
              {path.sequence.map((s, i) => (
                <li key={s.stage} className="relative border-l-2 border-brand/30 pl-5">
                  <span className="absolute -left-[9px] top-0.5 grid h-4 w-4 place-items-center rounded-full bg-brand text-[9px] font-bold text-white">{i + 1}</span>
                  <h4 className="text-sm font-bold">{s.stage.replace(/^\d+ · /, '')}</h4>
                  <p className="mt-0.5 text-xs text-muted">{s.why}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {s.topics.map((t) => {
                      const n = nodeByTitle.get(t);
                      if (!n) return null;
                      const st = progress.topics[n.id]?.status;
                      return (
                        <button key={t} onClick={() => openNode(n.id)} className={cn('inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-xs font-semibold hover:border-brand hover:text-brand', st === 'completed' ? 'border-emerald-300 text-emerald-700' : 'border-line')}>
                          <span className="h-2 w-2 rounded-full" style={{ background: PRIORITY_META[n.priority].color }} aria-hidden />{t}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-6 grid gap-4 border-t border-line pt-5 md:grid-cols-3">
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><Info size={13} /> Prerequisites</h4>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">{path.prerequisites.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><Wrench size={13} /> Important tools</h4>
                <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-700">{path.tools.map((p) => <li key={p}>{p}</li>)}</ul>
              </div>
              <div>
                <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted"><FolderKanban size={13} /> Recommended projects</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  {path.projectIds.map((pid) => { const p = projects.find((x) => x.id === pid); return p ? <li key={pid}><button className="font-semibold text-brand hover:underline" onClick={() => goSection('projects')}>{p.name}</button> <span className="text-xs capitalize text-muted">· {p.difficulty}</span></li> : null; })}
                </ul>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted">Resources for every topic open in the details panel when you click it.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
