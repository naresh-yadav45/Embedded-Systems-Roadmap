import type { ReactNode } from 'react';
import type { Resource } from '../types';

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

export function isSafeUrl(url: string): boolean {
  try { return /^https?:$/.test(new URL(url).protocol); } catch { return false; }
}

export function hostOf(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

export function resourceTitle(r: Resource): string {
  return r.title || r.displayTitleFallback || hostOf(r.url) || r.url;
}

export function youtubeThumb(r: Resource): string | null {
  const id = r.youtube?.videoId;
  return id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/mqdefault.jpg` : null;
}

export function youtubeEmbedUrl(r: Resource): string | null {
  const y = r.youtube;
  if (!y) return null;
  const base = 'https://www.youtube-nocookie.com/embed';
  if (y.kind === 'video' && y.videoId) {
    const q = new URLSearchParams({ rel: '0' });
    if (y.start && /^\d+s?$/.test(y.start)) q.set('start', y.start.replace('s', ''));
    return `${base}/${encodeURIComponent(y.videoId)}?${q.toString()}`;
  }
  if (y.kind === 'playlist' && y.listId) return `${base}/videoseries?list=${encodeURIComponent(y.listId)}&rel=0`;
  return null;
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Wrap matches of the query tokens in <mark>. */
export function highlight(text: string, query: string): ReactNode {
  const tokens = query.trim().split(/\s+/).filter((t) => t.length > 0);
  if (!tokens.length) return text;
  const re = new RegExp(`(${tokens.map(escapeRe).join('|')})`, 'ig');
  return text.split(re).map((part, i) =>
    i % 2 === 1 ? <mark key={i} className="rounded bg-yellow-200/80 px-0.5 text-inherit">{part}</mark> : part,
  );
}

/** Minimal, safe inline-markdown renderer for the README descriptions: links, **bold**, `code`, _em_. */
export function InlineMd({ text }: { text: string }) {
  const out: ReactNode[] = [];
  const re = /\[([^\]]+)\]\((https?:\/\/[^\s)]+(?:\([^\s)]*\)[^\s)]*)*)\)|\*\*(.+?)\*\*|`([^`]+)`|(^|[\s(])_(.+?)_(?=[\s.,;:)!?]|$)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) out.push(<a key={k++} href={m[2]} target="_blank" rel="noopener noreferrer" className="font-medium text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand">{m[1]}</a>);
    else if (m[3]) out.push(<strong key={k++}>{m[3]}</strong>);
    else if (m[4]) out.push(<code key={k++} className="rounded bg-surface px-1 py-0.5 font-mono text-[0.85em]">{m[4]}</code>);
    else if (m[6]) { if (m[5]) out.push(m[5]); out.push(<em key={k++}>{m[6]}</em>); }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return <>{out.map((n, i) => (typeof n === 'string' ? <span key={`s${i}`}>{n.replace(/\$\$\\(\w+)\$\$/g, (_, g: string) => ({ Pi: 'Π', pi: 'π', lambda: 'λ' } as Record<string, string>)[g] ?? g)}</span> : n))}</>;
}

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function downloadText(filename: string, text: string, type = 'text/plain') {
  downloadBlob(filename, new Blob([text], { type: `${type};charset=utf-8` }));
}
