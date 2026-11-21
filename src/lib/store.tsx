import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Priority, ProgressState, Resource, Selection, Status, TopicProgress } from '../types';
import { nodeById, progressKey, selectionForNode, selectionForTopic } from './data';

const STORAGE_KEY = 'embedded-roadmap.progress.v1';
const emptyProgress = (): ProgressState => ({ topics: {}, bookmarkedResources: [], recent: [] });

function load(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return sanitize(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function sanitize(input: unknown): ProgressState {
  const out = emptyProgress();
  if (!input || typeof input !== 'object') return out;
  const obj = input as Partial<ProgressState>;
  if (obj.topics && typeof obj.topics === 'object') {
    for (const [k, v] of Object.entries(obj.topics)) {
      if (!v || typeof v !== 'object') continue;
      const s = (v as TopicProgress).status;
      out.topics[k] = {
        status: s === 'completed' || s === 'in-progress' ? s : 'not-started',
        bookmarked: !!(v as TopicProgress).bookmarked,
        note: typeof (v as TopicProgress).note === 'string' ? (v as TopicProgress).note.slice(0, 5000) : '',
        updatedAt: Number((v as TopicProgress).updatedAt) || Date.now(),
      };
    }
  }
  if (Array.isArray(obj.bookmarkedResources)) out.bookmarkedResources = obj.bookmarkedResources.filter((x) => typeof x === 'string');
  if (Array.isArray(obj.recent)) out.recent = obj.recent.filter((x) => typeof x === 'string').slice(0, 8);
  return out;
}

export type Route = { name: 'home' } | { name: 'resources' } | { name: 'notfound'; hash: string };

function parseHash(): { route: Route; topic?: string } {
  const h = window.location.hash.replace(/^#/, '');
  if (h === '' || h === '/') return { route: { name: 'home' } };
  if (h === '/resources' || h.startsWith('/resources?')) return { route: { name: 'resources' } };
  const t = h.match(/^\/topic\/([\w-]+)$/);
  if (t) return { route: { name: 'home' }, topic: t[1] };
  return { route: { name: 'notfound', hash: h } };
}

interface Store {
  route: Route;
  progress: ProgressState;
  selection: Selection | null;
  openSelection: (s: Selection) => void;
  openTopic: (topicId: string) => void;
  openNode: (nodeId: string) => void;
  closePanel: () => void;
  setStatus: (key: string, status: Status) => void;
  toggleBookmark: (key: string) => void;
  setNote: (key: string, note: string) => void;
  toggleResourceBookmark: (resourceId: string) => void;
  resetProgress: () => void;
  importProgress: (json: string) => boolean;
  priorityFilter: Priority | 'all';
  setPriorityFilter: (p: Priority | 'all') => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  focusRequest: { nodeId: string; n: number } | null;
  focusNode: (nodeId: string) => void;
  video: Resource | null;
  playVideo: (r: Resource | null) => void;
  goSection: (id: string) => void;
  goResources: (query?: string) => void;
  resourceQuery: string;
  setResourceQuery: (q: string) => void;
  showOnMap: (topicId: string) => void;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() => parseHash().route);
  const [progress, setProgress] = useState<ProgressState>(load);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all');
  const [searchOpen, setSearchOpen] = useState(false);
  const [focusRequest, setFocusRequest] = useState<Store['focusRequest']>(null);
  const [video, playVideo] = useState<Resource | null>(null);
  const [resourceQuery, setResourceQuery] = useState('');
  const counter = useRef(0);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch { /* storage may be unavailable */ }
  }, [progress]);

  const pushRecent = useCallback((key: string) => {
    setProgress((p) => ({ ...p, recent: [key, ...p.recent.filter((k) => k !== key)].slice(0, 8) }));
  }, []);

  const openSelection = useCallback((s: Selection) => {
    setSelection(s);
    pushRecent(progressKey(s.topicId, s.nodeId));
  }, [pushRecent]);

  const openTopic = useCallback((topicId: string) => openSelection(selectionForTopic(topicId)), [openSelection]);
  const openNode = useCallback((nodeId: string) => { if (nodeById.has(nodeId)) openSelection(selectionForNode(nodeId)); }, [openSelection]);
  const closePanel = useCallback(() => setSelection(null), []);

  const scrollToId = useCallback((id: string) => {
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
  }, []);

  useEffect(() => {
    const onHash = () => {
      const { route: r, topic } = parseHash();
      setRoute(r);
      if (topic) openTopic(topic);
      if (r.name !== 'home') window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHash);
    const first = parseHash();
    if (first.topic) openTopic(first.topic);
    return () => window.removeEventListener('hashchange', onHash);
  }, [openTopic]);

  const goSection = useCallback((id: string) => {
    if (parseHash().route.name !== 'home') {
      window.location.hash = '#/';
      setTimeout(() => scrollToId(id), 120);
    } else scrollToId(id);
  }, [scrollToId]);

  const goResources = useCallback((query?: string) => {
    if (query !== undefined) setResourceQuery(query);
    window.location.hash = '#/resources';
  }, []);

  const focusNode = useCallback((nodeId: string) => {
    counter.current += 1;
    setFocusRequest({ nodeId, n: counter.current });
  }, []);

  const showOnMap = useCallback((topicId: string) => {
    const mapped = selectionForTopic(topicId);
    if (mapped.nodeId) {
      goSection('roadmap');
      setTimeout(() => focusNode(mapped.nodeId!), 350);
      openSelection(mapped);
    } else openSelection(mapped);
  }, [focusNode, goSection, openSelection]);

  const patchTopic = useCallback((key: string, patch: Partial<TopicProgress>) => {
    setProgress((p) => {
      const prev = p.topics[key] ?? { status: 'not-started' as Status, bookmarked: false, note: '', updatedAt: 0 };
      return { ...p, topics: { ...p.topics, [key]: { ...prev, ...patch, updatedAt: Date.now() } } };
    });
  }, []);

  const value = useMemo<Store>(() => ({
    route, progress, selection, openSelection, openTopic, openNode, closePanel,
    setStatus: (key, status) => patchTopic(key, { status }),
    toggleBookmark: (key) => setProgress((p) => {
      const prev = p.topics[key] ?? { status: 'not-started' as Status, bookmarked: false, note: '', updatedAt: 0 };
      return { ...p, topics: { ...p.topics, [key]: { ...prev, bookmarked: !prev.bookmarked, updatedAt: Date.now() } } };
    }),
    setNote: (key, note) => patchTopic(key, { note }),
    toggleResourceBookmark: (id) => setProgress((p) => ({
      ...p,
      bookmarkedResources: p.bookmarkedResources.includes(id) ? p.bookmarkedResources.filter((x) => x !== id) : [...p.bookmarkedResources, id],
    })),
    resetProgress: () => setProgress(emptyProgress()),
    importProgress: (json) => {
      try {
        const parsed = JSON.parse(json);
        const data = sanitize(parsed.progress ?? parsed);
        setProgress(data);
        return true;
      } catch { return false; }
    },
    priorityFilter, setPriorityFilter, searchOpen, setSearchOpen, focusRequest, focusNode, video, playVideo,
    goSection, goResources, resourceQuery, setResourceQuery, showOnMap,
  }), [route, progress, selection, openSelection, openTopic, openNode, closePanel, patchTopic, priorityFilter, searchOpen, focusRequest, focusNode, video, goSection, goResources, resourceQuery, showOnMap]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): Store {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
