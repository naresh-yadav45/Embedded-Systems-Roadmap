import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Bookmark, Check, ChevronDown, ChevronRight, CircleDashed } from 'lucide-react';
import { AREA_META, PRIORITY_META } from '../../lib/meta';
import type { Area, Priority } from '../../types';
import type { BandNodeData, ClusterNodeData, TopicNodeData } from './layout';
import { cn } from '../../lib/utils';

const SIDES: [Position, string][] = [[Position.Top, 'top'], [Position.Right, 'right'], [Position.Bottom, 'bottom'], [Position.Left, 'left']];

export const TopicNode = memo(function TopicNode({ data }: NodeProps) {
  const d = data as TopicNodeData;
  const area = AREA_META[d.area as Area];
  const prio = PRIORITY_META[d.priority as Priority];
  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); (d.onOpen as ((id: string) => void) | undefined)?.(d.nodeId); } }}
      aria-label={`${d.label}, ${area.label}, ${prio.label} priority${d.status === 'completed' ? ', completed' : d.status === 'in-progress' ? ', in progress' : ''}`}
      className={cn(
        'group relative flex h-full w-full items-center gap-2 rounded-lg border bg-white pl-3 pr-2 shadow-sm transition-[opacity,box-shadow,transform] duration-200',
        d.dim && 'opacity-[0.18]',
        d.selected ? 'z-10 shadow-float ring-2' : d.connected ? 'shadow-md ring-1' : 'hover:shadow-md',
        d.matches && !d.selected && 'ring-1',
      )}
      style={{
        borderColor: d.selected || d.connected ? area.color : '#E2E8F0',
        borderLeft: `4px solid ${area.color}`,
        ['--tw-ring-color' as string]: area.color,
        background: d.selected ? area.soft : '#fff',
      }}
    >
      {SIDES.map(([pos, name]) => (
        <span key={name}>
          <Handle id={`s-${name}`} type="source" position={pos} className="handle-hidden" isConnectable={false} />
          <Handle id={`t-${name}`} type="target" position={pos} className="handle-hidden" isConnectable={false} />
        </span>
      ))}
      <span className="topic-label line-clamp-2 min-w-0 flex-1 break-words text-[12.5px] font-semibold leading-[1.15] text-ink">{d.label}</span>
      {d.status === 'completed' && <Check size={13} className="shrink-0 text-emerald-600" aria-hidden />}
      {d.status === 'in-progress' && <CircleDashed size={13} className="shrink-0 text-amber-600" aria-hidden />}
      {d.bookmarked && <Bookmark size={12} className="shrink-0 fill-amber-400 text-amber-500" aria-hidden />}
      <span className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white" style={{ background: prio.color, opacity: d.priority === 'optional' ? 0.55 : 1 }} title={prio.label} aria-hidden />
    </div>
  );
});

export const ClusterNode = memo(function ClusterNode({ data }: NodeProps) {
  const d = data as ClusterNodeData & { onToggle?: (id: string) => void };
  const area = AREA_META[d.area as Area];
  return (
    <div className="h-full w-full rounded-xl border" style={{ background: `${area.color}0D`, borderColor: `${area.color}33` }}>
      <button
        className="nodrag nopan flex h-9 w-full items-center gap-1.5 px-3 text-left"
        onClick={(e) => { e.stopPropagation(); d.onToggle?.(d.clusterId); }}
        aria-expanded={!d.collapsed}
        aria-label={`${d.collapsed ? 'Expand' : 'Collapse'} ${d.label}`}
      >
        {d.collapsed ? <ChevronRight size={14} style={{ color: area.color }} /> : <ChevronDown size={14} style={{ color: area.color }} />}
        <span className="truncate text-[12px] font-bold uppercase tracking-wide" style={{ color: area.text }}>{d.label}</span>
        <span className="ml-auto rounded-full bg-white/80 px-1.5 text-[10px] font-semibold text-muted">{d.count}</span>
      </button>
    </div>
  );
});

export const BandNode = memo(function BandNode({ data }: NodeProps) {
  const d = data as BandNodeData & { onToggle?: (id: string) => void };
  const area = AREA_META[d.area as Area];
  return (
    <div className="h-full w-full rounded-2xl border-2" style={{ background: `${area.color}08`, borderColor: `${area.color}2E` }}>
      <button
        className="nodrag nopan flex h-[50px] items-center gap-2 px-5"
        onClick={(e) => { e.stopPropagation(); d.onToggle?.(d.bandId); }}
        aria-expanded={!d.collapsed}
        aria-label={`${d.collapsed ? 'Expand' : 'Collapse'} section ${d.label}`}
      >
        {d.collapsed ? <ChevronRight size={18} style={{ color: area.color }} /> : <ChevronDown size={18} style={{ color: area.color }} />}
        <span className="font-display text-lg font-extrabold tracking-wide" style={{ color: area.text }}>{d.label}</span>
        <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: area.color }}>{d.count} topics</span>
      </button>
    </div>
  );
});
