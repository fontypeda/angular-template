import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SongMetadataDialogComponent } from '../../components/song-metadata-dialog/song-metadata-dialog.component';
import { SongStore, SongWithMetadata } from '../../stores/song.store';
import { Table } from 'primeng/table';
import { PageHeaderComponent } from '../../layouts/components/page-header/page-header.component';
import { ToastModule } from 'primeng/toast';
import { PlaylistService } from '../../services/playlist.service';
import { signal, computed } from '@angular/core';  
import { Playlist } from '../../interfaces/playlist.interface';  
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    RippleModule,
    TagModule,
    DialogModule,
    InputTextModule,
    DropdownModule,
    TooltipModule,
    ConfirmDialogModule,
    SongMetadataDialogComponent,
    PageHeaderComponent,
    ToastModule,
    IconFieldModule,
    InputIconModule
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class SearchComponent implements OnInit {
  songs = this.songStore.songs$;
  loading = this.songStore.loading$;
  error = this.songStore.error$;

  selectedSongs: SongWithMetadata[] = [];
  searchValue: string = '';

  // Metadata dialog
  showMetadataDialog = false;
  selectedSongForMetadata: SongWithMetadata | null = null;

  // JSON viewer dialog
  showJsonDialog = false;
  songJsonData: any = null;
  selectedSongForJson: SongWithMetadata | null = null;

  // Playlist dialog
  showPlaylistDialog = false;
  selectedSongForPlaylists: SongWithMetadata | null = null;
  selectedSongForPlaylist: SongWithMetadata | null = null;

  private _playlists = signal<Playlist[]>([]);
  playlists = computed(() => this._playlists());



  @ViewChild('dt') dt!: Table;

  constructor(
    private songStore: SongStore,
    private playlistService: PlaylistService  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    await this.songStore.loadSongs();
  }

  onSelectionChange(songs: SongWithMetadata[]) {
    this.selectedSongs = songs;
  }

  onGlobalFilter(event: Event) {
    if (this.dt) {
      this.dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
  }

  async openMetadataDialog(song: SongWithMetadata) {
    this.selectedSongForMetadata = song;
    this.showMetadataDialog = true;
  }

  onMetadataSaved() {
    this.songStore.loadSongs();
  }

  async openJsonViewer(song: SongWithMetadata) {
    this.selectedSongForJson = song;
    this.showJsonDialog = true;
    
    // Get full song data with all relations
    const fullSongData = await this.songStore.getSongById(song.id);
    this.songJsonData = fullSongData;
  }

  closeJsonViewer() {
    this.showJsonDialog = false;
    this.selectedSongForJson = null;
    this.songJsonData = null;
  }

  async openPlaylistDialog(song: SongWithMetadata) {
    this.selectedSongForPlaylist = song;
    this.showPlaylistDialog = true;
  }

  closePlaylistDialog() {
    this.showPlaylistDialog = false;
    this.selectedSongForPlaylists = null;
  }

  isInPlaylist(songId: number, playlistId: number): boolean {
    // Implement the logic to check if a song is in a playlist
    return this.playlistService.isSongInPlaylist(songId, playlistId);
  }

  async togglePlaylist(playlistId: number) {
    if (!this.selectedSongForPlaylist) return;
    
    const songId = this.selectedSongForPlaylist.id;
    if (this.isInPlaylist(songId, playlistId)) {
      await this.playlistService.removeSongFromPlaylist(songId, playlistId);
    } else {
      await this.playlistService.addSongToPlaylist(songId, playlistId);
    }
  }

  getRandomBackgroundImage(): string {
    const totalImages = 17;
    const randomNum = Math.floor(Math.random() * totalImages) + 1;
    const imagePath = `/assets/images/Random/Random${randomNum}.jpg`;
    return imagePath;
  }
}
