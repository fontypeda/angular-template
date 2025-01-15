import { Injectable, computed, signal } from '@angular/core';
import { ApiService, Song, Playlist, CreateSongMetadata, SongMetadata } from '../services/api.service';

export interface SongWithMetadata extends Song {
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

@Injectable({
  providedIn: 'root'
})
export class SongStore {
  private songsSignal = signal<SongWithMetadata[]>([]);
  private playlistsSignal = signal<Playlist[]>([]);
  private loadingSignal = signal<boolean>(false);
  private errorSignal = signal<string | null>(null);
  private selectedSongSignal = signal<SongWithMetadata | null>(null);
  private playlistSongsSignal = signal<Map<number, Set<number>>>(new Map());

  songs$ = computed(() => this.songsSignal());
  playlists$ = computed(() => this.playlistsSignal());
  loading$ = computed(() => this.loadingSignal());
  error$ = computed(() => this.errorSignal());
  selectedSong$ = computed(() => this.selectedSongSignal());

  constructor(private apiService: ApiService) {
    this.loadInitialData();
  }

  private async loadInitialData() {
    await this.loadSongs();
    await this.loadPlaylists();
  }

  async loadSongs() {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);
      const songs = await this.apiService.getSongs();
      this.songsSignal.set(songs as SongWithMetadata[]);
    } catch (err) {
      this.errorSignal.set('Failed to load songs');
      console.error('Error loading songs:', err);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadPlaylists() {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);
      const playlists = await this.apiService.getPlaylists();
      this.playlistsSignal.set(playlists);
      
      // Load songs for each playlist
      const playlistSongMap = new Map<number, Set<number>>();
      await Promise.all(
        playlists.map(async playlist => {
          const songs = await this.apiService.getSongsInPlaylist(playlist.id);
          playlistSongMap.set(
            playlist.id,
            new Set(songs.map(ps => ps.songs.id))
          );
        })
      );
      this.playlistSongsSignal.set(playlistSongMap);
    } catch (err) {
      this.errorSignal.set('Failed to load playlists');
      console.error('Error loading playlists:', err);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async getSongById(id: number): Promise<SongWithMetadata | null> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);
      const song = await this.apiService.getSongById(id);
      if (!song) return null;
      return song as SongWithMetadata;
    } catch (err) {
      this.errorSignal.set('Failed to load song');
      console.error('Error loading song:', err);
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  setSelectedSong(song: SongWithMetadata | null) {
    this.selectedSongSignal.set(song);
  }

  async updateSongMetadata(songId: number, metadata: {
    song_id: number;
    bpm: number;
    song_key: string;
    genre: string;
    mood: string | null;
    tags: string[];
    instruments: string[];
  }): Promise<boolean> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);
      
      const metadataToUpdate: CreateSongMetadata = {
        song_id: songId,
        bpm: metadata.bpm,
        song_key: metadata.song_key,
        genre: metadata.genre,
        mood: metadata.mood,
        tags: metadata.tags,
        instruments: metadata.instruments
      };

      const result = await this.apiService.createSongMetadata(metadataToUpdate);
      if (result) {
        await this.loadSongs(); // Refresh the songs list
        return true;
      }
      return false;
    } catch (err) {
      this.errorSignal.set('Failed to update song metadata');
      console.error('Error updating song metadata:', err);
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async toggleSongInPlaylist(songId: number, playlistId: number, add: boolean): Promise<boolean> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      if (add) {
        await this.apiService.addSongToPlaylist(songId, playlistId);
      } else {
        await this.apiService.removeSongFromPlaylist(songId, playlistId);
      }

      await this.loadSongs(); // Refresh songs to get updated playlist connections
      return true;
    } catch (err) {
      this.errorSignal.set('Failed to update playlist');
      console.error('Error updating playlist:', err);
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  isInPlaylist(songId: number, playlistId: number): boolean {
    return this.playlistSongsSignal().get(playlistId)?.has(songId) || false;
  }

  async updatePlaylistAssignments(songId: number, playlistIds: number[]) {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);

      // Get current playlist assignments
      const currentPlaylists = Array.from(this.playlistSongsSignal().entries())
        .filter(([_, songIds]) => songIds.has(songId))
        .map(([playlistId]) => playlistId);

      // Calculate changes
      const toAdd = playlistIds.filter(id => !currentPlaylists.includes(id));
      const toRemove = currentPlaylists.filter(id => !playlistIds.includes(id));

      // Apply changes
      await Promise.all([
        ...toAdd.map(playlistId => this.toggleSongInPlaylist(songId, playlistId, true)),
        ...toRemove.map(playlistId => this.toggleSongInPlaylist(songId, playlistId, false))
      ]);

      return true;
    } catch (err) {
      this.errorSignal.set('Failed to update playlist assignments');
      console.error('Error updating playlist assignments:', err);
      return false;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadSongMetadata(songId: number): Promise<SongMetadata | null> {
    try {
      this.loadingSignal.set(true);
      this.errorSignal.set(null);
      
      const metadata = await this.apiService.getSongMetadata(songId);
      return metadata;
    } catch (err) {
      this.errorSignal.set('Failed to load song metadata');
      console.error('Error loading song metadata:', err);
      return null;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadSongPlaylists(songId: number): Promise<any[]> {
    try {
      const playlists = await this.apiService.getSongPlaylists(songId);
      return playlists || [];
    } catch (err) {
      console.error('Error loading song playlists:', err);
      return [];
    }
  }

  getSongsForPlaylist(playlistId: number) {
    return computed(() => {
      const songIds = this.playlistSongsSignal().get(playlistId) || new Set();
      return this.songsSignal().filter(song => songIds.has(song.id));
    });
  }

  async deleteSong(songId: number): Promise<void> {
    this.loadingSignal.set(true);
    try {
      await this.apiService.deleteSong(songId);
      // Update the songs list after successful deletion
      this.songsSignal.set(this.songsSignal().filter(song => song.id !== songId));
    } catch (error) {
      this.errorSignal.set(error instanceof Error ? error.message : 'An unknown error occurred');
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }
}
