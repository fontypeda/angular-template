import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { AuthService } from './auth.service';

export interface Song {
  id: number;
  title: string;
  track_status: 'draft' | 'pending_approval' | 'released';
  is_released: boolean;
  length_seconds?: number;
  audio_file_url?: string;
  cover_image_url?: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
  metadata?: SongMetadata;
  song_contacts?: Array<{
    id: number;
    song_id: number;
    contact_id: number;
    role_in_song: string;
    split_percentage?: number;
    contact?: {
      id: number;
      name: string;
      email: string;
      phone: string;
    } | null;
  }>;
  playlists?: Array<{
    id: number;
    playlist_id: number;
    song_id: number;
    order_index: number;
    playlist: {
      id: number;
      name: string;
      owner_id: string;
      is_public: boolean;
      created_at?: string;
      updated_at?: string;
    };
  }>;
}

export interface SongMetadata {
  id?: number;  // Optional for creation
  song_id: number;
  bpm: number;
  song_key: string;
  genre: string;
  mood: string | null;
  tags: string[];
  instruments: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateSongMetadata {
  song_id: number;
  bpm: number;
  song_key: string;
  genre: string;
  mood: string | null;
  tags: string[];
  instruments: string[];
}

export interface SongContact {
  id: number;
  song_id: number;
  contact_id: number;
  role_in_song: string;
  split_percentage?: number;
  created_at?: string;
}

export interface Contact {
  id: number;
  owner_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Playlist {
  id: number;
  name: string;
  owner_id: string;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PlaylistSong {
  id: number;
  playlist_id: number;
  song_id: number;
  order_index: number;
  created_at?: string;
}

interface SupabaseSongResponse {
  id: number;
  order_index: number;
  songs: {
    id: number;
    title: string;
    track_status: string;
    is_released: boolean;
    audio_file_url?: string;
    metadata: {
      bpm: number;
      song_key: string;
      genre: string;
    }[];
    contacts: {
      role_in_song: string;
      contact: {
        name: string;
      }[];
    }[];
  }[];
}

export interface PlaylistSongWithDetails {
  id: number;
  order_index: number;
  songs: {
    id: number;
    title: string;
    track_status: string;
    is_released: boolean;
    audio_file_url?: string;
    length_seconds?: number;
    cover_image_url?: string;
    metadata: Array<{
      bpm: number;
      song_key: string;
      genre: string;
    }>;
    contacts: Array<{
      role_in_song: string;
      contact: Array<{
        name: string;
      }>;
    }>;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    this.supabase = this.authService.getSupabaseClient();
  }

  private getCurrentUser() {
    return this.authService.getCurrentUserValue();
  }

  /***********************************************
   * SONGS
   ***********************************************/

  async getSongs(): Promise<Song[]> {
    const { data, error } = await this.supabase
      .from('songs')
      .select(`
        *,
        metadata:song_metadata(*),
        song_contacts:song_contact(
          role_in_song,
          contact:contacts(
            id,
            name,
            email,
            phone
          )
        ),
        playlists:playlist_songs(
          id,
          playlist_id,
          song_id,
          order_index,
          playlist:playlists(
            id,
            name,
            owner_id,
            is_public,
            created_at,
            updated_at
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSongById(id: number): Promise<Song | null> {
    const { data, error } = await this.supabase
      .from('songs')
      .select(`
        *,
        metadata:song_metadata(*),
        song_contacts:song_contact(
          role_in_song,
          contact:contacts(
            id,
            name,
            email,
            phone
          )
        ),
        playlists:playlist_songs(
          id,
          playlist_id,
          song_id,
          order_index,
          playlist:playlists(
            id,
            name,
            owner_id,
            is_public,
            created_at,
            updated_at
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching song:', error);
      return null;
    }

    return data;
  }

  async createSong(songData: {
    title: string;
    track_status: 'draft' | 'pending_approval' | 'released';
    is_released?: boolean;
    length_seconds?: number;
    audio_file_url?: string;
    cover_image_url?: string;
  }): Promise<Song> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user signed in');

    const { data, error } = await this.supabase
      .from('songs')
      .insert([
        {
          ...songData,
          owner_id: user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createSongMetadata(metadata: CreateSongMetadata): Promise<SongMetadata> {
    const { data, error } = await this.supabase
      .from('song_metadata')
      .upsert({
        song_id: metadata.song_id,
        bpm: metadata.bpm,
        song_key: metadata.song_key,
        genre: metadata.genre,
        mood: metadata.mood,
        tags: metadata.tags || [],
        instruments: metadata.instruments || []
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createSongContact(contactData: {
    song_id: number;
    contact_id: number;
    role_in_song: string;
    split_percentage?: number;
  }): Promise<SongContact> {
    const { data, error } = await this.supabase
      .from('song_contact')
      .insert([contactData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Update a song
  async updateSong(
    songId: number,
    updates: Partial<Song>
  ): Promise<Song> {
    const { data, error } = await this.supabase
      .from('songs')
      .update(updates)
      .eq('id', songId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSongMetadata(songId: number): Promise<SongMetadata | null> {
    try {
      const { data, error } = await this.supabase
        .from('song_metadata')
        .select('*')
        .eq('song_id', songId)
        .single();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching song metadata:', error);
      return null;
    }
  }

  async getSongPlaylists(songId: number): Promise<any[]> {
    try {
      // First get all playlist IDs for this song
      const { data: playlistSongs, error: playlistSongsError } = await this.supabase
        .from('playlist_songs')
        .select('playlist_id')
        .eq('song_id', songId);

      if (playlistSongsError) throw playlistSongsError;
      
      if (!playlistSongs || playlistSongs.length === 0) {
        return [];
      }

      // Then get the actual playlist data for these IDs
      const playlistIds = playlistSongs.map(ps => ps.playlist_id);
      const { data: playlists, error: playlistsError } = await this.supabase
        .from('playlists')
        .select(`
          id,
          name,
          description,
          created_at,
          updated_at,
          song_count
        `)
        .in('id', playlistIds);

      if (playlistsError) throw playlistsError;
      return playlists || [];
    } catch (error) {
      console.error('Error fetching song playlists:', error);
      return [];
    }
  }

  async getSongsInPlaylist(playlistId: number): Promise<PlaylistSongWithDetails[]> {
    interface Song {
      id: number;
      title: string;
      track_status: string;
      is_released: boolean;
      audio_file_url?: string;
      length_seconds?: number;
      cover_image_url?: string;
      metadata: Array<{
        bpm: number;
        song_key: string;
        genre: string;
      }>;
      song_contacts: Array<{
        role_in_song: string;
        contact: {
          name: string;
        } | null;
      }>;
    }

    interface PlaylistSongResponse {
      id: number;
      order_index: number;
      song: Song;
    }

    const { data, error } = await this.supabase
      .from('playlist_songs')
      .select(`
        id,
        order_index,
        song:song_id (
          id,
          title,
          track_status,
          is_released,
          audio_file_url,
          length_seconds,
          cover_image_url,
          metadata:song_metadata (
            bpm,
            song_key,
            genre
          ),
          song_contacts:song_contact (
            role_in_song,
            contact:contacts (
              name
            )
          )
        )
      `)
      .eq('playlist_id', playlistId)
      .order('order_index', { ascending: true }) as { 
        data: PlaylistSongResponse[] | null; 
        error: any 
      };

    if (error) {
      console.error('Error fetching playlist songs:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data.map(item => ({
      id: item.id,
      order_index: item.order_index,
      songs: {
        id: item.song.id,
        title: item.song.title,
        track_status: item.song.track_status,
        is_released: item.song.is_released,
        audio_file_url: item.song.audio_file_url,
        length_seconds: item.song.length_seconds,
        cover_image_url: item.song.cover_image_url,
        metadata: item.song.metadata || [],
        contacts: (item.song.song_contacts || []).map((contact) => ({
          role_in_song: contact.role_in_song,
          contact: [{ name: contact.contact?.name || '' }]
        }))
      }
    }));
  }

  async getSongInPlaylist(playlistId: number, songId: number): Promise<PlaylistSongWithDetails> {
    interface SongContact {
      role_in_song: string;
      contact: {
        name: string;
      } | null;
    }

    interface SongMetadata {
      bpm: number;
      song_key: string;
      genre: string;
    }

    interface Song {
      id: number;
      title: string;
      track_status: string;
      is_released: boolean;
      audio_file_url: string | null;
      metadata: SongMetadata[];
      song_contacts: SongContact[];
    }

    interface PlaylistSongResponse {
      id: number;
      order_index: number;
      song: Song;
    }

    // First get all matching playlist songs
    const { data: playlistSongs, error: playlistError } = await this.supabase
      .from('playlist_songs')
      .select(`
        id,
        order_index,
        song:song_id (
          id,
          title,
          track_status,
          is_released,
          audio_file_url,
          metadata:song_metadata (
            bpm,
            song_key,
            genre
          ),
          song_contacts:song_contact (
            role_in_song,
            contact:contacts (
              name
            )
          )
        )
      `)
      .eq('playlist_id', playlistId)
      .eq('song_id', songId)
      .order('created_at')
      .limit(1) as { data: PlaylistSongResponse[] | null; error: any };

    if (playlistError) {
      console.error('Error fetching playlist song:', playlistError);
      throw playlistError;
    }

    if (!playlistSongs || playlistSongs.length === 0 || !playlistSongs[0].song) {
      throw new Error('Song not found in playlist');
    }

    const playlistSong = playlistSongs[0];
    const { song } = playlistSong;

    return {
      id: playlistSong.id,
      order_index: playlistSong.order_index,
      songs: {
        id: song.id,
        title: song.title,
        track_status: song.track_status,
        is_released: song.is_released,
        audio_file_url: song.audio_file_url || undefined,
        metadata: song.metadata || [],
        contacts: (song.song_contacts || []).map((contact: SongContact) => ({
          role_in_song: contact.role_in_song,
          contact: [{ name: contact.contact?.name || '' }]
        }))
      }
    };
  }

  async addSongToPlaylist(songId: number, playlistId: number): Promise<void> {
    const { error } = await this.supabase
      .from('playlist_songs')
      .insert({
        song_id: songId,
        playlist_id: playlistId,
        order_index: 0  // You might want to calculate this based on existing songs
      });

    if (error) throw error;
  }

  async removeSongFromPlaylist(playlistSongId: number): Promise<void>;
  async removeSongFromPlaylist(songId: number, playlistId: number): Promise<void>;
  async removeSongFromPlaylist(idOrSongId: number, playlistId?: number): Promise<void> {
    if (playlistId !== undefined) {
      // Remove by song_id and playlist_id
      const { error } = await this.supabase
        .from('playlist_songs')
        .delete()
        .eq('song_id', idOrSongId)
        .eq('playlist_id', playlistId);

      if (error) throw error;
    } else {
      // Remove by playlist_song id
      const { error } = await this.supabase
        .from('playlist_songs')
        .delete()
        .eq('id', idOrSongId);

      if (error) throw error;
    }
  }

  async getPlaylistSongId(songId: number, playlistId: number): Promise<number | null> {
    const { data, error } = await this.supabase
      .from('playlist_songs')
      .select('id')
      .eq('song_id', songId)
      .eq('playlist_id', playlistId)
      .single();

    if (error) {
      console.error('Error getting playlist song ID:', error);
      return null;
    }

    return data?.id || null;
  }

  async createPlaylistShare(
    playlistId: number,
    permissionLevel: 'read-only' | 'edit' = 'read-only',
    shareExpiration?: string
  ): Promise<{
    id: number;
    playlist_id: number;
    share_token: string;
    share_expiration?: string;
    permission_level: string;
    created_at: string;
  }> {
    const { data, error } = await this.supabase
      .from('playlist_shares')
      .insert([
        {
          playlist_id: playlistId,
          permission_level: permissionLevel,
          share_expiration: shareExpiration,
          share_token: crypto.randomUUID(),
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSong(songId: number): Promise<void> {
    const song = await this.getSongById(songId);
    if (!song) {
      throw new Error('Song not found');
    }

    // Delete files from storage if they exist
    if (song.audio_file_url) {
      const audioPath = song.audio_file_url.split('/').pop();
      if (audioPath) {
        await this.supabase.storage.from('songs').remove([audioPath]);
      }
    }

    if (song.cover_image_url) {
      const coverPath = song.cover_image_url.split('/').pop();
      if (coverPath) {
        await this.supabase.storage.from('covers').remove([coverPath]);
      }
    }

    // Delete song from database (this will cascade delete metadata and other relations)
    const { error } = await this.supabase
      .from('songs')
      .delete()
      .eq('id', songId);

    if (error) {
      throw error;
    }
  }

  /***********************************************
   * PLAYLISTS
   ***********************************************/

  async getPlaylists(): Promise<Playlist[]> {
    const { data, error } = await this.supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createPlaylist(playlistData: { 
    name: string; 
    is_public?: boolean 
  }): Promise<Playlist> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user signed in');

    const { data, error } = await this.supabase
      .from('playlists')
      .insert([{
        ...playlistData,
        owner_id: user.id,
        is_public: playlistData.is_public ?? false
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePlaylist(playlistId: number): Promise<void> {
    const { error } = await this.supabase
      .from('playlists')
      .delete()
      .eq('id', playlistId);

    if (error) throw error;
  }

  /***********************************************
   * CONTACTS
   ***********************************************/

  async getContacts() {
    const { data, error } = await this.supabase
      .from('contacts')
      .select(`
        *,
        song_contact:song_contact(
          id,
          role_in_song,
          split_percentage,
          song:songs(
            id,
            title,
            track_status,
            is_released
          )
        )
      `)
      .order('name');

    if (error) throw error;
    return data;
  }

  async getContactSongs(contactId: number) {
    const { data, error } = await this.supabase
      .from('song_contact')
      .select(`
        id,
        role_in_song,
        split_percentage,
        song:songs(
          id,
          title,
          track_status,
          is_released,
          cover_image_url
        )
      `)
      .eq('contact_id', contactId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async createContact(contactData: {
    name: string;
    email?: string | null;
    phone?: string | null;
  }): Promise<Contact> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user signed in');

    const { data, error } = await this.supabase
      .from('contacts')
      .insert([
        {
          ...contactData,
          owner_id: user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateContact(
    contactId: number,
    updates: Partial<Contact>
  ): Promise<Contact> {
    const { data, error } = await this.supabase
      .from('contacts')
      .update(updates)
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /***********************************************
   * FILE UPLOADS
   ***********************************************/

  private async uploadFile(file: File, bucket: string): Promise<string> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user signed in');

    // Create a unique file path: userId/timestamp_filename
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${timestamp}_${file.name}`;

    const { data, error } = await this.supabase
      .storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get the public URL
    const { data: { publicUrl } } = this.supabase
      .storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  }

  async uploadSongFile(file: File): Promise<string> {
    return this.uploadFile(file, 'songs');
  }

  async uploadCoverImage(file: File): Promise<string> {
    return this.uploadFile(file, 'covers');
  }
}