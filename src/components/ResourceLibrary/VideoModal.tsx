import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../lib/store';
import { resourceTitle, youtubeEmbedUrl, isSafeUrl } from '../../lib/utils';

export function VideoModal() {
  const { video, playVideo } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!video) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') playVideo(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [video, playVideo]);
  if (!video) return null;
  const embed = youtubeEmbedUrl(video);
  const title = resourceTitle(video);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-900/70 p-4 print:hidden" role="dialog" aria-modal="true" aria-label={`Video preview: ${title}`} onMouseDown={(e) => { if (e.target === e.currentTarget) playVideo(null); }}>
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-float">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h3 className="truncate text-sm font-bold">{title}</h3>
          <button ref={closeRef} onClick={() => playVideo(null)} aria-label="Close video" className="grid h-8 w-8 place-items-center rounded-lg hover:bg-surface"><X size={18} /></button>
        </div>
        <div className="aspect-video w-full bg-black">
          {embed && <iframe src={embed} title={title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" loading="lazy" />}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs text-muted">
          <span>Some videos disable embedding. If the player shows an error, open the video on YouTube.</span>
          {isSafeUrl(video.url) && <a className="btn-primary !px-3 !py-1.5 !text-xs" href={video.url} target="_blank" rel="noopener noreferrer">{video.kind === 'youtube-playlist' ? 'Open Playlist' : 'Watch on YouTube'} ↗</a>}
        </div>
      </div>
    </div>
  );
}
