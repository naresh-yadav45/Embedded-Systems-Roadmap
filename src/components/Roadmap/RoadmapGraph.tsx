import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Background, BackgroundVariant, ReactFlow, ReactFlowProvider, useReactFlow, type Edge, type Node,
} from '@xyflow/react';
import {
  ChevronsDownUp, ChevronsUpDown, Download, FileText, Focus, ImageDown, Maximize2, Minimize2, Minus, Scan, Plus, Printer, RotateCcw, Search,
} from 'lucide-react';
import { adjacency, nodeById, roadmap } from '../../lib/data';
import { useStore } from '../../lib/store';
import { AREA_META } from '../../lib/meta';
import { downloadRoadmapPdf, downloadRoadmapPng, renderRoadmapImage } from '../../lib/exporters';
import { setPrintImage } from '../../lib/printState';
import { BandNode, ClusterNode, TopicNode } from './nodes';
import { computeLayout, sides, type TopicNodeData } from './layout';
import { cn } from '../../lib/utils';
import type { Area } from '../../types';

const nodeTypes = { topic: TopicNode, cluster: ClusterNode, band: BandNode };

function Inner({ full, onToggleFull }: { full: boolean; onToggleFull: () => void }) {
  const rf = useReactFlow();
  const { selection, openNode, closePanel, priorityFilter, progress, focusRequest, setSearchOpen, setPriorityFilter } = useStore();
  const [collapsedClusters, setCollapsedClusters] = useState<Set<string>>(new Set());
  const [collapsedBands, setCollapsedBands] = useState<Set<string>>(new Set());
  const [lowZoom, setLowZoom] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const [error, setError] = useState('');
  const lastFocus = useRef(0);

  const layout = useMemo(() => computeLayout(collapsedClusters, collapsedBands), [collapsedClusters, collapsedBands]);
  const selectedId = selection?.nodeId ?? null;
  const connected = useMemo(() => {
    const set = new Set<string>();
    if (selectedId) adjacency.get(selectedId)?.forEach((a) => set.add(a.other));
    return set;
  }, [selectedId]);

  const toggleCluster = useCallback((id: string) => setCollapsedClusters((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }), []);
  const toggleBand = useCallback((id: string) => setCollapsedBands((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; }), []);

  const nodes = useMemo<Node[]>(() => layout.nodes.map((n) => {
    if (n.type === 'topic') {
      const g = nodeById.get(n.id)!;
      const matches = priorityFilter === 'all' || g.priority === priorityFilter;
      const isSel = n.id === selectedId;
      const isCon = connected.has(n.id);
      const dim = (!!selectedId && !isSel && !isCon) || !matches;
      const p = progress.topics[n.id];
      return { ...n, selected: false, data: { nodeId: n.id, label: g.title, area: g.area, priority: g.priority, selected: isSel, connected: isCon, dim, matches: matches && priorityFilter !== 'all', status: p?.status ?? 'not-started', bookmarked: !!p?.bookmarked, onOpen: openNode } satisfies TopicNodeData & { onOpen: (id: string) => void } };
    }
    if (n.type === 'cluster') return { ...n, data: { ...n.data, onToggle: toggleCluster } };
    return { ...n, data: { ...n.data, onToggle: toggleBand } };
  }), [layout, selectedId, connected, priorityFilter, progress.topics, openNode, toggleCluster, toggleBand]);

  const edges = useMemo<Edge[]>(() => roadmap.edges.flatMap((e) => {
    if (layout.hidden.has(e.source) || layout.hidden.has(e.target)) return [];
    const a = layout.positions.get(e.source)!;
    const b = layout.positions.get(e.target)!;
    const sd = sides(a, b);
    const active = !!selectedId && (e.source === selectedId || e.target === selectedId);
    const color = active ? AREA_META[nodeById.get(selectedId!)!.area].color : '#94A3B8';
    const bothMatch = priorityFilter === 'all' || (nodeById.get(e.source)!.priority === priorityFilter && nodeById.get(e.target)!.priority === priorityFilter);
    return [{
      id: e.id, source: e.source, target: e.target, sourceHandle: sd.s, targetHandle: sd.t, type: 'default',
      zIndex: active ? 5 : 2,
      style: { stroke: color, strokeWidth: active ? 2.4 : 1, opacity: active ? 0.95 : selectedId ? 0.05 : bothMatch ? 0.32 : 0.06 },
      ariaLabel: e.reason,
    } satisfies Edge];
  }), [layout, selectedId, priorityFilter]);

  const fit = useCallback(() => rf.fitView({ padding: 0.03, duration: 450, minZoom: 0.1 }), [rf]);

  useEffect(() => { const t = setTimeout(() => rf.fitView({ padding: 0.03, minZoom: 0.1 }), 60); return () => clearTimeout(t); }, [rf, layout.height]);

  useEffect(() => {
    if (!focusRequest || focusRequest.n === lastFocus.current) return;
    lastFocus.current = focusRequest.n;
    const g = nodeById.get(focusRequest.nodeId);
    if (!g) return;
    setCollapsedClusters((s) => { if (!s.has(g.clusterId)) return s; const n = new Set(s); n.delete(g.clusterId); return n; });
    const band = roadmap.bands.find((b) => b.clusterIds.includes(g.clusterId));
    if (band) setCollapsedBands((s) => { if (!s.has(band.id)) return s; const n = new Set(s); n.delete(band.id); return n; });
    setTimeout(() => {
      const pos = computeLayout(new Set(), new Set()).positions.get(g.id);
      const live = layout.positions.get(g.id) ?? pos;
      if (live) rf.setCenter(live.x + 103, live.y + 22, { zoom: 1.15, duration: 650 });
    }, 80);
  }, [focusRequest, rf, layout]);

  const jump = (clusterId: string) => {
    const b = layout.clusterBox.get(clusterId);
    if (!b) return;
    setCollapsedClusters((s) => { if (!s.has(clusterId)) return s; const n = new Set(s); n.delete(clusterId); return n; });
    rf.fitBounds({ x: b.x - 30, y: b.y - 30, width: b.w + 60, height: b.h + 60 }, { duration: 500, padding: 0.25 });
  };

  const run = async (name: string, fn: () => Promise<void>) => {
    setBusy(name); setError(''); setMenu(false);
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : 'Export failed'); } finally { setBusy(null); }
  };
  const allClusters = roadmap.clusters.map((c) => c.id);

  return (
    <div className={cn('flex h-full w-full flex-col', lowZoom && 'rf-lowzoom')}>
      <div className="relative z-10 flex flex-wrap items-center gap-1 border-b border-line bg-white p-1.5" role="toolbar" aria-label="Roadmap controls">
        <TB label="Zoom in" onClick={() => rf.zoomIn({ duration: 200 })}><Plus size={16} /></TB>
        <TB label="Zoom out" onClick={() => rf.zoomOut({ duration: 200 })}><Minus size={16} /></TB>
        <TB label="Fit entire roadmap to screen" onClick={fit}><Scan size={16} /></TB>
        <TB label={full ? 'Exit full screen' : 'Full screen'} onClick={() => { onToggleFull(); setTimeout(fit, 120); }}>{full ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</TB>
        <TB label="Reset view (fit, expand all, clear filters)" onClick={() => { setCollapsedClusters(new Set()); setCollapsedBands(new Set()); setPriorityFilter('all'); closePanel(); setTimeout(fit, 60); }}><RotateCcw size={16} /></TB>
        <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />
        <TB label="Expand all groups" onClick={() => { setCollapsedClusters(new Set()); setCollapsedBands(new Set()); setTimeout(fit, 60); }}><ChevronsUpDown size={16} /></TB>
        <TB label="Collapse all groups" onClick={() => { setCollapsedClusters(new Set(allClusters)); setTimeout(fit, 60); }}><ChevronsDownUp size={16} /></TB>
        <TB label="Focus selected topic" disabled={!selectedId} onClick={() => { if (!selectedId) return; const p = layout.positions.get(selectedId); if (p) rf.setCenter(p.x + 103, p.y + 22, { zoom: 1.2, duration: 500 }); }}><Focus size={16} /></TB>
        <TB label="Search topics (Ctrl+K)" onClick={() => setSearchOpen(true)}><Search size={16} /></TB>
        <span className="mx-0.5 h-5 w-px bg-line" aria-hidden />
        <label className="sr-only" htmlFor="jump-group">Jump to topic group</label>
        <select id="jump-group" className="h-8 max-w-[150px] rounded-lg border border-line bg-white px-2 text-xs font-medium" value="" onChange={(e) => { if (e.target.value) jump(e.target.value); }}>
          <option value="">Jump to group…</option>
          {roadmap.bands.map((b) => (
            <optgroup key={b.id} label={AREA_META[b.area as Area].label}>
              {b.clusterIds.map((id) => <option key={id} value={id}>{roadmap.clusters.find((c) => c.id === id)!.title}</option>)}
            </optgroup>
          ))}
        </select>
        <div className="relative">
          <button className="flex h-8 items-center gap-1.5 rounded-lg bg-brand px-2.5 text-xs font-semibold text-white hover:bg-blue-700" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((v) => !v)} disabled={!!busy}>
            <Download size={14} /> {busy ? 'Working…' : 'Export'}
          </button>
          {menu && (
            <div role="menu" className="absolute left-0 top-10 z-20 w-52 rounded-xl border border-line bg-white p-1 shadow-float">
              <MI icon={<ImageDown size={15} />} label="Download PNG" onClick={() => run('png', () => downloadRoadmapPng(nodes))} />
              <MI icon={<FileText size={15} />} label="Download PDF" onClick={() => run('pdf', () => downloadRoadmapPdf(nodes))} />
              <MI icon={<Printer size={15} />} label="Print roadmap" onClick={() => run('print', async () => {
                const img = await renderRoadmapImage(nodes, 2800);
                setPrintImage(img.dataUrl);
                await new Promise((r) => setTimeout(r, 250));
                window.print();
              })} />
            </div>
          )}
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
      <ReactFlow
        nodes={nodes} edges={edges} nodeTypes={nodeTypes}
        minZoom={0.1} maxZoom={2.2} nodesDraggable={false} nodesConnectable={false} elementsSelectable={false}
        onlyRenderVisibleElements={false} proOptions={{ hideAttribution: true }}
        onNodeClick={(_, n) => { if (n.type === 'topic') openNode(n.id); }}
        onPaneClick={() => closePanel()}
        onMove={(_, v) => setLowZoom(v.zoom < 0.62)}
        zoomOnDoubleClick={false} fitView fitViewOptions={{ padding: 0.03, minZoom: 0.1 }}
        aria-label="Interactive embedded systems roadmap graph"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#E2E8F0" />
      </ReactFlow>

            {error && <div role="alert" className="absolute bottom-3 left-3 right-3 z-10 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 sm:right-auto">{error}</div>}
      </div>
    </div>
  );
}

function TB({ label, onClick, children, disabled }: { label: string; onClick: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} aria-label={label} title={label} className="grid h-8 w-8 place-items-center rounded-lg text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-35">
      {children}
    </button>
  );
}
function MI({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button role="menuitem" onClick={onClick} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-surface">{icon}{label}</button>;
}

export function RoadmapGraph({ full, onToggleFull }: { full: boolean; onToggleFull: () => void }) {
  return (
    <ReactFlowProvider>
      <Inner full={full} onToggleFull={onToggleFull} />
    </ReactFlowProvider>
  );
}
