import { buildOutline, flattenOutline } from '../lib/outline';
import { AREA_META, CREATOR, PRIORITY_META } from '../lib/meta';
import { usePrintImage } from '../lib/printState';

/** Only visible when printing: diagram + the complete topic outline. */
export function PrintView() {
  const image = usePrintImage();
  const groups = buildOutline();
  return (
    <div className="hidden print:block">
      <h1 style={{ fontSize: 20, fontWeight: 800 }}>Embedded Systems Engineering Roadmap</h1>
      <p style={{ fontSize: 11, color: '#64748B' }}>Designed &amp; developed by {CREATOR.name} · {CREATOR.role} · {CREATOR.github}</p>
      {image && <img src={image} alt="Embedded systems roadmap diagram" style={{ width: '100%', marginTop: 12, breakInside: 'avoid' }} />}
      <div style={{ breakBefore: 'page' }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Topic outline</h2>
        {groups.map((g) => (
          <section key={g.area} style={{ marginBottom: 12 }}>
            <h3 style={{ fontSize: 13, fontWeight: 800, color: AREA_META[g.area].color }}>{AREA_META[g.area].label}</h3>
            <ul style={{ fontSize: 10.5, lineHeight: 1.45, columnCount: 2 }}>
              {flattenOutline([g]).map((r) => (
                <li key={r.topic.id} style={{ marginLeft: (r.depth - 1) * 12, fontWeight: r.depth === 1 ? 700 : 400, breakInside: 'avoid' }}>
                  {r.topic.title}{r.topic.priority ? ` — ${PRIORITY_META[r.topic.priority].label}` : ''}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
