import * as SecureStore from "expo-secure-store";
import type { Track } from "@/src/contracts/track";
import type { Lyrics } from "@/src/contracts/lyrics";

const TRACKS_KEY = "liner_tracks_v1";
const LYRICS_KEY = "liner_lyrics_v1";
const ARTISTS_KEY = "liner_artists_v1";

const MEM_TRACK_LIMIT = 500;
const MEM_LYRICS_LIMIT = 100;
const MEM_ARTIST_LIMIT = 200;

const trackMemory = new Map<string, Track>();
const lyricsMemory = new Map<string, Lyrics>();
const artistMemory = new Map<string, unknown>();

async function getJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function setJson(key: string, value: unknown): Promise<void> {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

export const linerDb = {
  async putTrack(track: Track): Promise<void> {
    const all = (await getJson<Record<string, Track>>(TRACKS_KEY)) ?? {};
    all[track.id] = track;
    trackMemory.set(track.id, track);
    if (trackMemory.size > MEM_TRACK_LIMIT) {
      const firstKey = trackMemory.keys().next().value;
      trackMemory.delete(firstKey);
    }
    await setJson(TRACKS_KEY, all);
  },

  async getTrack(id: string): Promise<Track | null> {
    const cached = trackMemory.get(id);
    if (cached) return cached;
    const all = (await getJson<Record<string, Track>>(TRACKS_KEY)) ?? {};
    const track = all[id] ?? null;
    if (track) trackMemory.set(id, track);
    return track;
  },

  async deleteTrack(id: string): Promise<void> {
    trackMemory.delete(id);
    const all = (await getJson<Record<string, Track>>(TRACKS_KEY)) ?? {};
    delete all[id];
    await setJson(TRACKS_KEY, all);
  },

  async putLyrics(trackId: string, lyrics: Lyrics): Promise<void> {
    const all = (await getJson<Record<string, Lyrics>>(LYRICS_KEY)) ?? {};
    all[trackId] = lyrics;
    lyricsMemory.set(trackId, lyrics);
    if (lyricsMemory.size > MEM_LYRICS_LIMIT) {
      const firstKey = lyricsMemory.keys().next().value;
      lyricsMemory.delete(firstKey);
    }
    await setJson(LYRICS_KEY, all);
  },

  async getLyrics(trackId: string): Promise<Lyrics | null> {
    const cached = lyricsMemory.get(trackId);
    if (cached) return cached;
    const all = (await getJson<Record<string, Lyrics>>(LYRICS_KEY)) ?? {};
    const lyrics = all[trackId] ?? null;
    if (lyrics) lyricsMemory.set(trackId, lyrics);
    return lyrics;
  },

  async putArtist(id: string, data: unknown): Promise<void> {
    const all = (await getJson<Record<string, unknown>>(ARTISTS_KEY)) ?? {};
    all[id] = data;
    artistMemory.set(id, data);
    if (artistMemory.size > MEM_ARTIST_LIMIT) {
      const firstKey = artistMemory.keys().next().value;
      artistMemory.delete(firstKey);
    }
    await setJson(ARTISTS_KEY, all);
  },

  async getArtist(id: string): Promise<unknown | null> {
    const cached = artistMemory.get(id);
    if (cached) return cached;
    const all = (await getJson<Record<string, unknown>>(ARTISTS_KEY)) ?? {};
    const data = all[id] ?? null;
    if (data) artistMemory.set(id, data);
    return data;
  },
};
