import type { Node } from '@xyflow/react';
import { clusterById, nodeById, roadmap } from '../../lib/data';

export const NODE_W = 206;
export const NODE_H = 44;
const GAP = 10;
const PAD = 14;
const HEAD = 36;
const CGAP = 20;
const BAND_PAD = 24;
const BAND_HEAD = 50;
const BAND_GAP = 28;
export const ROW_W = 2400;

export interface TopicNodeData extends Record<string, unknown> {
  nodeId: string;
  label: string;
  area: string;
  priority: string;
  selected: boolean;
  connected: boolean;
  dim: boolean;
  matches: boolean;
  status: string;
  bookmarked: boolean;
}
export interface ClusterNodeData extends Record<string, unknown> {
  clusterId: string;
  label: string;
  area: string;
  count: number;
  collapsed: boolean;
  w: number;
  h: number;
}
export interface BandNodeData extends Record<string, unknown> {
  bandId: string;
  label: string;
  area: string;
  collapsed: boolean;
  count: number;
  w: number;
  h: number;
}

export interface LayoutResult {
  nodes: Node[];
  positions: Map<string, { x: number; y: number }>;
  clusterBox: Map<string, { x: number; y: number; w: number; h: number }>;
  hidden: Set<string>;
  width: number;
  height: number;
}

export function computeLayout(collapsedClusters: Set<string>, collapsedBands: Set<string>): LayoutResult {
  const nodes: Node[] = [];
  const positions = new Map<string, { x: number; y: number }>();
  const clusterBox = new Map<string, { x: number; y: number; w: number; h: number }>();
  const hidden = new Set<string>();
  const topicNodes: Node[] = [];
  const clusterNodes: Node[] = [];
  let y = 0;

  for (const band of roadmap.bands) {
    const bandNodeCount = band.clusterIds.reduce((s, id) => s + (clusterById.get(id)?.nodeIds.length ?? 0), 0);
    const bandCollapsed = collapsedBands.has(band.id);
    const top = y;
    let contentBottom = top + BAND_HEAD;

    if (bandCollapsed) {
      for (const cid of band.clusterIds) for (const nid of clusterById.get(cid)!.nodeIds) hidden.add(nid);
      contentBottom = top + BAND_HEAD + 8;
    } else {
      let x = BAND_PAD;
      let rowTop = top + BAND_HEAD;
      let rowH = 0;
      for (const cid of band.clusterIds) {
        const c = clusterById.get(cid)!;
        const cols = Math.min(c.per, c.nodeIds.length) || 1;
        const rows = Math.ceil(c.nodeIds.length / cols);
        const w = PAD * 2 + cols * NODE_W + (cols - 1) * GAP;
        const collapsed = collapsedClusters.has(cid);
        const h = collapsed ? HEAD + 8 : HEAD + PAD + rows * NODE_H + (rows - 1) * GAP;
        if (x + w > ROW_W - BAND_PAD && x > BAND_PAD) {
          x = BAND_PAD;
          rowTop += rowH + CGAP;
          rowH = 0;
        }
        clusterBox.set(cid, { x, y: rowTop, w, h });
        clusterNodes.push({
          id: `cluster-${cid}`, type: 'cluster', className: 'cluster-node', position: { x, y: rowTop },
          data: { clusterId: cid, label: c.title, area: band.area, count: c.nodeIds.length, collapsed, w, h } satisfies ClusterNodeData,
          draggable: false, selectable: false, focusable: false, zIndex: 1, style: { width: w, height: h },
        });
        c.nodeIds.forEach((nid, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const px = x + PAD + col * (NODE_W + GAP);
          const py = rowTop + HEAD + row * (NODE_H + GAP);
          positions.set(nid, { x: px, y: py });
          if (collapsed) hidden.add(nid);
          topicNodes.push({ id: nid, type: 'topic', position: { x: px, y: py }, hidden: collapsed, zIndex: 3, draggable: false, data: {}, style: { width: NODE_W, height: NODE_H } });
        });
        x += w + CGAP;
        rowH = Math.max(rowH, h);
      }
      contentBottom = rowTop + rowH + BAND_PAD * 0.7;
    }
    const bh = contentBottom - top;
    nodes.push({
      id: `band-${band.id}`, type: 'band', className: 'band-node', position: { x: 0, y: top },
      data: { bandId: band.id, label: band.label, area: band.area, collapsed: bandCollapsed, count: bandNodeCount, w: ROW_W, h: bh } satisfies BandNodeData,
      draggable: false, selectable: false, focusable: false, zIndex: 0, style: { width: ROW_W, height: bh },
    });
    y = contentBottom + BAND_GAP;
  }
  // sanity: every node must have a position
  for (const n of roadmap.nodes) if (!positions.has(n.id)) positions.set(n.id, { x: 0, y: 0 });
  void nodeById;
  return { nodes: [...nodes, ...clusterNodes, ...topicNodes], positions, clusterBox, hidden, width: ROW_W, height: y - BAND_GAP };
}

/** Pick connection sides so lines leave from the side that faces the other node. */
export function sides(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  if (Math.abs(dx) > Math.abs(dy) * 1.15) {
    return dx > 0 ? { s: 's-right', t: 't-left' } : { s: 's-left', t: 't-right' };
  }
  return dy > 0 ? { s: 's-bottom', t: 't-top' } : { s: 's-top', t: 't-bottom' };
}
