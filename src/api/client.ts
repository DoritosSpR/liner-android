import { executeRequest } from "./executeRequest";
import type {
  AuthResult,
  LoginInput,
  RegisterInput,
  PublicUser,
} from "@/src/contracts/auth";
import type { SearchResult } from "@/src/contracts/catalog";
import type { Track, TrackDetails } from "@/src/contracts/track";
import type {
  PlaylistSummary,
  PlaylistDetails,
  UserPlaylist,
  LikedTracksPage,
} from "@/src/contracts/playlists";
import type {
  PlaybackHistoryItem,
  RecordPlaybackEventRequest,
} from "@/src/contracts/history";
import type { LyricsSearchResult, Lyrics } from "@/src/contracts/lyrics";

export const api = {
  async login(email: string, password: string): Promise<AuthResult> {
    const res = await executeRequest("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async register(
    email: string,
    password: string,
    username: string,
    displayName: string,
  ): Promise<AuthResult> {
    const res = await executeRequest("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, username, displayName }),
    });
    return res.json();
  },

  async getMe(): Promise<PublicUser> {
    const res = await executeRequest("/v1/me");
    return res.json();
  },

  async search(query: string): Promise<SearchResult> {
    const res = await executeRequest(`/v1/search?q=${encodeURIComponent(query)}`);
    return res.json();
  },

  async getTrack(id: string): Promise<Track> {
    const res = await executeRequest(`/v1/tracks/${id}`);
    return res.json();
  },

  async getTrackDetails(id: string): Promise<TrackDetails> {
    const res = await executeRequest(`/v1/tracks/${id}`);
    return res.json();
  },

  async getRadio(): Promise<{ tracks: Track[] }> {
    const res = await executeRequest("/v1/radio");
    return res.json();
  },

  async getAlbum(id: string): Promise<{ id: string; title: string; tracks: Track[] }> {
    const res = await executeRequest(`/v1/albums/${id}`);
    return res.json();
  },

  async getArtist(id: string): Promise<{ id: string; name: string; tracks: Track[] }> {
    const res = await executeRequest(`/v1/artists/${id}`);
    return res.json();
  },

  async getPlaylist(id: string): Promise<PlaylistDetails> {
    const res = await executeRequest(`/v1/playlists/${id}`);
    return res.json();
  },

  async listLikedTracks(cursor?: string): Promise<LikedTracksPage> {
    const url = cursor
      ? `/v1/me/liked-tracks?cursor=${encodeURIComponent(cursor)}`
      : "/v1/me/liked-tracks";
    const res = await executeRequest(url);
    return res.json();
  },

  async likeTrack(trackId: string): Promise<void> {
    await executeRequest(`/v1/me/liked-tracks/${trackId}`, { method: "POST" });
  },

  async unlikeTrack(trackId: string): Promise<void> {
    await executeRequest(`/v1/me/liked-tracks/${trackId}`, { method: "DELETE" });
  },

  async readUserPlaylist(id: string): Promise<UserPlaylist> {
    const res = await executeRequest(`/v1/me/playlists/${id}`);
    return res.json();
  },

  async createPlaylist(
    title: string,
    description?: string,
  ): Promise<{ id: string }> {
    const res = await executeRequest("/v1/me/playlists", {
      method: "POST",
      body: JSON.stringify({ title, description }),
    });
    return res.json();
  },

  async searchLyrics(trackId: string): Promise<LyricsSearchResult> {
    const res = await executeRequest(`/v1/tracks/${trackId}/lyrics/search`);
    return res.json();
  },

  async streamLyrics(
    trackId: string,
    onEvent: (event: unknown) => void,
  ): Promise<void> {
    const res = await executeRequest(`/v1/tracks/${trackId}/lyrics/stream`);
    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              onEvent(data);
            } catch {}
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },

  async recordPlaybackEvent(
    request: RecordPlaybackEventRequest,
  ): Promise<void> {
    await executeRequest("/v1/me/playback/events", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  async getHistory(): Promise<PlaybackHistoryItem[]> {
    const res = await executeRequest("/v1/me/history");
    return res.json();
  },

  async getPopularTracks(window: string = "7d"): Promise<Track[]> {
    const res = await executeRequest(`/v1/popular?window=${window}`);
    return res.json();
  },
};

export { api };
export type { AuthResult, LoginInput, RegisterInput };
