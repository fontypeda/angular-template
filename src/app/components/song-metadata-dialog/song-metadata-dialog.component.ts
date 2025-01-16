import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ChipModule } from 'primeng/chip';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ApiService, SongMetadata, Contact } from '../../services/api.service';
import { SongWithMetadata } from '../../stores/song.store';
import { BehaviorSubject, map } from 'rxjs';

@Component({
  selector: 'app-song-metadata-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    InputNumberModule,
    InputTextModule,
    DropdownModule,
    ChipModule,
    ButtonModule,
    TagModule,
    MultiSelectModule,
    CheckboxModule
  ],
  templateUrl: './song-metadata-dialog.component.html',
  styleUrls: ['./song-metadata-dialog.component.scss']
})
export class SongMetadataDialogComponent implements OnInit {
  @Input() visible = false;
  @Input() song: SongWithMetadata | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  metadataForm: FormGroup;
  contacts$ = new BehaviorSubject<Contact[]>([]);
  loading = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private messageService: MessageService
  ) {
    this.metadataForm = this.initForm();
  }

  private async loadContacts() {
    try {
      const contacts = await this.apiService.getContacts() || [];
      this.contacts$.next(contacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load contacts'
      });
    }
  }

  private initForm(): FormGroup {
    return this.formBuilder.group({
      // Song fields
      title: [''],
      track_status: ['draft'],
      is_released: [false],
      length_seconds: [null],
      
      // Metadata fields
      bpm: [null],
      song_key: [''],
      genre: [''],
      mood: [''],
      tags: [''],  // Changed to string for input
      instruments: [''],  // Changed to string for input
      
      // Contacts
      artists: [[]],  // Array of contact IDs
      writers: [[]]   // Array of contact IDs
    });
  }

  private async loadSongData() {
    if (!this.song) return;

    try {
      this.loading = true;
      
      // Get full song data with all relations
      const fullSongData = await this.apiService.getSongById(this.song.id);
      if (!fullSongData) {
        throw new Error('Failed to load song data');
      }

      // Get metadata
      const metadata = await this.apiService.getSongMetadata(this.song.id);

      // Separate artists and writers
      const artists = fullSongData.song_contacts
        ?.filter(contact => contact.role_in_song.toLowerCase() === 'artist')
        .map(contact => contact.contact?.id)
        .filter(id => id !== undefined) || [];
      
      const writers = fullSongData.song_contacts
        ?.filter(contact => contact.role_in_song.toLowerCase() === 'writer')
        .map(contact => contact.contact?.id)
        .filter(id => id !== undefined) || [];

      // Update form with all data
      this.metadataForm.patchValue({
        // Song fields
        title: fullSongData.title,
        track_status: fullSongData.track_status,
        is_released: fullSongData.is_released,
        length_seconds: fullSongData.length_seconds,
        
        // Metadata fields
        bpm: metadata?.bpm || null,
        song_key: metadata?.song_key || '',
        genre: metadata?.genre || '',
        mood: metadata?.mood || '',
        tags: metadata?.tags?.join(', ') || '',  // Convert array to comma-separated string
        instruments: metadata?.instruments?.join(', ') || '',  // Convert array to comma-separated string
        
        // Contacts
        artists,
        writers
      });
    } catch (error) {
      console.error('Error loading song data:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load song data'
      });
    } finally {
      this.loading = false;
    }
  }

  private parseCommaSeparatedString(value: string): string[] {
    if (!value) return [];
    return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
  }

  async onSave() {
    if (!this.song || !this.metadataForm.valid) return;

    try {
      this.loading = true;
      const formData = this.metadataForm.value;
      
      // 1. Update song basic info
      await this.apiService.updateSong(this.song.id, {
        title: formData.title,
        track_status: formData.track_status,
        is_released: formData.is_released,
        length_seconds: formData.length_seconds
      });

      // 2. Update or create metadata
      const metadata = {
        song_id: this.song.id,
        bpm: formData.bpm,
        song_key: formData.song_key,
        genre: formData.genre,
        mood: formData.mood,
        tags: this.parseCommaSeparatedString(formData.tags),
        instruments: this.parseCommaSeparatedString(formData.instruments)
      };

      await this.apiService.createSongMetadata(metadata);

      // 3. Update contacts
      // First create all new contacts
      const contactPromises = [
        ...formData.artists.map((contactId: number) => 
          this.apiService.createSongContact({
            song_id: this.song!.id,
            contact_id: contactId,
            role_in_song: 'artist'
          })
        ),
        ...formData.writers.map((contactId: number) => 
          this.apiService.createSongContact({
            song_id: this.song!.id,
            contact_id: contactId,
            role_in_song: 'writer'
          })
        )
      ];

      await Promise.all(contactPromises);

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Song metadata updated successfully'
      });

      this.saved.emit();
      this.visibleChange.emit(false);
    } catch (error) {
      console.error('Error saving song metadata:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save song metadata'
      });
    } finally {
      this.loading = false;
    }
  }

  async onDelete() {
    if (!this.song) return;

    try {
      this.loading = true;
      await this.apiService.deleteSong(this.song.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Song deleted successfully'
      });
      this.saved.emit();
      this.visibleChange.emit(false);
    } catch (error) {
      console.error('Error deleting song:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete song'
      });
    } finally {
      this.loading = false;
    }
  }

  ngOnInit() {
    this.loadContacts();
    if (this.song) {
      this.loadSongData();
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

  hide() {
    this.visibleChange.emit(false);
  }
}
