// Domain interfaces for the application
export interface DbArtist {
  id: string;
  name: string;
  created_at?: string;
}

export interface DbSong {
  id: string;
  title: string | undefined;
  bpm?: number;
  key: string;
  genres: string[];
  created_at: string;
  user_id: string;
  moods: string[];
  tags: string[];
  public: boolean;
  writers: string[];
  song_artists: DbSongArtist[];
  playlist_songs: DbPlaylistSong[];
  file_url: string;
  types: string;
}

export interface DbPlaylist {
  id: string;
  user_id: string;
  name: string;
  background?: string;
  created_at: string;
  updated_at?: string;
  shareable: boolean;
}

export interface DbSongArtist {
  id: string;
  song_id: string;
  artist_id: string;
  created_at?: string;
  artist?: DbArtist;
}

export interface DbPlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  created_at?: string;
  playlist?: DbPlaylist;
}

export interface ArtistSongStats {
  totalSongs: number;
  averageBpm: number;
  genreDistribution: Record<string, number>;
  keyDistribution: Record<string, number>;
  monthlyUploads: Record<string, number>;
  oldestSong?: DbSong;
  newestSong?: DbSong;
  playlistAppearances: number;
}
