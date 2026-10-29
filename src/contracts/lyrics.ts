export type LyricsFormat = "synced" | "unsynced" | "richsync";
export type LyricsSyncLevel = "word" | "line" | "none";

export interface LyricsCandidate {
  provider: string;
  format: LyricsFormat;
  syncLevel: LyricsSyncLevel;
}

export interface LyricsSearchResult {
  trackId: string;
  candidates: LyricsCandidate[];
}

export interface LyricsLine {
  startMs: number;
  endMs: number;
  text: string;
  words?: { startMs: number; endMs: number; text: string }[];
}

export interface Lyrics {
  trackId: string;
  format: LyricsFormat;
  lines: LyricsLine[];
  unsyncedText?: string;
  provider: string;
}

export interface LyricsStreamEvent {
  type: "metadata" | "lyrics" | "done";
  provider?: string;
  format?: LyricsFormat;
  line?: LyricsLine;
  index?: number;
  totalLines?: number;
}
