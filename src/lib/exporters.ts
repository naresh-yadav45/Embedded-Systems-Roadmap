import type { Node } from '@xyflow/react';
import { getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';
import { buildOutline, flattenOutline } from './outline';
import { AREA_META, CREATOR, PRIORITY_META } from './meta';
import { downloadBlob, downloadText } from './utils';
import { roadmap } from './data';
import type { ProgressState } from '../types';

export interface RoadmapImage { dataUrl: string; width: number; height: number }

/** Renders the whole roadmap (not just the visible viewport) to a PNG data URL. */
export async function renderRoadmapImage(nodes: Node[], maxWidth = 3600): Promise<RoadmapImage> {
  const el = document.querySelector<HTMLElement>('.react-flow__viewport');
  if (!el) throw new Error('Roadmap graph is not mounted. Switch to the Graph view and try again.');
  const visible = nodes.filter((n) => !n.hidden);
  const bounds = getNodesBounds(visible.map((n) => ({ ...n, measured: { width: Number(n.style?.width ?? 206), height: Number(n.style?.height ?? 44) } })));
  const pad = 40;
  const width = Math.round(Math.min(maxWidth, bounds.width + pad * 2));
  const height = Math.round(width * ((bounds.height + pad * 2) / (bounds.width + pad * 2)));
  const vp = getViewportForBounds(bounds, width, height, 0.05, 3, 0.02);
  const opts = {
    backgroundColor: '#ffffff', width, height, pixelRatio: 1, cacheBust: false,
    style: { width: `${width}px`, height: `${height}px`, transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})` },
  };
  let dataUrl: string;
  try { dataUrl = await toPng(el, opts); } catch { dataUrl = await toPng(el, { ...opts, skipFonts: true }); }
  return { dataUrl, width, height };
}

export async function downloadRoadmapPng(nodes: Node[]) {
  const img = await renderRoadmapImage(nodes);
  const blob = await (await fetch(img.dataUrl)).blob();
  downloadBlob('embedded-systems-engineering-roadmap.png', blob);
}

const ascii = (s: string) =>
  s.replace(/[µμ]/g, 'u').replace(/[–—]/g, '-').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/…/g, '...').replace(/∩/g, '+').replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '');

export async function downloadRoadmapPdf(nodes: Node[]) {
  const [{ jsPDF }, img] = await Promise.all([import('jspdf'), renderRoadmapImage(nodes, 3000)]);
  // Page 1: the roadmap diagram on a landscape page matched to its aspect ratio.
  const pageW = 1190;
  const margin = 36;
  const headH = 64;
  const imgW = pageW - margin * 2;
  const imgH = imgW * (img.height / img.width);
  const pageH = Math.max(842, imgH + headH + margin * 2);
  const doc = new jsPDF({ unit: 'pt', format: [pageW, pageH], orientation: 'landscape', compress: true });
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(15, 23, 42);
  doc.text('Embedded Systems Engineering Roadmap', margin, margin + 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.setTextColor(100, 116, 139);
  doc.text(`Designed & developed by ${CREATOR.name} - ${CREATOR.role} - ${CREATOR.github}`, margin, margin + 38);
  doc.addImage(img.dataUrl, 'PNG', margin, margin + headH, imgW, imgH, undefined, 'FAST');

  // Following pages: complete topic outline on A4.
  doc.addPage([595, 842], 'portrait');
  let y = 48;
  const left = 48;
  const lineH = 14;
  const ensure = (need: number) => { if (y + need > 842 - 48) { doc.addPage([595, 842], 'portrait'); y = 48; } };
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.setTextColor(15, 23, 42);
  doc.text('Topic outline', left, y); y += 24;
  for (const g of buildOutline()) {
    ensure(40);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    const c = AREA_META[g.area].color;
    doc.setTextColor(parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16));
    doc.text(ascii(AREA_META[g.area].label.toUpperCase()), left, y); y += 18;
    for (const row of flattenOutline([g])) {
      ensure(lineH);
      doc.setFont('helvetica', row.depth === 1 ? 'bold' : 'normal'); doc.setFontSize(row.depth === 1 ? 10 : 9.5); doc.setTextColor(30, 41, 59);
      const prio = row.topic.priority ? `  [${PRIORITY_META[row.topic.priority].label}]` : '';
      const text = ascii(`${row.topic.title}${prio}`);
      const lines = doc.splitTextToSize(text, 595 - left * 2 - row.depth * 14) as string[];
      doc.text(lines, left + (row.depth - 1) * 14, y);
      y += lineH * lines.length;
    }
    y += 10;
  }
  ensure(30);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
  doc.text(ascii(`Roadmap content: Embedded Engineering Roadmap by ${roadmap.source.author}, ${roadmap.source.license}.`), left, y + 8);
  doc.save('embedded-systems-engineering-roadmap.pdf');
}

export function exportProgressJson(progress: ProgressState) {
  const payload = { app: 'embedded-systems-engineering-roadmap', version: 1, exportedAt: new Date().toISOString(), progress };
  downloadText('embedded-roadmap-progress.json', JSON.stringify(payload, null, 2), 'application/json');
}
