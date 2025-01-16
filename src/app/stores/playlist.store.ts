import { Injectable, computed, signal } from '@angular/core';
import { ApiService, Playlist, PlaylistSongWithDetails } from '../services/api.service';

@Injectable({
  providedIn: 'root'
})
export class PlaylistStore {
  private playlists = signal<Playlist[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private selectedPlaylist = signal<Playlist | null>(null);
  private playlistSongs = signal<Map<number, PlaylistSongWithDetails[]>>(new Map());

  // Computed signals
  readonly playlists$ = computed(() => this.playlists());
  readonly loading$ = computed(() => this.loading());
  readonly error$ = computed(() => this.error());
  readonly selectedPlaylist$ = computed(() => this.selectedPlaylist());
  
  // Get songs for a specific playlist
  readonly getPlaylistSongs = (playlistId: number) => 
    computed(() => this.playlistSongs().get(playlistId) || []);

  constructor(private apiService: ApiService) {}

  async loadPlaylists() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const playlists = await this.apiService.getPlaylists();
      this.playlists.set(playlists);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load playlists');
    } finally {
      this.loading.set(false);
    }
  }

  async createPlaylist(name: string, isPublic: boolean = false) {
    try {
      this.loading.set(true);
      this.error.set(null);
      const playlist = await this.apiService.createPlaylist({ name, is_public: isPublic });
      this.playlists.update(playlists => [...playlists, playlist]);
      return playlist;
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to create playlist');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async deletePlaylist(playlistId: number) {
    try {
      this.loading.set(true);
      this.error.set(null);
      await this.apiService.deletePlaylist(playlistId);
      this.playlists.update(playlists => 
        playlists.filter(playlist => playlist.id !== playlistId)
      );
      // Clear songs for this playlist
      const updatedPlaylistSongs = new Map(this.playlistSongs());
      updatedPlaylistSongs.delete(playlistId);
      this.playlistSongs.set(updatedPlaylistSongs);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to delete playlist');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async loadPlaylistSongs(playlistId: number) {
    try {
      this.loading.set(true);
      this.error.set(null);
      const songs = await this.apiService.getSongsInPlaylist(playlistId);
      const updatedPlaylistSongs = new Map(this.playlistSongs());
      updatedPlaylistSongs.set(playlistId, songs);
      this.playlistSongs.set(updatedPlaylistSongs);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to load playlist songs');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async addSongToPlaylist(songId: number, playlistId: number) {
    try {
      this.loading.set(true);
      this.error.set(null);
      await this.apiService.addSongToPlaylist(songId, playlistId);
      // Reload playlist songs to get updated order
      await this.loadPlaylistSongs(playlistId);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to add song to playlist');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async removeSongFromPlaylist(songId: number, playlistId: number) {
    try {
      this.loading.set(true);
      this.error.set(null);
      await this.apiService.removeSongFromPlaylist(songId, playlistId);
      // Update local state
      const updatedPlaylistSongs = new Map(this.playlistSongs());
      const currentSongs = updatedPlaylistSongs.get(playlistId) || [];
      updatedPlaylistSongs.set(
        playlistId,
        currentSongs.filter(song => song.songs.id !== songId)
      );
      this.playlistSongs.set(updatedPlaylistSongs);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Failed to remove song from playlist');
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  setSelectedPlaylist(playlist: Playlist | null) {
    this.selectedPlaylist.set(playlist);
  }
}
