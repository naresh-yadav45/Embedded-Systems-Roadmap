import { useMemo, useState } from 'react';
import { projects, nodeByTitle, resourcesOfTopic } from '../../lib/data';
import { SectionHeading } from '../ui';
import { cn, resourceTitle, isSafeUrl } from '../../lib/utils';
import { useStore } from '../../lib/store';
import { KIND_META } from '../../lib/meta';
import type { Project } from '../../types';

const LEVELS = [
  { key: 'all', label: 'All' }, { key: 'beginner', label: 'Beginner' }, { key: 'intermediate', label: 'Intermediate' }, { key: 'advanced', label: 'Advanced' },
] as const;
const COLOR = { beginner: '#059669', intermediate: '#0891B2', advanced: '#DB2777' } as const;

function Links({ p }: { p: Project }) {
  const items = useMemo(() => {
    const out = [] as ReturnType<typeof resourcesOfTopic>;
    for (const t of p.topics) {
      const n = nodeByTitle.get(t);
      const list = n ? n.topicIds.flatMap((id) => resourcesOfTopic(id)) : [];
      const pick = list.filter((r) => ['youtube-video', 'documentation', 'article'].includes(r.kind)).slice(0, 1);
      for (const r of pick) if (!out.some((o) => o.id === r.id)) out.push(r);
    }
    return out.slice(0, 3);
  }, [p]);
  if (!items.length) return <p className="text-xs text-muted">No tutorial links are attached to the related topics yet.</p>;
  return (
    <ul className="space-y-1">
      {items.map((r) => isSafeUrl(r.url) && (
        <li key={r.id} className="text-xs"><a className="font-medium text-brand hover:underline" href={r.url} target="_blank" rel="noopener noreferrer">{resourceTitle(r)} ↗</a> <span className="text-muted">({KIND_META[r.kind].label})</span></li>
      ))}
    </ul>
  );
}

export function Projects() {
  const [level, setLevel] = useState<(typeof LEVELS)[number]['key']>('all');
  const { openNode } = useStore();
  const shown = projects.filter((p) => level === 'all' || p.difficulty === level);
  return (
    <section id="projects" className="scroll-mt-16 border-b border-line bg-white py-14 sm:py-20" aria-labelledby="projects-title">
      <div className="container-x">
        <SectionHeading eyebrow="Practical projects" title="Learn by building">
          Project ideas to turn roadmap topics into hands-on skills. Tutorial links are taken from the resources of the related topics. The list lives in <code className="rounded bg-surface px-1 font-mono text-xs">src/data/projects.json</code> and is easy to extend.
        </SectionHeading>
        <h3 id="projects-title" className="sr-only">Projects</h3>
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter projects by difficulty">
          {LEVELS.map((l) => <button key={l.key} className="chip" aria-pressed={level === l.key} onClick={() => setLevel(l.key)}>{l.label}</button>)}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <article key={p.id} className="card flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-display text-base font-bold">{p.name}</h4>
                <span className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold capitalize text-white" style={{ background: COLOR[p.difficulty] }}>{p.difficulty}</span>
              </div>
              <p className="mt-1.5 text-sm text-slate-600">{p.summary}</p>
              <dl className="mt-3 space-y-2.5 text-xs">
                <Row label="Required skills" items={p.skills} />
                <Row label="Hardware" items={p.hardware} />
                <Row label="Software" items={p.software} />
                <Row label="You will learn" items={p.outcomes} />
              </dl>
              <div className="mt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted">Related topics</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {p.topics.map((t) => { const n = nodeByTitle.get(t); return n ? <button key={t} onClick={() => openNode(n.id)} className={cn('rounded-full border border-line px-2 py-0.5 text-[11px] font-semibold hover:border-brand hover:text-brand')}>{t}</button> : null; })}
                </div>
              </div>
              <div className="mt-3 border-t border-line pt-3">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">Tutorials &amp; documentation</p>
                <Links p={p} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <dt className="font-bold uppercase tracking-wider text-muted" style={{ fontSize: 10 }}>{label}</dt>
      <dd className="mt-0.5 text-slate-700">{items.join(' · ')}</dd>
    </div>
  );
}
