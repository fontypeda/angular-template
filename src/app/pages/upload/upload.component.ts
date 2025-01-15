import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// PrimeNG Imports
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

// Services and Components
import { ApiService } from '../../services/api.service';
import { ContactFormComponent, ContactFormData } from '../../components/contact-form/contact-form.component';

interface Contact {
  id: number;
  owner_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

interface CreateSongRequest {
  title: string;
  track_status: 'draft' | 'pending_approval' | 'released';
  audio_file_url: string;
  cover_image_url?: string;
  is_released?: boolean;
  length_seconds?: number;
}

interface CreateSongMetadataRequest {
  song_id: number;
  bpm: number;
  song_key: string;
  genre: string;
  mood?: string;
  tags?: string[];
  instruments?: string[];
}

interface CreateSongContactRequest {
  song_id: number;
  contact_id: number;
  role_in_song: string;
  split_percentage?: number;
}

interface SelectOption {
  name: string;
  code: string;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    FileUploadModule,
    InputTextModule,
    AutoCompleteModule,
    InputNumberModule,
    MultiSelectModule,
    ChipModule,
    CardModule,
    ToastModule,
    DialogModule,
    DropdownModule,
    ContactFormComponent
  ],
  providers: [MessageService],
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  @ViewChild('songUpload') songUpload!: FileUpload;
  @ViewChild('coverUpload') coverUpload!: FileUpload;

  uploadForm: FormGroup;
  songFile: File | null = null;
  coverImage: File | null = null;
  coverImagePreview: string | undefined = undefined;

  // Contacts list
  contacts: Contact[] = [];
  selectedArtists: number[] = [];
  selectedWriters: number[] = [];

  // Dialog visibility and state
  showContactDialog = false;
  isSubmitting = false;
  dialogMode: 'artist' | 'writer' = 'artist';

  // Options for select components
  trackStatusOptions: SelectOption[] = [
    { name: 'Draft', code: 'draft' },
    { name: 'Pending Approval', code: 'pending_approval' },
    { name: 'Released', code: 'released' }
  ];

  keys: SelectOption[] = [
    { name: 'C Major', code: 'C' },
    { name: 'G Major', code: 'G' },
    { name: 'D Major', code: 'D' },
    { name: 'A Major', code: 'A' },
    { name: 'E Major', code: 'E' },
    { name: 'B Major', code: 'B' },
    { name: 'F# Major', code: 'F#' },
    { name: 'C# Major', code: 'C#' }
  ];

  genres: SelectOption[] = [
    { name: 'Rock', code: 'rock' },
    { name: 'Pop', code: 'pop' },
    { name: 'Jazz', code: 'jazz' },
    { name: 'Classical', code: 'classical' },
    { name: 'Electronic', code: 'electronic' },
    { name: 'Hip Hop', code: 'hiphop' },
    { name: 'R&B', code: 'rnb' },
    { name: 'Country', code: 'country' }
  ];

  moods: SelectOption[] = [
    { name: 'Happy', code: 'happy' },
    { name: 'Sad', code: 'sad' },
    { name: 'Energetic', code: 'energetic' },
    { name: 'Calm', code: 'calm' },
    { name: 'Aggressive', code: 'aggressive' },
    { name: 'Romantic', code: 'romantic' },
    { name: 'Mysterious', code: 'mysterious' }
  ];

  constructor(
    private fb: FormBuilder,
    private messageService: MessageService,
    private apiService: ApiService
  ) {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      trackStatus: ['draft', Validators.required],
      selectedArtists: [[] as number[], Validators.required],
      selectedWriters: [[] as number[]],
      bpm: [120, [Validators.required, Validators.min(20), Validators.max(300)]],
      key: ['', Validators.required],
      genre: ['', Validators.required],
      mood: [''],
      tags: [[]],
      instruments: [[]]
    });
  }

  async ngOnInit() {
    await this.loadContacts();
  }

  async loadContacts() {
    try {
      this.contacts = await this.apiService.getContacts();
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load contacts'
      });
    }
  }

  showNewArtistDialog() {
    this.dialogMode = 'artist';
    this.showContactDialog = true;
  }

  showNewWriterDialog() {
    this.dialogMode = 'writer';
    this.showContactDialog = true;
  }

  async onContactSubmit(data: ContactFormData) {
    this.isSubmitting = true;
    try {
      const newContact = await this.apiService.createContact(data) as Contact;
      this.contacts = [...this.contacts, newContact];

      // Add to selection based on dialog mode
      if (this.dialogMode === 'artist') {
        const selectedArtists = this.uploadForm.get('selectedArtists');
        const currentArtists = selectedArtists?.value as number[] || [];
        selectedArtists?.patchValue([...currentArtists, newContact.id]);
      } else {
        const selectedWriters = this.uploadForm.get('selectedWriters');
        const currentWriters = selectedWriters?.value as number[] || [];
        selectedWriters?.patchValue([...currentWriters, newContact.id]);
      }

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: `Contact created successfully`
      });

      // Close dialog
      this.showContactDialog = false;
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: `Failed to create contact`
      });
    } finally {
      this.isSubmitting = false;
    }
  }

  // File handling methods
  onSongUpload(event: any) {
    const file = event.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/aiff'];
      if (!allowedTypes.includes(file.type)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File Type',
          detail: 'Please upload an MP3, WAV, or AIFF file'
        });
        return;
      }

      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: 'Audio file must be less than 10MB'
        });
        return;
      }

      this.songFile = file;
    }
  }

  onCoverImageUpload(event: any) {
    const file = event.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File Type',
          detail: 'Please upload a JPG, PNG, or WebP image'
        });
        return;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: 'Image must be less than 5MB'
        });
        return;
      }

      // Create an image element to check dimensions
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e: any) => {
        img.src = e.target.result;
        img.onload = () => {
          // Check if image is square
          if (img.width !== img.height) {
            this.messageService.add({
              severity: 'error',
              summary: 'Invalid Dimensions',
              detail: 'Cover image must be square (same width and height)'
            });
            return;
          }

          // Check minimum dimensions (1400x1400)
          if (img.width < 1400 || img.height < 1400) {
            this.messageService.add({
              severity: 'error',
              summary: 'Image Too Small',
              detail: 'Cover image must be at least 1400x1400 pixels'
            });
            return;
          }

          // If image passes all checks, set it
          this.coverImage = file;
          this.coverImagePreview = e.target.result;
        };
      };
      reader.readAsDataURL(file);
    }
  }

  removeCoverImage() {
    this.coverImage = null;
    this.coverImagePreview = undefined;
  }

  // Tag and instrument methods
  addTag(tag: string) {
    if (!tag) return;
    const currentTags = this.uploadForm.get('tags')?.value || [];
    if (!currentTags.includes(tag)) {
      this.uploadForm.patchValue({
        tags: [...currentTags, tag]
      });
    }
  }

  removeTag(tag: string) {
    const currentTags = this.uploadForm.get('tags')?.value || [];
    this.uploadForm.patchValue({
      tags: currentTags.filter((t: string) => t !== tag)
    });
  }

  addInstrument(instrument: string) {
    if (!instrument) return;
    const currentInstruments = this.uploadForm.get('instruments')?.value || [];
    if (!currentInstruments.includes(instrument)) {
      this.uploadForm.patchValue({
        instruments: [...currentInstruments, instrument]
      });
    }
  }

  removeInstrument(instrument: string) {
    const currentInstruments = this.uploadForm.get('instruments')?.value || [];
    this.uploadForm.patchValue({
      instruments: currentInstruments.filter((i: string) => i !== instrument)
    });
  }

  addNewGenre() {
    const name = prompt('Enter new genre name:');
    if (name) {
      const code = name.toLowerCase().replace(/\s+/g, '');
      const newGenre: SelectOption = { name, code };
      this.genres = [...this.genres, newGenre];
      const currentGenres = this.uploadForm.get('genre')?.value || [];
      this.uploadForm.patchValue({
        genre: [...currentGenres, code]
      });
    }
  }

  addNewMood() {
    const name = prompt('Enter new mood name:');
    if (name) {
      const code = name.toLowerCase().replace(/\s+/g, '');
      const newMood: SelectOption = { name, code };
      this.moods = [...this.moods, newMood];
      const currentMoods = this.uploadForm.get('mood')?.value || [];
      this.uploadForm.patchValue({
        mood: [...currentMoods, code]
      });
    }
  }

  async onSubmit() {
    if (this.uploadForm.valid && this.songFile) {
      try {
        this.isSubmitting = true;

        // Upload song file and cover image to storage
        const songUrl = await this.apiService.uploadSongFile(this.songFile);
        let coverImageUrl: string | undefined = undefined;

        if (this.coverImage) {
          coverImageUrl = await this.apiService.uploadCoverImage(this.coverImage);
        }

        // Get form values
        const formData = this.uploadForm.value;

        // Create song first
        const song = await this.apiService.createSong({
          title: formData.title,
          track_status: formData.trackStatus,
          is_released: formData.trackStatus === 'released',
          audio_file_url: songUrl,
          cover_image_url: coverImageUrl
        });

        // Create song metadata
        await this.apiService.createSongMetadata({
          song_id: song.id,
          bpm: formData.bpm,
          song_key: formData.key,
          genre: formData.genre,
          mood: formData.mood,
          tags: formData.tags,
          instruments: formData.instruments
        });

        // Create song-contact relationships
        const artistPromises = formData.selectedArtists.map((artistId: number) => 
          this.apiService.createSongContact({
            song_id: song.id,
            contact_id: artistId,
            role_in_song: 'artist'
          })
        );

        const writerPromises = formData.selectedWriters.map((writerId: number) => 
          this.apiService.createSongContact({
            song_id: song.id,
            contact_id: writerId,
            role_in_song: 'writer'
          })
        );

        await Promise.all([...artistPromises, ...writerPromises]);

        // Show success message
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Complete',
          detail: 'Your song has been successfully uploaded!'
        });

        // Reset form and file inputs
        this.resetForm();

      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Failed',
          detail: 'There was an error uploading your song. Please try again.'
        });
        console.error('Upload error:', error);
      } finally {
        this.isSubmitting = false;
      }
    } else {
      // Show validation errors
      this.messageService.add({
        severity: 'warn',
        summary: 'Form Invalid',
        detail: 'Please fill in all required fields and upload a song file.'
      });
      
      // Mark all fields as touched to show validation errors
      Object.keys(this.uploadForm.controls).forEach(key => {
        const control = this.uploadForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  resetForm() {
    // Reset form to initial values
    this.uploadForm.reset({
      title: '',
      trackStatus: 'draft',
      selectedArtists: [],
      selectedWriters: [],
      bpm: 120,
      key: '',
      genre: '',
      mood: '',
      tags: [],
      instruments: []
    });

    // Reset file inputs
    this.songFile = null;
    this.coverImage = null;
    this.coverImagePreview = undefined;

    // Reset file upload components if needed
    if (this.songUpload) {
      this.songUpload.clear();
    }
    if (this.coverUpload) {
      this.coverUpload.clear();
    }
  }
}