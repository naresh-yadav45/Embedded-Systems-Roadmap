import { Cpu, Code2, Github, Zap } from 'lucide-react';
import { CREATOR } from '../../lib/meta';
import { roadmap } from '../../lib/data';
import { GithubIcon } from '../ui';

export function About() {
  const interests = [{ icon: Cpu, label: 'Electronics' }, { icon: Code2, label: 'Programming' }, { icon: Zap, label: 'Embedded systems' }, { icon: Github, label: 'Technology' }];
  return (
    <section id="about" className="scroll-mt-16 bg-white py-14 sm:py-20" aria-labelledby="about-title">
      <div className="container-x grid gap-8 lg:grid-cols-[320px_1fr]">
        <div className="card self-start p-6 text-center">
          <div className="mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-brand font-display text-3xl font-extrabold text-white" aria-hidden>{CREATOR.initials}</div>
          <h3 className="mt-4 font-display text-xl font-extrabold">{CREATOR.name}</h3>
          <p className="text-sm text-muted">{CREATOR.role}</p>
          <p className="text-sm text-muted">Project creator and developer</p>
          <a href={CREATOR.github} target="_blank" rel="noopener noreferrer" className="btn-primary mt-4 w-full"><GithubIcon size={16} /> github.com/naresh-yadav45</a>
        </div>
        <div>
          <p className="eyebrow">Creator</p>
          <h2 id="about-title" className="h2 mt-2">About the Creator</h2>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-600">
            <p>Naresh Yadav is a 2nd Year B.Tech student interested in technology, programming, electronics, and embedded systems.</p>
            <p>This project was developed as an educational initiative to organize important embedded engineering concepts into a structured, interactive, and accessible learning roadmap.</p>
            <p>The goal is to help students and aspiring engineers understand the technologies and skills involved in embedded systems engineering.</p>
          </div>
          <h3 className="mt-6 text-xs font-bold uppercase tracking-wider text-muted">Technology interests</h3>
          <div className="mt-2 flex flex-wrap gap-2">{interests.map(({ icon: I, label }) => <span key={label} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-medium"><I size={14} className="text-brand" />{label}</span>)}</div>
          <div className="mt-8 rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed text-slate-600">
            
          </div>
        </div>
      </div>
    </section>
  );
}
