import { create } from "zustand";

interface CoverState {
  cached: Record<string, string>;
  cacheCover: (trackId: string, uri: string) => void;
  getCover: (trackId: string) => string | null;
}

export const useCoverStore = create<CoverState>((set, get) => ({
  cached: {},

  cacheCover: (trackId, uri) => {
    set((prev) => ({ cached: { ...prev.cached, [trackId]: uri } }));
  },

  getCover: (trackId) => {
    return get().cached[trackId] ?? null;
  },
}));
