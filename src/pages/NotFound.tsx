import { Compass } from 'lucide-react';

export function NotFound({ hash }: { hash: string }) {
  return (
    <div className="container-x grid min-h-[60vh] place-items-center py-20 text-center">
      <div>
        <Compass className="mx-auto text-brand" size={44} />
        <p className="eyebrow mt-4">404</p>
        <h1 className="h2 mt-2">This page is off the roadmap</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">We could not find <code className="rounded bg-surface px-1 font-mono">#{hash}</code>. Head back to the roadmap or browse the resources.</p>
        <div className="mt-6 flex justify-center gap-3">
          <a className="btn-primary" href="#/">Back to roadmap</a>
          <a className="btn-outline" href="#/resources">Resource library</a>
        </div>
      </div>
    </div>
  );
}
