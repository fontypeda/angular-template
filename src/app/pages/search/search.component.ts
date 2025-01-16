import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ChipModule } from 'primeng/chip';
import { SongStore, SongWithMetadata } from '../../stores/song.store';
import { GradientService } from '../../services/gradient.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PageHeaderComponent } from '../../layouts/components/page-header/page-header.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    InputNumberModule,
    DropdownModule,
    ChipModule,
    ToastModule,
    TagModule,
    ConfirmDialogModule,
    PageHeaderComponent
  ],
  providers: [MessageService, ConfirmationService]
})
export class SearchComponent implements OnInit {
  songs = this.songStore.songs$;
  playlists = this.songStore.playlists$;
  loading = this.songStore.loading$;
  error = this.songStore.error$;

  selectedSongs: SongWithMetadata[] = [];
  showMetadataDialog = false;
  showPlaylistDialog = false;
  showJsonDialog = false;
  selectedSongForMetadata: SongWithMetadata | null = null;
  selectedSongForPlaylist: SongWithMetadata | null = null;
  selectedSongForJson: SongWithMetadata | null = null;
  songJsonData: any = null;
  metadataForm: FormGroup = this.initForm();

  musicalKeys: string[] = [
    'C', 'Cm', 'C#', 'C#m', 'D', 'Dm', 'D#', 'D#m',
    'E', 'Em', 'F', 'Fm', 'F#', 'F#m', 'G', 'Gm',
    'G#', 'G#m', 'A', 'Am', 'A#', 'A#m', 'B', 'Bm'
  ];

  genres: string[] = [
    'Pop', 'Rock', 'Hip Hop', 'R&B', 'Jazz', 'Classical',
    'Electronic', 'Folk', 'Country', 'Blues', 'Metal',
    'Reggae', 'Latin', 'World', 'Alternative', 'Indie'
  ];

  moods: string[] = [
    'Happy', 'Sad', 'Energetic', 'Calm', 'Angry', 'Peaceful',
    'Dark', 'Light', 'Epic', 'Romantic', 'Mysterious', 'Playful'
  ];

  constructor(
    private songStore: SongStore,
    private formBuilder: FormBuilder,
    private gradientService: GradientService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  private initForm(): FormGroup {
    return this.formBuilder.group({
      bpm: [null],
      song_key: [''],
      genre: [''],
      mood: [''],
      tags: [[]],
      instruments: [[]]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    await this.songStore.loadSongs();
    await this.songStore.loadPlaylists();
  }

  onSelectionChange(songs: SongWithMetadata[]) {
    this.selectedSongs = songs;
  }

  onGlobalFilter(event: Event) {
    const input = event.target as HTMLInputElement;
    const dt = document.querySelector('p-table') as any;
    if (dt) {
      dt.filterGlobal(input.value, 'contains');
    }
  }

  async openMetadataDialog(song: SongWithMetadata) {
    // First get the full song data with all relations
    const fullSongData = await this.songStore.getSongById(song.id);
    if (!fullSongData) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load song data'
      });
      return;
    }

    this.selectedSongForMetadata = fullSongData;
    this.showMetadataDialog = true;

    // Parse arrays that are stored as strings in the database
    const metadata = fullSongData.metadata;
    if (metadata) {
      this.metadataForm.patchValue({
        bpm: metadata.bpm,
        song_key: this.parseArrayString(metadata.song_key)?.[0] || '',
        genre: this.parseArrayString(metadata.genre)?.[0] || '',
        mood: this.parseArrayString(metadata.mood || '')?.[0] || '',
        tags: metadata.tags || [],
        instruments: metadata.instruments || []
      });
    }
  }

  private parseArrayString(value: string | null | undefined): string[] | null {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  async saveMetadata() {
    if (!this.selectedSongForMetadata || !this.metadataForm.valid) return;

    const formValue = this.metadataForm.value;
    
    // Convert single values to array strings for the database
    const metadata = {
      song_id: this.selectedSongForMetadata.id,
      bpm: formValue.bpm,
      song_key: JSON.stringify([formValue.song_key]),
      genre: JSON.stringify([formValue.genre]),
      mood: formValue.mood ? JSON.stringify([formValue.mood]) : null,
      tags: formValue.tags,
      instruments: formValue.instruments
    };

    try {
      await this.songStore.updateSongMetadata(this.selectedSongForMetadata.id, metadata);
      
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Metadata updated successfully'
      });
      
      this.closeMetadataDialog();
    } catch (error) {
      console.error('Error saving metadata:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save metadata'
      });
    }
  }

  getTrackStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" {
    switch (status) {
      case 'draft':
        return 'warn';
      case 'pending_approval':
        return 'info';
      case 'released':
        return 'success';
      default:
        return 'secondary';
    }
  }

  openPlaylistDialog(song: SongWithMetadata) {
    this.selectedSongForPlaylist = song;
    this.showPlaylistDialog = true;
  }

  async openJsonViewer(song: SongWithMetadata) {
    this.selectedSongForJson = song;
    this.showJsonDialog = true;
    
    try {
      // Get the full song data with all relations
      const fullSongData = await this.songStore.getSongById(song.id);
      
      this.songJsonData = {
        song: fullSongData,
        created_at: new Date().toISOString(),
        loaded_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error loading song data:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load song data'
      });
    }
  }

  closeMetadataDialog() {
    this.showMetadataDialog = false;
    this.selectedSongForMetadata = null;
    this.metadataForm.reset();
  }

  closeJsonViewer() {
    this.showJsonDialog = false;
    this.selectedSongForJson = null;
    this.songJsonData = null;
  }

  closePlaylistDialog() {
    this.showPlaylistDialog = false;
    this.selectedSongForPlaylist = null;
  }

  getGradientStyle(index: number): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(
      this.gradientService.generateRandomPastelGradient()
    );
  }

  async togglePlaylist(playlistId: number) {
    const song = this.selectedSongForPlaylist;
    if (!song) return;

    const isCurrentlyInPlaylist = this.songStore.isInPlaylist(song.id, playlistId);
    await this.songStore.toggleSongInPlaylist(song.id, playlistId, !isCurrentlyInPlaylist);
  }

  isInPlaylist(songId: number, playlistId: number): boolean {
    return this.songStore.isInPlaylist(songId, playlistId);
  }

  addTag(field: 'tags' | 'instruments', value: string) {
    if (!value.trim()) return;
    
    const currentTags = this.metadataForm.get(field)?.value || [];
    if (!currentTags.includes(value)) {
      this.metadataForm.patchValue({
        [field]: [...currentTags, value.trim()]
      });
    }
  }

  removeTag(field: 'tags' | 'instruments', tag: string) {
    const currentTags = this.metadataForm.get(field)?.value || [];
    this.metadataForm.patchValue({
      [field]: currentTags.filter((t: string) => t !== tag)
    });
  }

  onDeleteSong(song: SongWithMetadata, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Are you sure you want to delete "${song.title}"? This action cannot be undone.`,
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.songStore.deleteSong(song.id).then(
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `Song "${song.title}" has been deleted`
            });
            this.showMetadataDialog = false;
          },
          (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: `Failed to delete song: ${error.message}`
            });
          }
        );
      }
    });
  }
}
