import { useRef, useState } from 'react';
import { Bookmark, Download, History, RotateCcw, Upload } from 'lucide-react';
import { nodeById, roadmap, topicById } from '../../lib/data';
import { AREA_META } from '../../lib/meta';
import { useStore } from '../../lib/store';
import { exportProgressJson } from '../../lib/exporters';
import { ProgressBar, SectionHeading } from '../ui';

export function ProgressTracker() {
  const { progress, resetProgress, importProgress, openNode, openTopic } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState('');
  const [confirm, setConfirm] = useState(false);

  const calc = (area?: string) => {
    const nodes = roadmap.nodes.filter((n) => !area || n.area === area);
    const done = nodes.filter((n) => progress.topics[n.id]?.status === 'completed').length;
    const doing = nodes.filter((n) => progress.topics[n.id]?.status === 'in-progress').length;
    return { total: nodes.length, done, doing, pct: nodes.length ? (done / nodes.length) * 100 : 0 };
  };
  const all = calc();
  const rows = (['software', 'hardware', 'both', 'soft'] as const).map((a) => ({ a, ...calc(a) }));
  const bookmarked = Object.entries(progress.topics).filter(([, v]) => v.bookmarked).map(([k]) => k);
  const noted = Object.values(progress.topics).filter((v) => v.note.trim()).length;

  const open = (key: string) => (nodeById.has(key) ? openNode(key) : openTopic(key.replace(/^t-/, '')));
  const labelOf = (key: string) => nodeById.get(key)?.title ?? topicById.get(key.replace(/^t-/, ''))?.title ?? key;

  const onImport = async (f?: File) => {
    if (!f) return;
    const ok = importProgress(await f.text());
    setMsg(ok ? 'Progress imported.' : 'That file is not a valid progress export.');
    if (file.current) file.current.value = '';
  };

  return (
    <section id="progress" className="scroll-mt-16 border-b border-line bg-surface py-14 sm:py-20" aria-labelledby="progress-title">
      <div className="container-x">
        <SectionHeading eyebrow="Progress tracker" title="Track your own learning">
          Mark topics as not started, in progress or completed from the details panel. Everything is stored in this browser only — no account needed.
        </SectionHeading>
        <h3 id="progress-title" className="sr-only">Learning progress</h3>
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="card p-5">
            <div className="flex items-end justify-between">
              <div><p className="text-xs font-bold uppercase tracking-wider text-muted">Overall completion</p><p className="font-display text-4xl font-extrabold tabular-nums">{Math.round(all.pct)}%</p></div>
              <div className="text-right text-sm text-muted"><p><strong className="text-ink">{all.done}</strong> completed</p><p><strong className="text-ink">{all.doing}</strong> in progress</p><p><strong className="text-ink">{all.total - all.done}</strong> remaining</p></div>
            </div>
            <div className="mt-3"><ProgressBar value={all.pct} label="Overall progress" /></div>
            <div className="mt-5 space-y-3">
              {rows.map((r) => (
                <div key={r.a}>
                  <div className="mb-1 flex justify-between text-xs font-semibold"><span style={{ color: AREA_META[r.a].text }}>{AREA_META[r.a].label}</span><span className="text-muted tabular-nums">{r.done}/{r.total}</span></div>
                  <ProgressBar value={r.pct} color={AREA_META[r.a].color} label={`${AREA_META[r.a].label} progress`} />
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
              <button className="btn-outline !py-2" onClick={() => exportProgressJson(progress)}><Download size={15} /> Export</button>
              <button className="btn-outline !py-2" onClick={() => file.current?.click()}><Upload size={15} /> Import</button>
              <input ref={file} type="file" accept="application/json,.json" className="sr-only" aria-label="Import progress file" onChange={(e) => onImport(e.target.files?.[0])} />
              {confirm ? (
                <span className="inline-flex items-center gap-2 text-sm">Reset everything?
                  <button className="btn !bg-red-600 !py-1.5 text-white hover:!bg-red-700" onClick={() => { resetProgress(); setConfirm(false); setMsg('Progress reset.'); }}>Yes, reset</button>
                  <button className="btn-ghost !py-1.5" onClick={() => setConfirm(false)}>Cancel</button></span>
              ) : <button className="btn-ghost !py-2" onClick={() => setConfirm(true)}><RotateCcw size={15} /> Reset</button>}
            </div>
            {msg && <p role="status" className="mt-2 text-xs text-muted">{msg}</p>}
          </div>

          <div className="space-y-5">
            <div className="card p-5">
              <h4 className="flex items-center gap-2 text-sm font-bold"><Bookmark size={15} /> Bookmarked topics <span className="text-muted">({bookmarked.length})</span></h4>
              {bookmarked.length ? <div className="mt-3 flex flex-wrap gap-1.5">{bookmarked.map((k) => <button key={k} onClick={() => open(k)} className="chip">{labelOf(k)}</button>)}</div>
                : <p className="mt-2 text-sm text-muted">Nothing bookmarked yet. Use the bookmark button in a topic&apos;s details panel.</p>}
              <p className="mt-3 text-xs text-muted">{noted} topic{noted === 1 ? '' : 's'} with personal notes · {progress.bookmarkedResources.length} bookmarked resource{progress.bookmarkedResources.length === 1 ? '' : 's'}</p>
            </div>
            <div className="card p-5">
              <h4 className="flex items-center gap-2 text-sm font-bold"><History size={15} /> Recently viewed</h4>
              {progress.recent.length ? <div className="mt-3 flex flex-wrap gap-1.5">{progress.recent.map((k) => <button key={k} onClick={() => open(k)} className="chip">{labelOf(k)}</button>)}</div>
                : <p className="mt-2 text-sm text-muted">Topics you open will appear here.</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
