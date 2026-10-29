import type { Track } from "./track";
import type { Cover } from "./cover";

export interface SearchResult {
  tracks: Track[];
  artists: ArtistSearchResult[];
  albums: AlbumSearchResult[];
  playlists: PlaylistSearchResult[];
}

export interface ArtistSearchResult {
  id: string;
  name: string;
  cover?: Cover;
}

export interface AlbumSearchResult {
  id: string;
  title: string;
  artist: string;
  cover?: Cover;
}

export interface PlaylistSearchResult {
  id: string;
  title: string;
  cover?: Cover;
}

export interface ArtistDetails {
  id: string;
  name: string;
  cover?: Cover;
  description?: string;
  monthlyListeners?: number;
}

export interface AlbumDetails {
  id: string;
  title: string;
  artist: TrackArtist;
  cover?: Cover;
  releaseDate?: string;
  tracks: Track[];
}

export interface CatalogPlaylistDetails {
  id: string;
  title: string;
  cover?: Cover;
  owner?: PublicUser;
  tracks: Track[];
}

export interface PublicUser {
  id: string;
  username?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export interface RadioTrack {
  id: string;
  title: string;
  artists: TrackArtist[];
  cover?: Cover;
  durationMs: number;
}
