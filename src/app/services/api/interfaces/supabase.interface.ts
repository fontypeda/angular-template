// Interfaces for raw Supabase responses
export interface RawSupabaseSong {
  id: string;
  user_id: string;
  title?: string;
  bpm?: number;
  key?: string;
  genres?: string[];
  created_at?: string;
}

export interface RawSupabaseSongArtist {
  song: RawSupabaseSong;
}

export interface RawSupabaseArtist {
  id: string;
  name: string;
  created_at?: string;
  user_id: string;
  song_artists?: RawSupabaseSongArtist[];
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
}
