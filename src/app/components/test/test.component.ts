import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TimelineModule } from 'primeng/timeline';
import { DropdownModule } from 'primeng/dropdown';
import { SliderModule } from 'primeng/slider';
import { CalendarModule } from 'primeng/calendar';
import { KnobModule } from 'primeng/knob';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ChipModule } from 'primeng/chip';
import { InputSwitchModule } from 'primeng/inputswitch';
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RippleModule } from 'primeng/ripple';

interface TestResult {
  name: string;
  status: 'success' | 'error';
  message: string;
  data?: any;
}

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    TableModule,
    TabViewModule,
    TimelineModule,
    DropdownModule,
    SliderModule,
    CalendarModule,
    KnobModule,
    SkeletonModule,
    ProgressBarModule,
    ToastModule,
    ChipModule,
    InputSwitchModule,
    RatingModule,
    InputTextModule,
    ConfirmDialogModule,
    RippleModule
  ],
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class TestComponent implements OnInit {
  testResults: TestResult[] = [];
  isRunningTests: boolean = false;

  // Properties for UI components
  timelineEvents = [
    {
      title: 'Angular 18',
      description: 'Built with the latest version of Angular'
    },
    {
      title: 'PrimeNG Integration',
      description: 'Seamless integration with PrimeNG components'
    },
    {
      title: 'Tailwind CSS',
      description: 'Modern utility-first CSS framework'
    }
  ];

  cities = [
    { name: 'New York', code: 'NY' },
    { name: 'London', code: 'LON' },
    { name: 'Paris', code: 'PAR' },
    { name: 'Tokyo', code: 'TKY' }
  ];

  selectedCity: any = null;
  selectedDate: Date = new Date();
  rating: number = 0;
  checked: boolean = false;
  sliderValue: number = 50;
  knobValue: number = 60;

  tableData = [
    { id: 1, name: 'Item 1', status: 'Active' },
    { id: 2, name: 'Item 2', status: 'Inactive' },
    { id: 3, name: 'Item 3', status: 'Pending' },
    { id: 4, name: 'Item 4', status: 'Active' },
    { id: 5, name: 'Item 5', status: 'Inactive' }
  ];

  constructor(
    private apiService: ApiService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {}

  getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'danger';
      case 'pending':
        return 'warn';
      default:
        return 'info';
    }
  }

  showSuccess() {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Operation completed successfully'
    });
  }

  showInfo() {
    this.messageService.add({
      severity: 'info',
      summary: 'Info',
      detail: 'Information message'
    });
  }

  showWarn() {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warning',
      detail: 'Warning message'
    });
  }

  showError() {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error occurred'
    });
  }

  confirmDelete() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this item?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Confirmed',
          detail: 'Item deleted'
        });
      },
      reject: () => {
        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'Delete cancelled'
        });
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // Implement filtering logic here
    console.log('Filtering with:', filterValue);
  }

  async runAllTests() {
    this.isRunningTests = true;
    this.testResults = [];

    try {
      // Test songs
      await this.testSongOperations();
      
      // Test playlists
      await this.testPlaylistOperations();
      
      // Test contacts
      await this.testContactOperations();

      this.messageService.add({
        severity: 'success',
        summary: 'Tests Complete',
        detail: 'All tests have been executed successfully'
      });
    } catch (error: any) {
      console.error('Test failed:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Test Failed',
        detail: error?.message || 'An unknown error occurred'
      });
    } finally {
      this.isRunningTests = false;
    }
  }

  private async testSongOperations() {
    let createdSong: any = null;
    let createdMetadata: any = null;

    try {
      // Test creating a song
      const songData = {
        title: `Test Song ${new Date().getTime()}`,
        track_status: 'draft' as const,
        is_released: false
      };

      createdSong = await this.apiService.createSong(songData);
      this.testResults.push({
        name: 'Create Song',
        status: 'success',
        message: `Created song with ID: ${createdSong.id}`
      });

      // Test getting all songs
      const songs = await this.apiService.getSongs();
      this.testResults.push({
        name: 'Get All Songs',
        status: 'success',
        message: `Retrieved ${songs.length} songs`
      });

      // Test getting specific song
      const song = await this.apiService.getSongById(createdSong.id);
      this.testResults.push({
        name: 'Get Song by ID',
        status: 'success',
        message: `Retrieved song: ${song?.title}`
      });

      // Test creating song metadata
      const metadataData = {
        song_id: createdSong.id,
        bpm: 120,
        song_key: 'C',
        genre: 'Pop',
        mood: 'Happy',
        tags: ['test', 'demo'],
        instruments: ['guitar', 'piano']
      };

      createdMetadata = await this.apiService.createSongMetadata(metadataData);
      this.testResults.push({
        name: 'Create Song Metadata',
        status: 'success',
        message: `Created metadata for song ID: ${createdSong.id}`
      });

      // Test getting song metadata
      const metadata = await this.apiService.getSongMetadata(createdSong.id);
      this.testResults.push({
        name: 'Get Song Metadata',
        status: 'success',
        message: `Retrieved metadata for song ID: ${createdSong.id}`
      });

      // Test updating song
      const updateData = {
        title: `Updated Test Song ${new Date().getTime()}`,
        track_status: 'pending_approval' as const
      };

      const updatedSong = await this.apiService.updateSong(createdSong.id, updateData);
      this.testResults.push({
        name: 'Update Song',
        status: 'success',
        message: `Updated song title to: ${updatedSong.title}`
      });

    } catch (error: any) {
      this.handleTestError('Song Operations', error);
      throw error;
    }
  }

  private async testPlaylistOperations() {
    let createdPlaylist: any = null;
    let createdSong: any = null;

    try {
      // Test creating a playlist
      const playlistData = {
        name: `Test Playlist ${new Date().getTime()}`,
        is_public: true
      };

      createdPlaylist = await this.apiService.createPlaylist(playlistData);
      this.testResults.push({
        name: 'Create Playlist',
        status: 'success',
        message: `Created playlist with ID: ${createdPlaylist.id}`
      });

      // Create a test song for playlist operations
      const songData = {
        title: `Test Song for Playlist ${new Date().getTime()}`,
        track_status: 'draft' as const,
        is_released: false
      };

      createdSong = await this.apiService.createSong(songData);

      // Test adding song to playlist
      await this.apiService.addSongToPlaylist(createdSong.id, createdPlaylist.id);
      this.testResults.push({
        name: 'Add Song to Playlist',
        status: 'success',
        message: `Added song ${createdSong.id} to playlist ${createdPlaylist.id}`
      });

      // Test getting songs in playlist
      const playlistSongs = await this.apiService.getSongsInPlaylist(createdPlaylist.id);
      this.testResults.push({
        name: 'Get Playlist Songs',
        status: 'success',
        message: `Retrieved ${playlistSongs.length} songs from playlist`
      });

      // Test getting specific song in playlist
      const playlistSong = await this.apiService.getSongInPlaylist(createdPlaylist.id, createdSong.id);
      this.testResults.push({
        name: 'Get Song in Playlist',
        status: 'success',
        message: `Retrieved song ${createdSong.id} from playlist ${createdPlaylist.id}`
      });

      // Test creating playlist share
      const shareData = await this.apiService.createPlaylistShare(createdPlaylist.id, 'read-only');
      this.testResults.push({
        name: 'Create Playlist Share',
        status: 'success',
        message: `Created share link for playlist ${createdPlaylist.id}`
      });

      // Test removing song from playlist
      await this.apiService.removeSongFromPlaylist(createdSong.id, createdPlaylist.id);
      this.testResults.push({
        name: 'Remove Song from Playlist',
        status: 'success',
        message: `Removed song ${createdSong.id} from playlist ${createdPlaylist.id}`
      });

      // Clean up - delete playlist
      await this.apiService.deletePlaylist(createdPlaylist.id);
      this.testResults.push({
        name: 'Delete Playlist',
        status: 'success',
        message: `Deleted playlist ${createdPlaylist.id}`
      });

    } catch (error: any) {
      this.handleTestError('Playlist Operations', error);
      throw error;
    }
  }

  private async testContactOperations() {
    try {
      // Test creating a contact
      const contactData = {
        name: `Test Contact ${new Date().getTime()}`,
        email: 'test@example.com',
        phone: '1234567890'
      };

      const createdContact = await this.apiService.createContact(contactData);
      this.testResults.push({
        name: 'Create Contact',
        status: 'success',
        message: `Created contact with ID: ${createdContact.id}`
      });

      // Test getting all contacts
      const contacts = await this.apiService.getContacts();
      this.testResults.push({
        name: 'Get All Contacts',
        status: 'success',
        message: `Retrieved ${contacts.length} contacts`
      });

    } catch (error: any) {
      this.handleTestError('Contact Operations', error);
      throw error;
    }
  }

  private handleTestError(operation: string, error: any) {
    console.error(`Error in ${operation}:`, error);
    this.testResults.push({
      name: operation,
      status: 'error',
      message: error?.message || 'An unknown error occurred'
    });
  }
}
