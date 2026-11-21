import type { ReactNode } from 'react';
import { ExternalLink } from 'lucide-react';
import type { Area, Priority } from '../types';
import { AREA_META, PRIORITY_META } from '../lib/meta';
import { cn } from '../lib/utils';

export function PriorityBadge({ priority, className }: { priority: Priority | null; className?: string }) {
  if (!priority) return null;
  const m = PRIORITY_META[priority];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold', className)} style={{ background: m.soft, color: m.text }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} aria-hidden />
      {m.label}
    </span>
  );
}

export function AreaBadge({ area, className }: { area: Area; className?: string }) {
  const m = AREA_META[area];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold', className)} style={{ background: m.soft, color: m.text }}>
      <span className="h-1.5 w-1.5 rounded-sm" style={{ background: m.color }} aria-hidden />
      {m.label}
    </span>
  );
}

export function SectionHeading({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 max-w-3xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="h2 mt-2">{title}</h2>
      {children && <p className="mt-3 text-[15px] leading-relaxed text-muted">{children}</p>}
    </div>
  );
}

export function ExtLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn('inline-flex items-center gap-1.5', className)}>
      {children}
      <ExternalLink size={13} aria-hidden />
    </a>
  );
}

export function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface px-6 py-12 text-center">
      <p className="font-display text-base font-bold text-ink">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-md text-sm text-muted">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, color = '#2563EB', label }: { value: number; color?: string; label?: string }) {
  return (
    <div role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100} aria-label={label}
      className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${value}%`, background: color }} />
    </div>
  );
}
