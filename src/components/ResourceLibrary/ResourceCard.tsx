import { memo, useState } from 'react';
import { BookOpen, Bookmark, FileText, Github, GraduationCap, Globe, PlayCircle, Radio, Users, Wrench, AlertTriangle, ListVideo, Link2 } from 'lucide-react';
import type { Resource, ResourceKind } from '../../types';
import { KIND_META } from '../../lib/meta';
import { topicById } from '../../lib/data';
import { useStore } from '../../lib/store';
import { cn, hostOf, isSafeUrl, resourceTitle, youtubeEmbedUrl, youtubeThumb } from '../../lib/utils';

const ICONS: Record<ResourceKind, typeof Globe> = {
  'youtube-video': PlayCircle, 'youtube-playlist': ListVideo, 'youtube-channel': Radio, 'other-video': PlayCircle,
  coursera: GraduationCap, udemy: GraduationCap, course: GraduationCap, book: BookOpen, article: Globe,
  documentation: FileText, datasheet: FileText, tool: Wrench, repository: Github,
};
const KIND_COLOR: Record<ResourceKind, string> = {
  'youtube-video': '#DC2626', 'youtube-playlist': '#DC2626', 'youtube-channel': '#DC2626', 'other-video': '#DB2777',
  coursera: '#2563EB', udemy: '#7C3AED', course: '#2563EB', book: '#EA580C', article: '#0891B2',
  documentation: '#059669', datasheet: '#64748B', tool: '#0F172A', repository: '#475569',
};

export const ResourceCard = memo(function ResourceCard({ r, compact = false, showTopics = true, onTopic }: { r: Resource; compact?: boolean; showTopics?: boolean; onTopic?: (id: string) => void }) {
  const { progress, toggleResourceBookmark, playVideo, openTopic } = useStore();
  const [thumbFailed, setThumbFailed] = useState(false);
  const meta = KIND_META[r.kind];
  const Icon = ICONS[r.kind];
  const color = KIND_COLOR[r.kind];
  const saved = progress.bookmarkedResources.includes(r.id);
  const thumb = !thumbFailed ? youtubeThumb(r) : null;
  const canEmbed = !!youtubeEmbedUrl(r);
  const safe = isSafeUrl(r.url);
  const title = resourceTitle(r);
  const topicIds = r.topicIds.slice(0, compact ? 0 : 4);

  return (
    <article className={cn('card flex flex-col overflow-hidden', compact ? 'p-3' : 'p-0')}>
      {!compact && thumb && (
        <button onClick={() => canEmbed && playVideo(r)} disabled={!canEmbed} className="group relative block aspect-video w-full overflow-hidden bg-slate-100" aria-label={`Play ${title} here`}>
          <img src={thumb} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" onError={() => setThumbFailed(true)} />
          <span className="absolute inset-0 grid place-items-center bg-black/0 transition-colors group-hover:bg-black/20">
            <PlayCircle size={44} className="text-white opacity-90 drop-shadow" />
          </span>
        </button>
      )}
      <div className={cn('flex flex-1 flex-col gap-2', !compact && 'p-4')}>
        <div className="flex items-start gap-2">
          {(!thumb || compact) && <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${color}14`, color }}><Icon size={16} /></span>}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide" style={{ background: `${color}14`, color }}>{meta.badge}</span>
              {r.beginner && <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700" title="Marked beginner-friendly in the original roadmap">BEGINNER-FRIENDLY</span>}
              {r.gem && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700" title="Marked as a hidden gem in the original roadmap">HIDDEN GEM</span>}
              {r.audio && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">AUDIOBOOK</span>}
              {r.needsVerification && <span className="inline-flex items-center gap-1 rounded bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-700" title={r.validation.issues.join(', ')}><AlertTriangle size={10} />NEEDS VERIFICATION</span>}
            </div>
            <h4 className="mt-1.5 line-clamp-2 text-sm font-semibold leading-snug text-ink">{title}</h4>
          </div>
          <button onClick={() => toggleResourceBookmark(r.id)} aria-pressed={saved} aria-label={saved ? 'Remove bookmark' : 'Bookmark resource'} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted hover:bg-surface">
            <Bookmark size={16} className={cn(saved && 'fill-amber-400 text-amber-500')} />
          </button>
        </div>
        {r.note && <p className="line-clamp-3 text-xs leading-relaxed text-muted">{r.note}</p>}
        <p className="flex items-center gap-1 truncate text-[11px] text-muted"><Link2 size={11} className="shrink-0" /><span className="truncate">Source: {r.domain || hostOf(r.url) || 'unknown'}</span></p>
        {showTopics && topicIds.length > 0 && (
          <div className="flex flex-wrap gap-1" aria-label="Related roadmap topics">
            {topicIds.map((id) => (
              <button key={id} onClick={() => (onTopic ? onTopic(id) : openTopic(id))} className="rounded-full border border-line bg-surface px-2 py-0.5 text-[11px] font-medium text-slate-600 hover:border-brand hover:text-brand">
                {topicById.get(id)?.title}
              </button>
            ))}
            {r.topicIds.length > 4 && <span className="px-1 text-[11px] text-muted">+{r.topicIds.length - 4}</span>}
          </div>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
          {safe ? (
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">
              {meta.action} <span aria-hidden>↗</span><span className="sr-only">(opens in a new tab)</span>
            </a>
          ) : <span className="text-xs font-semibold text-red-600">Invalid link — needs verification</span>}
          {canEmbed && (
            <button onClick={() => playVideo(r)} className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-surface">
              <PlayCircle size={13} /> Preview here
            </button>
          )}
          {r.topicIds.length > 1 && !compact && <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted"><Users size={11} />{r.topicIds.length} topics</span>}
        </div>
      </div>
    </article>
  );
});
