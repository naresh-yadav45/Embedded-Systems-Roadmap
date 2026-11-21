import { ArrowUp } from 'lucide-react';
import { CREATOR } from '../../lib/meta';
import { roadmap } from '../../lib/data';
import { useStore } from '../../lib/store';
import { GithubIcon } from '../ui';

export function Footer() {
  const { goSection, goResources } = useStore();
  const year = new Date().getFullYear();
  const links: [string, () => void][] = [
    ['Overview', () => goSection('overview')], ['Roadmap', () => goSection('roadmap')], ['Learning Paths', () => goSection('paths')],
    ['Resources', () => goResources()], ['Projects', () => goSection('projects')], ['About', () => goSection('about')],
  ];
  return (
    <footer className="border-t border-line bg-surface print:hidden">
      <div className="container-x py-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <p className="font-display text-base font-extrabold">Designed &amp; Developed with dedication by Naresh Yadav</p>
            <p className="mt-1 text-sm text-muted">2nd Year B.Tech Student</p>
            <p className="text-sm text-muted">Embedded Systems Engineering Roadmap</p>
            <a href={CREATOR.github} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"><GithubIcon size={16} /> {CREATOR.github}</a>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {links.map(([l, fn]) => <button key={l} onClick={fn} className="text-left text-muted hover:text-ink">{l}</button>)}
          </nav>
          <button className="btn-outline self-start" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><ArrowUp size={15} /> Back to Top</button>
        </div>
        <div className="mt-8 border-t border-line pt-5 text-xs text-muted">
          <p>© {year} Naresh Yadav. Designed &amp; Developed by Naresh Yadav.</p>
          <p className="mt-1">Roadmap content based on <a className="underline" href={roadmap.source.repo} target="_blank" rel="noopener noreferrer">{roadmap.source.name}</a> by {roadmap.source.author} · <a className="underline" href={roadmap.source.licenseUrl} target="_blank" rel="noopener noreferrer">{roadmap.source.license}</a>.</p>
        </div>
      </div>
    </footer>
  );
}
