import { api } from "@/src/api";
import type { Track } from "@/src/contracts/track";

export interface PlaybackStream {
  url: string;
  mimeType: string;
  bitrate: number;
  codec: string;
  expiresAtMs: number | null;
  fromLiner: boolean;
}

export async function resolvePlaybackStream(track: Track): Promise<PlaybackStream> {
  try {
    const details = await api.getTrackDetails(track.id);
    const streamUrl = details.cover?.url
      ? `https://api.tryliner.fun/v1/tracks/${track.id}/stream`
      : `https://api.tryliner.fun/v1/tracks/${track.id}/stream`;

    return {
      url: streamUrl,
      mimeType: "audio/mpeg",
      bitrate: 128000,
      codec: "mp3",
      expiresAtMs: null,
      fromLiner: true,
    };
  } catch {
    return {
      url: `https://api.tryliner.fun/v1/tracks/${track.id}/stream`,
      mimeType: "audio/mpeg",
      bitrate: 128000,
      codec: "mp3",
      expiresAtMs: null,
      fromLiner: true,
    };
  }
}
