import { create } from "zustand";
import { linerDb } from "@/src/storage";

export interface LyricsState {
  lyrics: Record<string, import("@/src/contracts/lyrics").Lyrics>;
  loading: Record<string, boolean>;
  setLyrics: (trackId: string, lyrics: import("@/src/contracts/lyrics").Lyrics) => void;
  getLyrics: (trackId: string) => import("@/src/contracts/lyrics").Lyrics | null;
  setLoading: (trackId: string, loading: boolean) => void;
  isLoading: (trackId: string) => boolean;
}

export const useLyricsStore = create<LyricsState>((set, get) => ({
  lyrics: {},
  loading: {},

  setLyrics: (trackId, lyrics) => {
    set((prev) => ({
      lyrics: { ...prev.lyrics, [trackId]: lyrics },
    }));
    void linerDb.putLyrics(trackId, lyrics);
  },

  getLyrics: (trackId) => {
    return get().lyrics[trackId] ?? null;
  },

  setLoading: (trackId, loading) => {
    set((prev) => ({
      loading: { ...prev.loading, [trackId]: loading },
    }));
  },

  isLoading: (trackId) => !!get().loading[trackId],
}));
