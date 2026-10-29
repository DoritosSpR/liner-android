export interface PlaybackContext {
  id: string | null;
  type: "album" | "playlist" | "radio" | "search" | null;
  title: string | null;
  cover?: string | null;
}

export interface RecordPlaybackEventRequest {
  trackId: string;
  positionMs: number;
  event: "play" | "pause" | "skip" | "finish" | "like";
  context?: PlaybackContext;
}

export interface PlaybackHistoryItem {
  id: string;
  trackId: string;
  trackTitle: string;
  trackArtists: string[];
  coverUrl?: string;
  playedAt: string;
  positionMs: number;
}

export type PopularTimeWindow = "1d" | "7d" | "30d" | "all";
