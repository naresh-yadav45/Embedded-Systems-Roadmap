import { Cpu, Code2, HeartHandshake, Layers } from 'lucide-react';
import { stats } from '../../lib/data';
import { AREA_META, CREATOR, PRIORITY_META, PRIORITY_ORDER } from '../../lib/meta';
import { SectionHeading } from '../ui';
import { useStore } from '../../lib/store';

export function Overview() {
  const { setPriorityFilter, goSection } = useStore();
  const areas = [
    { key: 'software' as const, icon: Code2, count: stats.software, text: 'Languages, tooling, testing, operating systems and specialised software topics.' },
    { key: 'hardware' as const, icon: Cpu, count: stats.hardware, text: 'Electronics, test equipment, prototyping and board design.' },
    { key: 'soft' as const, icon: HeartHandshake, count: stats.soft, text: 'Communication, problem solving, teamwork and self-driven learning.' },
  ];
  const figures = [
    { label: 'Roadmap topics', value: stats.mapTopics },
    { label: 'Software topics', value: stats.software, color: AREA_META.software.color },
    { label: 'Hardware topics', value: stats.hardware, color: AREA_META.hardware.color },
    { label: 'Software + Hardware', value: stats.both, color: AREA_META.both.color },
    { label: 'Soft skills topics', value: stats.soft, color: AREA_META.soft.color },
    { label: 'Learning resources', value: stats.resources },
    { label: 'Topic connections', value: stats.connections },
  ];
  return (
    <section id="overview" className="scroll-mt-20 border-b border-line bg-surface py-14 sm:py-20" aria-labelledby="overview-title">
      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">Introduction</p>
            <h2 id="overview-title" className="h2 mt-2">Hi, I&apos;m {CREATOR.name}</h2>
            <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-600">
              <p>I&apos;m a 2nd Year B.Tech student passionate about technology, electronics, programming, and embedded systems.</p>
              <p>I created this interactive Embedded Systems Engineering Roadmap to organize the knowledge, technologies, tools, and practical skills required to explore the embedded engineering field.</p>
              <p>This roadmap is designed to make the learning journey more structured, understandable, and accessible for students and aspiring engineers.</p>
            </div>
          </div>
          <div className="card self-start p-5" aria-label="Roadmap statistics, calculated from the roadmap data">
            <div className="flex items-center gap-2 text-sm font-bold"><Layers size={16} className="text-brand" /> Roadmap at a glance</div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {figures.map((f) => (
                <div key={f.label} className="border-l-2 pl-3" style={{ borderColor: f.color ?? '#CBD5E1' }}>
                  <dd className="font-display text-2xl font-extrabold tabular-nums text-ink">{f.value.toLocaleString()}</dd>
                  <dt className="text-xs text-muted">{f.label}</dt>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[11px] leading-snug text-muted">
              All counts are computed from the data files. Including sub-topics there are {stats.readmeTopics} documented topics, and {stats.youtube} of the resources are YouTube links.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {areas.map(({ key, icon: Icon, count, text }) => {
            const m = AREA_META[key];
            return (
              <div key={key} className="card p-5" style={{ borderTop: `3px solid ${m.color}` }}>
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: m.soft, color: m.color }}><Icon size={18} /></span>
                  <span className="font-display text-2xl font-extrabold tabular-nums" style={{ color: m.color }}>{count}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold">{m.label}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{text}</p>
              </div>
            );
          })}
        </div>

        <div className="card mt-4 flex flex-col gap-3 p-5 sm:flex-row sm:items-center" style={{ borderLeft: `3px solid ${AREA_META.both.color}` }}>
          <span className="font-display text-2xl font-extrabold tabular-nums" style={{ color: AREA_META.both.color }}>{stats.both}</span>
          <p className="text-sm leading-relaxed text-slate-600">
            <strong className="text-ink">Where Software and Hardware overlap.</strong> Microcontroller peripherals, communication protocols, RTOS, sensors and signal processing sit at the intersection. They are shown in purple on the roadmap.
          </p>
        </div>

        <div className="mt-10">
          <SectionHeading eyebrow="Learning priority" title="Three levels of priority">
            Learning priorities are general guidance. The ideal order may vary depending on your career goals and specialization.
          </SectionHeading>
          <div className="grid gap-3 sm:grid-cols-3">
            {PRIORITY_ORDER.map((p) => {
              const m = PRIORITY_META[p];
              return (
                <button key={p} onClick={() => { setPriorityFilter(p); goSection('roadmap'); }} className="card p-4 text-left transition-shadow hover:shadow-float">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-bold" style={{ background: m.soft, color: m.text }}>{m.label}</span>
                    <span className="font-display text-xl font-extrabold tabular-nums" style={{ color: m.color }}>{stats.byPriority[p]}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{m.hint}</p>
                  <p className="mt-2 text-xs font-semibold text-brand">Highlight on roadmap →</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
