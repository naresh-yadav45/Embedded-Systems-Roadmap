import { ArrowRight, Route as RouteIcon } from 'lucide-react';
import { useStore } from '../../lib/store';
import { CREATOR } from '../../lib/meta';
import { GithubIcon } from '../ui';

function BoardIllustration() {
  return (
    <svg viewBox="0 0 520 420" className="h-full w-full" role="img" aria-label="Illustration of a microcontroller board connected to sensors, a network and code">
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#E2E8F0" strokeWidth="1" /></pattern>
      </defs>
      <rect x="6" y="6" width="508" height="408" rx="20" fill="url(#grid)" stroke="#E2E8F0" />
      <g fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M200 160H120V90H70" stroke="#2563EB" /><path d="M200 190H90V250H60" stroke="#7C3AED" />
        <path d="M200 220H110V320H80" stroke="#059669" /><path d="M320 160H400V90H450" stroke="#0891B2" />
        <path d="M320 190H430V250H460" stroke="#EA580C" /><path d="M320 220H390V330H440" stroke="#DB2777" />
        <path d="M230 120V60H300" stroke="#2563EB" /><path d="M290 240V370H210" stroke="#7C3AED" />
      </g>
      <rect x="200" y="120" width="120" height="120" rx="12" fill="#0F172A" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} fill="#94A3B8">
          <rect x={212 + i * 22} y="110" width="8" height="12" rx="2" /><rect x={212 + i * 22} y="238" width="8" height="12" rx="2" />
          <rect x="190" y={132 + i * 22} width="12" height="8" rx="2" /><rect x="318" y={132 + i * 22} width="12" height="8" rx="2" />
        </g>
      ))}
      <circle cx="218" cy="138" r="4" fill="#38BDF8" />
      <text x="260" y="176" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="13" fontWeight="700" fill="#fff">MCU</text>
      <text x="260" y="196" textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fill="#94A3B8">ARM · RISC-V</text>
      <g fontFamily="Inter, sans-serif" fontSize="11" fontWeight="600">
        <rect x="20" y="66" width="52" height="48" rx="10" fill="#EFF6FF" stroke="#2563EB" /><text x="46" y="94" textAnchor="middle" fill="#1D4ED8">C</text>
        <rect x="14" y="226" width="48" height="48" rx="10" fill="#F5F3FF" stroke="#7C3AED" /><text x="38" y="254" textAnchor="middle" fill="#6D28D9">I²C</text>
        <rect x="30" y="296" width="52" height="48" rx="10" fill="#ECFDF5" stroke="#059669" /><text x="56" y="324" textAnchor="middle" fill="#047857">GPIO</text>
        <rect x="448" y="66" width="56" height="48" rx="10" fill="#ECFEFF" stroke="#0891B2" /><text x="476" y="94" textAnchor="middle" fill="#0E7490">MQTT</text>
        <rect x="458" y="226" width="52" height="48" rx="10" fill="#FFF7ED" stroke="#EA580C" /><text x="484" y="254" textAnchor="middle" fill="#C2410C">SPI</text>
        <rect x="438" y="306" width="62" height="48" rx="10" fill="#FDF2F8" stroke="#DB2777" /><text x="469" y="334" textAnchor="middle" fill="#BE185D">RTOS</text>
        <rect x="298" y="36" width="64" height="40" rx="10" fill="#fff" stroke="#E2E8F0" /><text x="330" y="61" textAnchor="middle" fill="#0F172A">UART</text>
        <rect x="148" y="350" width="64" height="40" rx="10" fill="#fff" stroke="#E2E8F0" /><text x="180" y="375" textAnchor="middle" fill="#0F172A">CAN</text>
      </g>
      <g fill="none" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" transform="translate(352 262)">
        <path d="M0 10a30 30 0 0 1 44 0" /><path d="M8 20a18 18 0 0 1 28 0" /><circle cx="22" cy="30" r="3" fill="#2563EB" />
      </g>
      <g transform="translate(236 298)">
        <rect width="100" height="38" rx="8" fill="#0F172A" />
        <text x="12" y="16" fontFamily="ui-monospace, monospace" fontSize="10" fill="#38BDF8">while (1) {'{'}</text>
        <text x="22" y="30" fontFamily="ui-monospace, monospace" fontSize="10" fill="#E2E8F0">blink();</text>
      </g>
    </svg>
  );
}

export function Hero() {
  const { goSection } = useStore();
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-line bg-white">
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden style={{ backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '22px 22px', maskImage: 'linear-gradient(to bottom, black, transparent 85%)', WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)' }} />
      <div className="container-x relative grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
        <div>
          <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-muted">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand text-[9px] font-extrabold text-white" aria-hidden>{CREATOR.initials}</span>
            <span className="truncate">Designed &amp; Developed by {CREATOR.name} · {CREATOR.role}</span>
          </p>
          <h1 id="hero-title" className="mt-5 text-4xl font-extrabold leading-[1.08] text-ink sm:text-5xl lg:text-[3.4rem]">
            Your Journey Into <span className="text-brand">Embedded Systems</span> Engineering
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Explore the technologies, programming skills, hardware concepts, and practical knowledge required to become an embedded systems engineer.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="btn-primary" onClick={() => goSection('roadmap')}>Explore Roadmap <ArrowRight size={16} /></button>
            <button className="btn-outline" onClick={() => goSection('paths')}><RouteIcon size={16} /> View Learning Paths</button>
            <a className="btn-outline" href={CREATOR.github} target="_blank" rel="noopener noreferrer"><GithubIcon size={16} /> Visit GitHub</a>
          </div>
          <p className="mt-6 text-sm text-muted">
            GitHub: <a className="font-medium text-brand hover:underline" href={CREATOR.github} target="_blank" rel="noopener noreferrer">github.com/naresh-yadav45</a>
          </p>
        </div>
        <div className="mx-auto w-full max-w-[520px]"><BoardIllustration /></div>
      </div>
    </section>
  );
}
