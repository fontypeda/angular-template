import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  trigger, 
  transition, 
  style, 
  animate, 
  query, 
  stagger
} from '@angular/animations';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { ApiService } from '../../services/api.service';
import { MessageService } from 'primeng/api';
import { debounceTime, Subject } from 'rxjs';
import { GradientService } from '../../services/gradient.service';
import { PageHeaderComponent } from '../../layouts/components/page-header/page-header.component';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
interface Playlist {
  id: number;           // In the new schema, likely a BIGSERIAL (number)
  name: string;
  background?: string;  // Optional column if you store a background image or gradient
  coverImage?: string;  // Optional cover image URL
  songCount: number;
  createdAt: string;
  updatedAt: string;
  randomBackground?: string;
}

interface Song {
  id: number;
  title: string;
  artist?: string;
  duration: number;
  coverUrl?: string;
  addedAt: string;
}

interface PlaylistShare {
  id: number;
  playlist_id: number;
  share_token: string;
  created_at: string;
}

interface PlaylistSongDetails {
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

interface PlaylistResponse {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_public?: boolean;
}

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DialogModule,
    TableModule,
    InputTextModule,
    TooltipModule,
    SkeletonModule,
    ToastModule,
    PageHeaderComponent,
    IconFieldModule,
    InputIconModule
  ],
  providers: [MessageService],
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.scss',
  animations: [
    trigger('staggerAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger('60ms', [
            animate('400ms ease-out', 
              style({ opacity: 1, transform: 'translateY(0)' })
            )
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class PlaylistsComponent implements OnInit {
  playlists: Playlist[] = [];
  filteredPlaylists: Playlist[] = [];
  playlistSongs: Song[] = [];
  loading = true;
  loadingSongs = false;

  // Dialog control
  showCreateDialog = false;
  showDetailsDialog = false;
  showShareDialog = false;

  selectedPlaylist: Playlist | null = null;
  searchQuery = '';
  shareUrl = '';  

  // New playlist form data
  newPlaylist = {
    name: '',
    background: ''
  };

  // Add new properties for skeleton loading
  skeletonItems = Array(8).fill(0); // For showing 8 skeleton cards
  showContent = false;

  private searchSubject = new Subject<string>();
 
  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    public gradientService: GradientService,
    private cdr: ChangeDetectorRef
  ) {
    // Debounce user input for searching
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.filterPlaylists();
    });
  }

  ngOnInit() {
    this.loadPlaylists();
  }



  onSearch() {
    this.searchSubject.next(this.searchQuery);
  }

  // Filter playlists by name
  async filterPlaylists() {
    if (!this.searchQuery.trim()) {
      this.filteredPlaylists = [...this.playlists];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredPlaylists = this.playlists.filter(playlist =>
        playlist.name.toLowerCase().includes(query)
      );
    }
  }

  /****************************************
   * LOAD PLAYLISTS
   ****************************************/
  private async loadPlaylists() {
    this.loading = true;

    try {
      const data = await this.apiService.getPlaylists();
      
      this.playlists = await Promise.all(data.map(async (p: any) => {
        // Get songs for this playlist to count them
        const songs = await this.apiService.getSongsInPlaylist(p.id);
        
        return {
          id: p.id,
          name: p.name,
          coverImage: p.coverImage,
          randomBackground: this.getRandomBackgroundImage(),
          songCount: songs.length,
          createdAt: p.created_at,
          updatedAt: p.updated_at || p.created_at
        };
      }));

      this.filteredPlaylists = [...this.playlists];
      this.loading = false;
    } catch (error) {
      console.error('Error loading playlists:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load playlists'
      });
      this.loading = false;
    }
  }

  /****************************************
   * CREATE A PLAYLIST
   ****************************************/
  async createPlaylist() {
    if (!this.newPlaylist.name) return;

    try {
      const background = this.gradientService.generateRandomPastelGradient();

      const created = await this.apiService.createPlaylist({
        name: this.newPlaylist.name,
        is_public: false,
      }) as PlaylistResponse;

      this.playlists = [
        ...this.playlists,
        {
          id: created.id,
          name: created.name,
          background: background,
          coverImage: '',
          songCount: 0,
          createdAt: created.created_at,
          updatedAt: created.updated_at || created.created_at
        }
      ];

      this.filteredPlaylists = this.playlists;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Playlist created successfully'
      });

      // Reset dialog
      this.showCreateDialog = false;
      this.newPlaylist = { name: '', background: '' };
    } catch (error) {
      console.error('Error creating playlist:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create playlist'
      });
    }
  }

  /****************************************
   * VIEW / EDIT PLAYLIST DETAILS
   ****************************************/
  async onPlaylistClick(playlist: Playlist) {
    this.selectedPlaylist = playlist;
    this.showDetailsDialog = true;
    await this.loadPlaylistSongs(playlist.id);
  }

  onMoreOptions(playlist: Playlist) {
    // Same as clicking, but you might show more actions
    this.selectedPlaylist = playlist;
    this.showDetailsDialog = true;
    this.loadPlaylistSongs(playlist.id);
  }

  private async loadPlaylistSongs(playlistId: number) {
    this.loadingSongs = true;
    try {
      const data = await this.apiService.getSongsInPlaylist(playlistId);
      this.playlistSongs = data.map((item: PlaylistSongDetails) => {
        const s = item.songs;
        return {
          id: item.id,
          title: s.title,
          artist: s.contacts?.[0]?.contact?.[0]?.name || 'Unknown Artist',
          duration: s.length_seconds || 0,
          coverUrl: s.cover_image_url || '',
          addedAt: new Date().toISOString()
        };
      });
    } catch (error) {
      console.error('Error loading playlist songs:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load playlist songs'
      });
    } finally {
      this.loadingSongs = false;
    }
  }

  /****************************************
   * SHARE PLAYLIST
   ****************************************/
  async sharePlaylist() {
    if (!this.selectedPlaylist) return;

    try {
      const shareData = await this.apiService.createPlaylistShare(
        this.selectedPlaylist.id,
        'read-only'
      );
      
      // Set share URL and show dialog
      const shareLink = `${window.location.origin}/shared-playlist/${shareData.share_token}`;
      this.shareUrl = shareLink;
      this.showShareDialog = true;
    } catch (error) {
      console.error('Error sharing playlist:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to create share link'
      });
    }
  }

  async copyShareLink() {
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Share link copied to clipboard'
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to copy share link'
      });
    }
  }

  /****************************************
   * DELETE PLAYLIST
   ****************************************/
  async deletePlaylist() {
    if (!this.selectedPlaylist) return;

    try {
      await this.apiService.deletePlaylist(this.selectedPlaylist.id);

      // Remove from local array
      this.playlists = this.playlists.filter(p => p.id !== this.selectedPlaylist?.id);
      this.filteredPlaylists = this.playlists;

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Playlist deleted successfully'
      });

      // Close the dialog
      this.showDetailsDialog = false;
    } catch (error) {
      console.error('Error deleting playlist:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete playlist'
      });
    }
  }

  /****************************************
   * REMOVE SONG FROM PLAYLIST
   ****************************************/
  async removeSongFromPlaylist(song: { id: number; playlist_id: number }) {
    if (!this.selectedPlaylist) return;

    try {
      await this.apiService.removeSongFromPlaylist(song.id, this.selectedPlaylist.id);
      await this.loadPlaylistSongs(this.selectedPlaylist.id);
    } catch (error) {
      console.error('Error removing song from playlist:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to remove song from playlist'
      });
    }
  }

  private updatePlaylistSongCount(playlistId: number) {
    const playlist = this.playlists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.songCount = this.playlistSongs.length;
      // Also update in filtered playlists
      const filteredPlaylist = this.filteredPlaylists.find(p => p.id === playlistId);
      if (filteredPlaylist) {
        filteredPlaylist.songCount = this.playlistSongs.length;
      }
    }
  }

  

  /****************************************
   * HELPER: Get total duration
   ****************************************/
  getTotalDuration(): string {
    const totalSeconds = this.playlistSongs.reduce(
      (acc, song) => acc + (song.duration || 0),
      0
    );
    return this.formatDuration(totalSeconds);
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '0:00';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${this.padZero(minutes)}:${this.padZero(remainingSeconds)}`;
    }
    return `${minutes}:${this.padZero(remainingSeconds)}`;
  }

  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }

  getRandomBackgroundImage(): string {
    const totalImages = 17;
    const randomNum = Math.floor(Math.random() * totalImages) + 1;
    const imagePath = `/assets/images/Random/Random${randomNum}.jpg`;
    console.log('Random image path:', imagePath); // Debug log
    return imagePath;
    
  }
}