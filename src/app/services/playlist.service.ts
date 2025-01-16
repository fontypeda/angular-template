import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Playlist } from '../interfaces/playlist.interface';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private playlists: Map<number, Playlist> = new Map();

  constructor(
    private apiService: ApiService,
    private messageService: MessageService
  ) {
    this.loadPlaylists();
  }

  async loadPlaylists() {
    try {
      const apiPlaylists = await this.apiService.getPlaylists();
      this.playlists.clear();
      
      // Convert API playlists to our interface format
      const convertedPlaylists = await Promise.all(apiPlaylists.map(async (playlist) => {
        const songs = await this.apiService.getSongsInPlaylist(playlist.id);
        return {
          id: playlist.id,
          name: playlist.name,
          description: '',
          songIds: songs.map(s => s.id)
        };
      }));
      
      convertedPlaylists.forEach(playlist => this.playlists.set(playlist.id, playlist));
    } catch (error) {
      console.error('Error loading playlists:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load playlists'
      });
    }
  }

  isSongInPlaylist(songId: number, playlistId: number): boolean {
    const playlist = this.playlists.get(playlistId);
    return playlist ? playlist.songIds.includes(songId) : false;
  }

  async addSongToPlaylist(songId: number, playlistId: number) {
    try {
      await this.apiService.addSongToPlaylist(songId, playlistId);
      await this.loadPlaylists(); // Refresh playlists
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Song added to playlist'
      });
    } catch (error) {
      console.error('Error adding song to playlist:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to add song to playlist'
      });
    }
  }

  async removeSongFromPlaylist(songId: number, playlistId: number) {
    try {
      await this.apiService.removeSongFromPlaylist(songId, playlistId);
      await this.loadPlaylists(); // Refresh playlists
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Song removed from playlist'
      });
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to remove song from playlist'
      });
    }
  }
}
