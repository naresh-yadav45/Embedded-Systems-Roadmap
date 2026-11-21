import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { resources, stats, topicById, roadmap } from '../../lib/data';
import { AREA_META, AREA_ORDER, KIND_META, KIND_ORDER } from '../../lib/meta';
import { useStore } from '../../lib/store';
import { resourceTitle } from '../../lib/utils';
import { EmptyState } from '../ui';
import { ResourceCard } from './ResourceCard';
import type { Area, ResourceKind } from '../../types';

const PAGE = 36;
const GROUPS: { id: string; label: string; kinds: ResourceKind[] }[] = [
  { id: 'all', label: 'All', kinds: KIND_ORDER },
  { id: 'yt', label: 'YouTube', kinds: ['youtube-video', 'youtube-playlist', 'youtube-channel'] },
  { id: 'courses', label: 'Courses', kinds: ['coursera', 'udemy', 'course', 'other-video'] },
  { id: 'books', label: 'Books', kinds: ['book'] },
  { id: 'docs', label: 'Documentation & datasheets', kinds: ['documentation', 'datasheet'] },
  { id: 'articles', label: 'Articles', kinds: ['article'] },
  { id: 'tools', label: 'Tools & open source', kinds: ['tool', 'repository'] },
];

export function ResourceLibrary() {
  const { resourceQuery, setResourceQuery, progress, openTopic } = useStore();
  const [kind, setKind] = useState<ResourceKind | 'all'>('all');
  const [group, setGroup] = useState('all');
  const [area, setArea] = useState<Area | 'all'>('all');
  const [topic, setTopic] = useState('all');
  const [beginner, setBeginner] = useState(false);
  const [gem, setGem] = useState(false);
  const [saved, setSaved] = useState(false);
  const [needsCheck, setNeedsCheck] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const q = useDeferredValue(resourceQuery.trim().toLowerCase());

  useEffect(() => setLimit(PAGE), [q, kind, group, area, topic, beginner, gem, saved, needsCheck]);

  const topicOptions = useMemo(() => roadmap.topics.filter((t) => t.resourceIds.length).map((t) => ({ id: t.id, title: t.path.length ? `${t.path[t.path.length - 1]} › ${t.title}` : t.title })).sort((a, b) => a.title.localeCompare(b.title)), []);
  const index = useMemo(() => resources.map((r) => ({ r, hay: `${resourceTitle(r)} ${r.note} ${r.domain} ${r.url} ${r.topicIds.map((id) => topicById.get(id)?.title ?? '').join(' ')}`.toLowerCase() })), []);

  const filtered = useMemo(() => {
    const g = GROUPS.find((x) => x.id === group)!;
    const tokens = q.split(/\s+/).filter(Boolean);
    return index.filter(({ r, hay }) =>
      (kind === 'all' || r.kind === kind) && g.kinds.includes(r.kind) &&
      (area === 'all' || r.topicIds.some((id) => topicById.get(id)?.area === area)) &&
      (topic === 'all' || r.topicIds.includes(topic)) &&
      (!beginner || r.beginner) && (!gem || r.gem) && (!needsCheck || r.needsVerification) &&
      (!saved || progress.bookmarkedResources.includes(r.id)) &&
      tokens.every((t) => hay.includes(t))).map((x) => x.r);
  }, [index, q, kind, group, area, topic, beginner, gem, saved, needsCheck, progress.bookmarkedResources]);

  const reset = () => { setResourceQuery(''); setKind('all'); setGroup('all'); setArea('all'); setTopic('all'); setBeginner(false); setGem(false); setSaved(false); setNeedsCheck(false); };

  return (
    <div className="container-x py-10 sm:py-14">
      <p className="eyebrow">Learning resources</p>
      <h1 className="h2 mt-2">Resource library</h1>
      <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-muted">
        All {stats.resources} links from the original roadmap, each kept with its topic associations: {stats.youtube} YouTube links, courses, books, documentation and more. Original titles and descriptions are preserved, and nothing here is invented.
      </p>

      <div className="card mt-6 space-y-3 p-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input pl-9" value={resourceQuery} onChange={(e) => setResourceQuery(e.target.value)} placeholder="Search by title, topic, source or note…" aria-label="Search resources" />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Resource group">
          {GROUPS.map((g) => <button key={g.id} className="chip" aria-pressed={group === g.id} onClick={() => { setGroup(g.id); setKind('all'); }}>{g.label}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Resource type" className="input !w-auto" value={kind} onChange={(e) => setKind(e.target.value as ResourceKind | 'all')}>
            <option value="all">All types</option>
            {KIND_ORDER.filter((k) => GROUPS.find((g) => g.id === group)!.kinds.includes(k)).map((k) => <option key={k} value={k}>{KIND_META[k].label} ({stats.byKind[k] ?? 0})</option>)}
          </select>
          <select aria-label="Topic category" className="input !w-auto" value={area} onChange={(e) => setArea(e.target.value as Area | 'all')}>
            <option value="all">All categories</option>
            {AREA_ORDER.map((a) => <option key={a} value={a}>{AREA_META[a].label}</option>)}
          </select>
          <select aria-label="Roadmap topic" className="input !w-auto max-w-[260px]" value={topic} onChange={(e) => setTopic(e.target.value)}>
            <option value="all">Any topic</option>
            {topicOptions.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <button className="chip" aria-pressed={beginner} onClick={() => setBeginner((v) => !v)}>Beginner-friendly</button>
          <button className="chip" aria-pressed={gem} onClick={() => setGem((v) => !v)}>Hidden gems</button>
          <button className="chip" aria-pressed={saved} onClick={() => setSaved((v) => !v)}>Bookmarked ({progress.bookmarkedResources.length})</button>
          <button className="chip" aria-pressed={needsCheck} onClick={() => setNeedsCheck((v) => !v)}>Needs verification</button>
          <button className="ml-auto text-xs font-semibold text-brand hover:underline" onClick={reset}>Clear filters</button>
        </div>
        <p className="text-xs text-muted" aria-live="polite">{filtered.length} of {resources.length} resources. Difficulty comes only from the original roadmap&apos;s beginner-friendly and hidden-gem marks; free/paid status is not recorded there.</p>
      </div>

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState title="No resources match" hint="Loosen a filter or search for a broader term." action={<button className="btn-outline" onClick={reset}>Clear filters</button>} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.slice(0, limit).map((r) => <ResourceCard key={r.id} r={r} onTopic={openTopic} />)}
            </div>
            {limit < filtered.length && (
              <div className="mt-6 text-center"><button className="btn-outline" onClick={() => setLimit((l) => l + PAGE * 2)}>Show more ({filtered.length - limit} left)</button></div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
