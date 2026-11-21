export type Area = 'software' | 'hardware' | 'both' | 'soft' | 'general';
export type Priority = 'required' | 'recommended' | 'optional';
export type Status = 'not-started' | 'in-progress' | 'completed';

export type ResourceKind =
  | 'youtube-video' | 'youtube-playlist' | 'youtube-channel' | 'other-video'
  | 'coursera' | 'udemy' | 'course' | 'book' | 'article' | 'documentation'
  | 'datasheet' | 'tool' | 'repository';

export interface YouTubeInfo { kind: 'video' | 'playlist' | 'channel' | 'other'; videoId?: string; listId?: string; start?: string }

export interface Resource {
  id: string;
  url: string;
  title: string;
  kind: ResourceKind;
  domain: string;
  beginner: boolean;
  gem: boolean;
  audio: boolean;
  note: string;
  topicIds: string[];
  associations: { topicId: string; title: string; note: string }[];
  source: 'readme-list' | 'readme-inline';
  youtube?: YouTubeInfo;
  urlVariants: string[];
  validation: { urlValid: boolean; issues: string[] };
  linkStatus: 'unchecked';
  needsVerification: boolean;
  displayTitleFallback?: string;
}

export type DescBlock =
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'quote'; source: string; url: string; paragraphs: string[] };

export interface Topic {
  id: string;
  title: string;
  icon: string;
  parentId: string | null;
  depth: number;
  path: string[];
  section: string;
  area: Area;
  priority: Priority | null;
  nodeIds: string[];
  childIds: string[];
  resourceIds: string[];
  description: DescBlock[];
  ownResourceCount: number;
  totalResourceCount: number;
}

export interface GraphNode {
  id: string;
  title: string;
  area: Exclude<Area, 'general'>;
  clusterId: string;
  clusterTitle: string;
  priority: Priority;
  topicIds: string[];
  primaryTopicId: string | null;
}
export interface Cluster { id: string; title: string; bandId: string; per: number; nodeIds: string[] }
export interface Band { id: Exclude<Area, 'general'>; label: string; area: Exclude<Area, 'general'>; clusterIds: string[] }
export interface Edge { id: string; source: string; target: string; reason: string }
export interface AutoLink { a: string; b: string; weight: number; shared: string[]; mentions: { topicId: string; text: string }[] }

export interface RoadmapData {
  title: string;
  source: { name: string; author: string; repo: string; license: string; licenseUrl: string };
  bands: Band[];
  clusters: Cluster[];
  nodes: GraphNode[];
  edges: Edge[];
  autoLinks: AutoLink[];
  topics: Topic[];
  sections: { title: string; topicIds: string[] }[];
}

export interface LearningPath {
  id: string;
  title: string;
  summary: string;
  audience: string;
  /** Recommended learning order (topic titles as they appear on the roadmap). */
  sequence: { stage: string; topics: string[]; why: string }[];
  /** Hard prerequisites (strict dependencies) - kept separate from the suggested order. */
  prerequisites: string[];
  tools: string[];
  projectIds: string[];
}

export interface Project {
  id: string;
  name: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  summary: string;
  skills: string[];
  hardware: string[];
  software: string[];
  outcomes: string[];
  topics: string[];
}

export interface TopicProgress { status: Status; bookmarked: boolean; note: string; updatedAt: number }
export interface ProgressState { topics: Record<string, TopicProgress>; bookmarkedResources: string[]; recent: string[] }

/** What the details panel is showing. */
export interface Selection { nodeId?: string; topicId: string }
