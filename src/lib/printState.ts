import { useSyncExternalStore } from 'react';

let image: string | null = null;
const listeners = new Set<() => void>();
export const setPrintImage = (v: string | null) => { image = v; listeners.forEach((l) => l()); };
export const usePrintImage = () => useSyncExternalStore((cb) => { listeners.add(cb); return () => listeners.delete(cb); }, () => image);
