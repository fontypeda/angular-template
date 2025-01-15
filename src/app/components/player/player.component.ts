import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SliderModule } from 'primeng/slider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { PlayerService, PlayerState } from '../../services/player.service';
import { GradientService } from '../../services/gradient.service';
import { Subject, takeUntil } from 'rxjs';
import WaveSurfer from 'wavesurfer.js';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';

interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  fileUrl: string;
  duration: number;
}

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ButtonModule, 
    SliderModule, 
    ProgressSpinnerModule,
    TooltipModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="playerState.currentSong" 
         class="fixed bottom-0 left-0 right-0 bg-surface-50 border-t border-surface-200 shadow-lg"
         [class.h-20]="!showPlaylist"
         [class.h-96]="showPlaylist">
      <!-- Main Player Controls -->
      <div class="max-w-[1280px] mx-auto p-3">
        <div class="flex items-center gap-4">
          <!-- Song Info with Click to Show Details -->
          <div class="flex items-center gap-2 min-w-[180px] max-w-[180px] cursor-pointer"
               (click)="toggleSongDetails()">
            <div 
              [style.background]="gradientService.generateRandomPastelGradient"
              class="w-10 h-10 rounded-sm flex-shrink-0 relative group"
            >
              <div class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all">
                <i class="pi pi-info text-white opacity-0 group-hover:opacity-100"></i>
              </div>
            </div>
            <div class="flex flex-col overflow-hidden">
              <span class="font-semibold text-sm truncate">{{playerState.currentSong.title}}</span>
              <span class="text-xs text-surface-600 truncate">{{playerState.currentSong.artist}}</span>
            </div>
          </div>

          <!-- Playback Controls with Keyboard Shortcuts -->
          <div class="flex items-center gap-1 min-w-[120px] max-w-[120px]">
            <button 
              pButton 
              icon="pi pi-step-backward" 
              class="p-button-rounded p-button-text p-button-sm"
              (click)="playPrevious()"
              pTooltip="Previous (Left Arrow)"
            ></button>
            <button 
              pButton 
              [icon]="playerState.isPlaying ? 'pi pi-pause' : 'pi pi-play'"
              class="p-button-rounded p-button-text"
              (click)="togglePlay()"
              pTooltip="Play/Pause (Space)"
            ></button>
            <button 
              pButton 
              icon="pi pi-step-forward" 
              class="p-button-rounded p-button-text p-button-sm"
              (click)="playNext()"
              pTooltip="Next (Right Arrow)"
            ></button>
          </div>

          <!-- Time and Waveform -->
          <div class="flex-1 flex items-center gap-2 min-w-[200px]">
            <span class="text-xs text-surface-600 w-8 text-right">{{formatTime(currentTime)}}</span>
            
            <div class="relative flex-1">
              <div #waveform class="w-full h-[32px]"></div>
              <div *ngIf="isLoading" class="absolute inset-0 flex items-center justify-center bg-surface-50 bg-opacity-75">
                <p-progressSpinner [style]="{width: '20px', height: '20px'}"></p-progressSpinner>
              </div>
            </div>

            <span class="text-xs text-surface-600 w-8">{{formatTime(duration)}}</span>
          </div>

          <!-- Additional Controls -->
          <div class="flex items-center gap-2 min-w-[160px] max-w-[160px]">
            <button 
              pButton 
              icon="pi pi-volume-up" 
              class="p-button-rounded p-button-text p-button-sm"
              [class.text-primary]="volume > 0"
              (click)="toggleMute()"
              [pTooltip]="volume === 0 ? 'Unmute (M)' : 'Mute (M)'"
            ></button>
            
            <p-slider 
              [(ngModel)]="volume" 
              (onChange)="onVolumeChange()"
              [min]="0"
              [max]="100"
              class="w-20"
            ></p-slider>

            <button 
              pButton 
              icon="pi pi-refresh" 
              class="p-button-rounded p-button-text p-button-sm"
              [class.text-primary]="playerState.repeat !== 'none'"
              [pTooltip]="'Repeat: ' + playerState.repeat + ' (R)'"
              (click)="toggleRepeat()"
            ></button>
            
            <button 
              pButton 
              icon="pi pi-random" 
              class="p-button-rounded p-button-text p-button-sm"
              [class.text-primary]="playerState.shuffle"
              pTooltip="Shuffle (S)"
              (click)="toggleShuffle()"
            ></button>

            <button 
              pButton 
              icon="pi pi-list" 
              class="p-button-rounded p-button-text p-button-sm"
              [class.text-primary]="showPlaylist"
              pTooltip="Queue (Q)"
              (click)="togglePlaylist()"
            ></button>
          </div>
        </div>

        <!-- Song Progress Bar -->
        <div class="mt-2">
          <div class="h-1 bg-surface-200 rounded-full overflow-hidden">
            <div 
              class="h-full bg-primary transition-all duration-300 ease-out"
              [style.width.%]="seekPosition"
            ></div>
          </div>
        </div>
      </div>

      <!-- Playlist Panel -->
      <div *ngIf="showPlaylist" class="h-72 overflow-y-auto border-t border-surface-200">
        <div class="max-w-[1280px] mx-auto p-4">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold m-0">Play Queue</h3>
            <div class="flex gap-2">
              <button 
                pButton 
                label="Clear" 
                icon="pi pi-trash" 
                class="p-button-text p-button-sm"
                (click)="clearQueue()"
              ></button>
              <button 
                pButton 
                label="Save as Playlist" 
                icon="pi pi-save" 
                class="p-button-text p-button-sm"
                (click)="saveAsPlaylist()"
              ></button>
            </div>
          </div>

          <div class="grid gap-2">
            <div *ngFor="let song of playerState.queue; let i = index" 
                 class="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-100 transition-colors"
                 [class.bg-primary-50]="song.id === playerState.currentSong.id"
                 [class.border-primary-100]="song.id === playerState.currentSong.id"
                 [class.border]="song.id === playerState.currentSong.id"
                 (dblclick)="playFromQueue(i)">
              <div class="w-8 text-surface-600 text-sm">{{i + 1}}</div>
              <div 
                [style.background]="gradientService.generateRandomPastelGradient()"
                class="w-8 h-8 rounded-sm flex-shrink-0"
              ></div>
              <div class="flex-1 overflow-hidden">
                <div class="font-medium truncate">{{song.title}}</div>
                <div class="text-sm text-surface-600 truncate">{{song.artist}}</div>
              </div>
              <div class="text-sm text-surface-600">{{formatTime(song.duration)}}</div>
              <button 
                pButton 
                icon="pi pi-times" 
                class="p-button-rounded p-button-text p-button-sm"
                (click)="removeFromQueue(i)"
              ></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-slider .p-slider-handle {
        border-radius: 50%;
      }

      .p-slider:not(.p-disabled) .p-slider-handle:hover {
        background: var(--primary-color);
        border-color: var(--primary-color);
      }

      .p-slider {
        margin-bottom: 0;
      }

      .p-progress-spinner {
        width: 30px;
        height: 30px;
      }

      .queue-enter-active, .queue-leave-active {
        transition: all 0.3s ease;
      }

      .queue-enter-from, .queue-leave-to {
        opacity: 0;
        transform: translateY(30px);
      }
    }
  `]
})
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild('waveform') waveformElement!: ElementRef;
  
  private destroy$ = new Subject<void>();
  private previousVolume = 100;

  playerState: PlayerState = this.playerService.getCurrentState();
  wavesurfer: WaveSurfer | null = null;
  volume: number = this.playerState.volume * 100;
  isLoading: boolean = false;
  currentTime: number = 0;
  duration: number = 0;
  seekPosition: number = 0;
  showPlaylist: boolean = false;

  private playStartTime: number | null = null;
  private currentSongId: string | null = null;
  private playTimer: any;
  private minPlayDuration = 30; // Minimum seconds to count as a play

  constructor(
    public playerService: PlayerService,
    public gradientService: GradientService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    // Initialize keyboard shortcuts
    this.initKeyboardShortcuts();
  }

  ngOnInit() {
    this.playerService.playerState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.playerState = state;
        
        if (state.currentSong && (!this.wavesurfer || this.wavesurfer.getDuration() === 0)) {
          this.initWaveform(state.currentSong.fileUrl);
          this.startPlayTracking(state.currentSong.id);
        }

        if (this.wavesurfer) {
          if (state.isPlaying) {
            this.wavesurfer.play();
          } else {
            this.wavesurfer.pause();
          }
        }

        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('keydown', this.handleKeydown);
    this.stopPlayTracking();
  }

  private initKeyboardShortcuts() {
    this.handleKeydown = this.handleKeydown.bind(this);
    document.addEventListener('keydown', this.handleKeydown);
  }

  private handleKeydown(event: KeyboardEvent) {
    // Only handle shortcuts if not typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch(event.code) {
      case 'Space':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.playPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.playNext();
        break;
      case 'KeyM':
        event.preventDefault();
        this.toggleMute();
        break;
      case 'KeyR':
        event.preventDefault();
        this.toggleRepeat();
        break;
      case 'KeyS':
        event.preventDefault();
        this.toggleShuffle();
        break;
      case 'KeyQ':
        event.preventDefault();
        this.togglePlaylist();
        break;
    }
  }

  private initWaveform(url: string) {
    if (this.wavesurfer) {
      this.wavesurfer.destroy();
    }

    this.isLoading = true;
    this.currentTime = 0;
    this.duration = 0;
    this.cdr.detectChanges();

    this.wavesurfer = WaveSurfer.create({
      container: this.waveformElement.nativeElement,
      waveColor: '#9CA3AF',
      progressColor: '#4F46E5',
      cursorColor: '#4F46E5',
      barWidth: 2,
      barGap: 1,
      height: 32,
      normalize: true,
      fillParent: true,
      minPxPerSec: 1,
      interact: true,
      hideScrollbar: true,
      backend: 'WebAudio',
      plugins: []
    });

    this.wavesurfer.load(url);
    this.wavesurfer.setVolume(this.playerState.volume);

    this.wavesurfer.on('ready', () => {
      this.isLoading = false;
      this.duration = this.wavesurfer!.getDuration();
      this.playerService.setDuration(this.duration);
      if (this.playerState.isPlaying) {
        this.wavesurfer!.play();
      }
      this.cdr.detectChanges();
    });

    this.wavesurfer.on('audioprocess', () => {
      this.currentTime = this.wavesurfer!.getCurrentTime();
      this.playerService.setProgress(this.currentTime);
      this.updateSeekPosition();
      this.cdr.detectChanges();
    });

    this.wavesurfer.on('finish', () => {
      this.playNext();
    });

    this.wavesurfer.on('error', (error) => {
      console.error('WaveSurfer error:', error);
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  togglePlay() {
    this.playerService.togglePlay();
  }

  toggleMute() {
    if (this.volume > 0) {
      this.previousVolume = this.volume;
      this.volume = 0;
    } else {
      this.volume = this.previousVolume;
    }
    this.onVolumeChange();
  }

  onVolumeChange() {
    const volume = this.volume / 100;
    this.playerService.setVolume(volume);
    if (this.wavesurfer) {
      this.wavesurfer.setVolume(volume);
    }
  }

  onSeek() {
    if (!this.wavesurfer || !this.duration) return;
    const time = (this.seekPosition / 100) * this.duration;
    this.wavesurfer.seekTo(time / this.duration);
    this.playerService.seekTo(time);
    this.startPlayTracking(this.playerState.currentSong!.id);
  }

  playNext() {
    this.playerService.playNext();
  }

  playPrevious() {
    this.playerService.playPrevious();
  }

  toggleRepeat() {
    this.playerService.toggleRepeat();
  }

  toggleShuffle() {
    this.playerService.toggleShuffle();
  }

  togglePlaylist() {
    this.showPlaylist = !this.showPlaylist;
    this.cdr.detectChanges();
  }

  toggleSongDetails() {
    // Implement song details dialog
  }

  playFromQueue(index: number) {
    if (index >= 0 && index < this.playerState.queue.length) {
      const song = this.playerState.queue[index];
      this.playerService.playSong(song, this.playerState.queue.slice(index + 1));
    }
  }

  removeFromQueue(index: number) {
    const newQueue = [...this.playerState.queue];
    newQueue.splice(index, 1);
    this.playerService.playSong(this.playerState.currentSong!, newQueue);
  }

  clearQueue() {
    if (this.playerState.currentSong) {
      this.playerService.playSong(this.playerState.currentSong, []);
    }
  }

  async saveAsPlaylist() {
    // Implement save as playlist functionality
  }

  private updateSeekPosition() {
    if (!this.duration) return;
    this.seekPosition = (this.currentTime / this.duration) * 100;
    this.cdr.detectChanges();
  }

  formatTime(time: number): string {
    if (!time) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async startPlayTracking(songId: string) {
    this.currentSongId = songId;
    this.playStartTime = Date.now();
    
    // Clear any existing timer
    if (this.playTimer) {
      clearTimeout(this.playTimer);
    }

    // Set a timer to record the play after minimum duration
    this.playTimer = setTimeout(() => {
      this.recordPlay(true);
    }, this.minPlayDuration * 1000);
  }

  async stopPlayTracking() {
    if (this.currentSongId && this.playStartTime) {
      await this.recordPlay(false);
    }
    this.resetPlayTracking();
  }

  private resetPlayTracking() {
    this.currentSongId = null;
    this.playStartTime = null;
    if (this.playTimer) {
      clearTimeout(this.playTimer);
      this.playTimer = null;
    }
  }

  private async recordPlay(autoRecorded: boolean = false) {
    if (!this.currentSongId || !this.playStartTime) return;

    const duration = Math.floor((Date.now() - this.playStartTime) / 1000);
    
    // Only record if played for at least 5 seconds
    if (duration < 5) return;

    try {
      const { error } = await this.authService.getSupabaseClient()
        .from('plays')
        .insert({
          song_id: this.currentSongId,
          play_duration: duration,
          completed: duration >= this.minPlayDuration,
          played_at: new Date().toISOString()
        });

      if (error) throw error;

      // Only show message for automatic recording
      if (autoRecorded) {
        this.messageService.add({
          severity: 'success',
          summary: 'Play Recorded',
          detail: 'Your play has been recorded!',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Error recording play:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to record play',
        life: 3000
      });
    }
  }
}
