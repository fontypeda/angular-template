import { DbSong } from '../interfaces/domain.interface';
import { RawSupabaseSong } from '../interfaces/supabase.interface';

export class SongTransformer {
  static createEmptyDbSong(): DbSong {
    return {
      id: '',
      title: '',
      bpm: undefined,
      key: '',
      genres: [],
      created_at: new Date().toISOString(),
      user_id: '',
      moods: [],
      tags: [],
      public: true,
      writers: [],
      song_artists: [],
      playlist_songs: [],
      file_url: '',
      types: ''
    };
  }

  static transformSupabaseSong(rawSong: RawSupabaseSong, userId: string): DbSong | null {
    if (!rawSong || rawSong.user_id !== userId) return null;

    return {
      ...this.createEmptyDbSong(),
      id: rawSong.id,
      title: rawSong.title || '',
      bpm: rawSong.bpm,
      key: rawSong.key || '',
      genres: rawSong.genres || [],
      created_at: rawSong.created_at || new Date().toISOString(),
      user_id: rawSong.user_id
    };
  }
}
