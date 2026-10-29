import { create } from "zustand";
import type { Track } from "@/src/contracts/track";

export type RepeatMode = "off" | "all" | "one";
export type PlayerStatus = "idle" | "loading" | "playing" | "paused" | "error";
export type AudioQuality = "low" | "standard" | "high" | "lossless";

export interface TransportState {
  status: PlayerStatus;
  error: string | null;
}

export interface TimelineState {
  positionMs: number;
  durationMs: number;
}

export interface QueueState {
  queue: Track[];
  currentIndex: number;
  currentTrack: Track | null;
  playbackContext: string | null;
  playbackContextCover: string | null;
}

export interface SessionState {
  volume: number;
  repeat: RepeatMode;
  shuffle: boolean;
  audioQuality: AudioQuality;
  playbackRate: number;
  pitchSemitones: number;
  isPitchLinked: boolean;
}

export type PlayerState = TransportState &
  TimelineState &
  QueueState &
  SessionState;

export type PlayerCommand =
  | { type: "PLAY_REQUESTED"; track: Track; queue?: Track[]; context?: string | null; contextCover?: string | null }
  | { type: "PAUSE_REQUESTED" }
  | { type: "RESUME_REQUESTED" }
  | { type: "SEEK_COMMITTED"; positionMs: number }
  | { type: "SKIP_NEXT"; isAutoEnd?: boolean }
  | { type: "SKIP_PREVIOUS" }
  | { type: "SET_VOLUME"; volume: number }
  | { type: "SET_PLAYBACK_RATE"; rate: number }
  | { type: "SET_PITCH_SEMITONES"; semitones: number }
  | { type: "TOGGLE_PLAY_PAUSE" };

export interface PlayerStore extends PlayerState {
  dispatch: (command: PlayerCommand) => void;
  setStatus: (status: PlayerStatus, error?: string | null) => void;
  setPosition: (positionMs: number) => void;
  setDuration: (durationMs: number) => void;
  setPlaybackMode: (mode: string | null) => void;
  setRepeat: (mode: RepeatMode) => void;
  setShuffle: (shuffle: boolean) => void;
  setVolume: (volume: number) => void;
  setCurrentTrack: (track: Track | null, index: number) => void;
  setQueue: (queue: Track[]) => void;
  setPlaybackContext: (context: string | null) => void;
  setPlaybackContextCover: (cover: string | null) => void;
  setAudioQuality: (quality: AudioQuality) => void;
  setPlaybackRate: (rate: number) => void;
  setPitchSemitones: (semitones: number) => void;
  setIsPitchLinked: (linked: boolean) => void;
  resetPlayback: () => void;
  clearQueue: () => void;
}

const FLAT_EQ = [0, 0, 0, 0, 0];

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  status: "idle",
  error: null,
  positionMs: 0,
  durationMs: 0,
  queue: [],
  currentIndex: -1,
  currentTrack: null,
  playbackContext: null,
  playbackContextCover: null,
  volume: 1,
  repeat: "off",
  shuffle: false,
  audioQuality: "high",
  playbackRate: 1,
  pitchSemitones: 0,
  isPitchLinked: true,

  dispatch: () => {
    setTimeout(() => {}, 0);
  },

  setStatus: (status, error = null) => set({ status, error }),
  setPosition: (positionMs) => set({ positionMs }),
  setDuration: (durationMs) => set({ durationMs }),
  setPlaybackMode: () => {},
  setRepeat: (repeat) => set({ repeat }),
  setShuffle: (shuffle) => set({ shuffle }),
  setVolume: (volume) => set({ volume }),
  setCurrentTrack: (currentTrack, currentIndex) => {
    const prev = get().currentTrack;
    set({
      currentTrack,
      currentIndex,
      ...(prev?.id !== currentTrack?.id ? { positionMs: 0 } : {}),
    });
  },
  setQueue: (queue) => set({ queue }),
  setPlaybackContext: (playbackContext) => set({ playbackContext }),
  setPlaybackContextCover: (playbackContextCover) =>
    set({ playbackContextCover }),
  setAudioQuality: () => {},
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setPitchSemitones: (pitchSemitones) => set({ pitchSemitones }),
  setIsPitchLinked: (isPitchLinked) => set({ isPitchLinked }),
  resetPlayback: () =>
    set({
      status: "idle",
      error: null,
      positionMs: 0,
      durationMs: 0,
      queue: [],
      currentIndex: -1,
      currentTrack: null,
      playbackContext: null,
      playbackContextCover: null,
    }),
  clearQueue: () => {
    const state = get();
    if (state.currentTrack) {
      set({ queue: [state.currentTrack], currentIndex: 0 });
    } else {
      set({ queue: [], currentIndex: -1, currentTrack: null });
    }
  },
}));
