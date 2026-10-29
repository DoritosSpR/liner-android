import type { Track } from "./track";
import type { PublicUser } from "./auth";

export interface PlaylistSummary {
  id: string;
  title: string;
  cover?: string;
  trackCount: number;
  owner?: PublicUser;
}

export interface PlaylistDetails {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  tracks: Track[];
  owner?: PublicUser;
  createdAt?: string;
}

export interface UserPlaylist {
  id: string;
  title: string;
  cover?: string;
  trackCount: number;
}

export interface UserPlaylistItem {
  id: string;
  title: string;
  track: Track;
  addedAt: string;
}

export interface LikedTracksPage {
  tracks: Track[];
  nextCursor?: string | null;
}
