import roadmapJson from '../data/roadmap.json';
import resourcesJson from '../data/resources.json';
import pathsJson from '../data/learningPaths.json';
import projectsJson from '../data/projects.json';
import type {
  Area, GraphNode, LearningPath, Priority, Project, Resource, RoadmapData, Topic,
} from '../types';

export const roadmap = roadmapJson as unknown as RoadmapData;
export const resources = resourcesJson as unknown as Resource[];
export const learningPaths = pathsJson as unknown as LearningPath[];
export const projects = projectsJson as unknown as Project[];

export const topicById = new Map<string, Topic>(roadmap.topics.map((t) => [t.id, t]));
export const nodeById = new Map<string, GraphNode>(roadmap.nodes.map((n) => [n.id, n]));
export const nodeByTitle = new Map<string, GraphNode>(roadmap.nodes.map((n) => [n.title, n]));
export const resourceById = new Map<string, Resource>(resources.map((r) => [r.id, r]));
export const clusterById = new Map(roadmap.clusters.map((c) => [c.id, c]));

export const nodesByTopic = new Map<string, GraphNode[]>();
for (const n of roadmap.nodes) {
  for (const tid of n.topicIds) {
    const list = nodesByTopic.get(tid) ?? [];
    list.push(n);
    nodesByTopic.set(tid, list);
  }
}

/** Adjacency over the curated roadmap links, with the reason for each connection. */
export const adjacency = new Map<string, { other: string; reason: string; edgeId: string }[]>();
for (const e of roadmap.edges) {
  for (const [a, b] of [[e.source, e.target], [e.target, e.source]] as const) {
    const list = adjacency.get(a) ?? [];
    list.push({ other: b, reason: e.reason, edgeId: e.id });
    adjacency.set(a, list);
  }
}

export const autoLinksByTopic = new Map<string, { other: string; weight: number; shared: string[]; mention?: string }[]>();
for (const l of roadmap.autoLinks) {
  for (const [a, b] of [[l.a, l.b], [l.b, l.a]] as const) {
    const list = autoLinksByTopic.get(a) ?? [];
    list.push({ other: b, weight: l.weight, shared: l.shared, mention: l.mentions[0]?.text });
    autoLinksByTopic.set(a, list);
  }
}

export function resourcesOfTopic(topicId: string): Resource[] {
  const t = topicById.get(topicId);
  if (!t) return [];
  return t.resourceIds.map((id) => resourceById.get(id)).filter((r): r is Resource => !!r);
}

export function subtreeTopicIds(topicId: string): string[] {
  const out: string[] = [];
  const walk = (id: string) => {
    out.push(id);
    topicById.get(id)?.childIds.forEach(walk);
  };
  walk(topicId);
  return out;
}

export const topLevelTopics = roadmap.topics.filter((t) => t.parentId === null);

/** README topic -> the graph node used for progress, when it maps to exactly one node. */
export function progressKey(topicId: string, nodeId?: string): string {
  if (nodeId) return nodeId;
  const mapped = nodesByTopic.get(topicId) ?? [];
  return mapped.length === 1 ? mapped[0].id : `t-${topicId}`;
}

export const AREAS_ON_MAP: Exclude<Area, 'general'>[] = ['software', 'both', 'hardware', 'soft'];

export const stats = (() => {
  const byArea: Record<string, number> = { software: 0, hardware: 0, both: 0, soft: 0 };
  const byPriority: Record<Priority, number> = { required: 0, recommended: 0, optional: 0 };
  for (const n of roadmap.nodes) { byArea[n.area] += 1; byPriority[n.priority] += 1; }
  const byKind: Record<string, number> = {};
  for (const r of resources) byKind[r.kind] = (byKind[r.kind] ?? 0) + 1;
  return {
    mapTopics: roadmap.nodes.length,
    readmeTopics: roadmap.topics.length,
    software: byArea.software,
    hardware: byArea.hardware,
    both: byArea.both,
    soft: byArea.soft,
    byPriority,
    resources: resources.length,
    youtube: resources.filter((r) => r.kind.startsWith('youtube')).length,
    associations: resources.reduce((s, r) => s + r.topicIds.length, 0),
    connections: roadmap.edges.length,
    byKind,
  };
})();

export function topicTitle(topicId: string): string {
  return topicById.get(topicId)?.title ?? topicId;
}

export function resolveSelectionTitle(nodeId?: string, topicId?: string): string {
  if (nodeId && nodeById.has(nodeId)) return nodeById.get(nodeId)!.title;
  return topicId ? topicTitle(topicId) : '';
}

/** Open the right selection for a README topic id (a graph node when it is the single owner). */
export function selectionForTopic(topicId: string): { nodeId?: string; topicId: string } {
  const mapped = nodesByTopic.get(topicId) ?? [];
  return mapped.length === 1 ? { nodeId: mapped[0].id, topicId } : { topicId };
}

export function selectionForNode(nodeId: string): { nodeId: string; topicId: string } {
  const n = nodeById.get(nodeId)!;
  return { nodeId, topicId: n.primaryTopicId ?? n.topicIds[0] };
}
