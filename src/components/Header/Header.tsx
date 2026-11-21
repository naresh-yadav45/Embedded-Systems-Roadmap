import { useEffect, useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { useStore } from '../../lib/store';
import { CREATOR } from '../../lib/meta';
import { cn } from '../../lib/utils';
import { GithubIcon } from '../ui';

const NAV = [
  { id: 'overview', label: 'Overview' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'paths', label: 'Learning Paths' },
  { id: 'resources', label: 'Resources' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
];

export function Header() {
  const { route, goSection, goResources, setSearchOpen } = useStore();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('overview');

  useEffect(() => {
    if (route.name !== 'home') return;
    const ids = NAV.filter((n) => n.id !== 'resources').map((n) => n.id);
    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(vis.target.id);
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.2, 0.6] },
    );
    ids.forEach((id) => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [route.name]);

  const current = route.name === 'resources' ? 'resources' : route.name === 'home' ? active : '';
  const go = (id: string) => {
    setOpen(false);
    if (id === 'resources') goResources();
    else goSection(id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur print:hidden">
      <div className="container-x flex h-16 items-center justify-between gap-3">
        <a href="#/" onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; window.scrollTo({ top: 0 }); }} className="flex min-w-0 items-center gap-3" aria-label="Naresh Yadav - Embedded Systems Engineering Roadmap, home">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand font-display text-sm font-extrabold text-white" aria-hidden>{CREATOR.initials}</span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-sm font-bold text-ink">{CREATOR.name}</span>
            <span className="hidden truncate text-xs text-muted sm:block">Embedded Systems Engineering Roadmap · {CREATOR.role}</span>
            <span className="block truncate text-[11px] text-muted sm:hidden">Embedded Roadmap</span>
          </span>
        </a>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} aria-current={current === n.id ? 'page' : undefined}
              className={cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', current === n.id ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-surface hover:text-ink')}>
              {n.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button onClick={() => setSearchOpen(true)} className="flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-2.5 text-sm text-muted hover:bg-surface" aria-label="Search topics and resources (Ctrl+K)">
            <Search size={16} />
            <span className="hidden md:inline">Search</span>
            <kbd className="hidden rounded border border-line bg-surface px-1.5 py-0.5 font-mono text-[10px] md:inline">Ctrl K</kbd>
          </button>
          <a href={CREATOR.github} target="_blank" rel="noopener noreferrer" aria-label="Naresh Yadav on GitHub" className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink hover:bg-surface">
            <GithubIcon />
          </a>
          <button className="grid h-9 w-9 place-items-center rounded-lg border border-line lg:hidden" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? 'Close menu' : 'Open menu'}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-line bg-white lg:hidden">
          <div className="container-x grid gap-1 py-3">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)} className={cn('rounded-lg px-3 py-3 text-left text-sm font-medium', current === n.id ? 'bg-brand-soft text-brand' : 'text-ink hover:bg-surface')}>
                {n.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
