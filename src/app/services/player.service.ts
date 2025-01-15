import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  fileUrl: string;
  duration: number;
}

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  repeat: 'none' | 'one' | 'all';
  shuffle: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private playerStateSubject = new BehaviorSubject<PlayerState>({
    currentSong: null,
    queue: [],
    isPlaying: false,
    volume: 0.8,
    progress: 0,
    duration: 0,
    repeat: 'none',
    shuffle: false
  });

  private originalQueue: Song[] = [];
  private currentIndex: number = -1;

  playerState$ = this.playerStateSubject.asObservable();

  playSong(song: Song, queue: Song[] = []) {
    this.originalQueue = [song, ...queue];
    this.currentIndex = 0;
    this.updateQueue();
    
    this.playerStateSubject.next({
      ...this.playerStateSubject.value,
      currentSong: song,
      queue: this.playerStateSubject.value.shuffle ? this.shuffleArray([...queue]) : queue,
      isPlaying: true
    });
  }

  togglePlay() {
    this.playerStateSubject.next({
      ...this.playerStateSubject.value,
      isPlaying: !this.playerStateSubject.value.isPlaying
    });
  }

  playNext() {
    const state = this.playerStateSubject.value;
    if (!state.currentSong) return;

    if (state.repeat === 'one') {
      // Replay current song
      this.playerStateSubject.next({
        ...state,
        isPlaying: true
      });
      return;
    }

    this.currentIndex++;
    if (this.currentIndex >= this.originalQueue.length) {
      if (state.repeat === 'all') {
        this.currentIndex = 0;
      } else {
        this.currentIndex = this.originalQueue.length - 1;
        this.playerStateSubject.next({
          ...state,
          isPlaying: false
        });
        return;
      }
    }

    const nextSong = this.originalQueue[this.currentIndex];
    this.playerStateSubject.next({
      ...state,
      currentSong: nextSong,
      isPlaying: true
    });
  }

  playPrevious() {
    const state = this.playerStateSubject.value;
    if (!state.currentSong) return;

    this.currentIndex--;
    if (this.currentIndex < 0) {
      this.currentIndex = state.repeat === 'all' ? this.originalQueue.length - 1 : 0;
    }

    const previousSong = this.originalQueue[this.currentIndex];
    this.playerStateSubject.next({
      ...state,
      currentSong: previousSong,
      isPlaying: true
    });
  }

  toggleShuffle() {
    const state = this.playerStateSubject.value;
    const newShuffle = !state.shuffle;
    
    this.playerStateSubject.next({
      ...state,
      shuffle: newShuffle,
      queue: newShuffle ? this.shuffleArray([...this.originalQueue]) : [...this.originalQueue]
    });
  }

  toggleRepeat() {
    const state = this.playerStateSubject.value;
    const repeatModes: ('none' | 'one' | 'all')[] = ['none', 'one', 'all'];
    const currentIndex = repeatModes.indexOf(state.repeat);
    const nextRepeat = repeatModes[(currentIndex + 1) % repeatModes.length];

    this.playerStateSubject.next({
      ...state,
      repeat: nextRepeat
    });
  }

  seekTo(progress: number) {
    this.playerStateSubject.next({
      ...this.playerStateSubject.value,
      progress
    });
  }

  setVolume(volume: number) {
    this.playerStateSubject.next({
      ...this.playerStateSubject.value,
      volume
    });
  }

  setProgress(progress: number) {
    this.playerStateSubject.next({
      ...this.playerStateSubject.value,
      progress
    });
  }

  setDuration(duration: number) {
    this.playerStateSubject.next({
      ...this.playerStateSubject.value,
      duration
    });
  }

  getCurrentState(): PlayerState {
    return this.playerStateSubject.value;
  }

  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private updateQueue() {
    const state = this.playerStateSubject.value;
    const queue = this.originalQueue.slice(this.currentIndex + 1);
    this.playerStateSubject.next({
      ...state,
      queue: state.shuffle ? this.shuffleArray([...queue]) : queue
    });
  }
}
