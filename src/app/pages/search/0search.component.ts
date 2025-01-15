import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PageLayoutComponent } from '../../components/shared/page-layout/page-layout.component';
import { ApiService } from '../../services/api.service';
import { SongStore } from '../../stores/song.store';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    ConfirmDialogModule,
    PageLayoutComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <app-page-layout
      title="Music Library"
      description="Search and manage your music collection">
      
      <!-- Search Bar -->
      <div class="mb-6">
        <span class="p-input-icon-left w-full md:w-96">
          <i class="pi pi-search"></i>
          <input 
            type="text" 
            pInputText 
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
            class="w-full" 
            placeholder="Search songs..."/>
        </span>
      </div>

      <!-- Results Table -->
      <p-table 
        [value]="songs$()"
        [loading]="loading$()"
        [paginator]="true" 
        [rows]="10"
        [showCurrentPageReport]="true"
        [rowsPerPageOptions]="[10,25,50]"
        [globalFilterFields]="['title','artist','album']"
        styleClass="p-datatable-sm">
        
        <!-- Table Header -->
        <ng-template pTemplate="header">
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Album</th>
            <th>Duration</th>
            <th>Actions</th>
          </tr>
        </ng-template>

        <!-- Table Body -->
        <ng-template pTemplate="body" let-song>
          <tr>
            <td>{{song.title}}</td>
            <td>{{song.artist}}</td>
            <td>{{song.album}}</td>
            <td>{{formatDuration(song.duration)}}</td>
            <td>
              <div class="flex gap-2">
                <button 
                  pButton 
                  icon="pi pi-pencil" 
                  class="p-button-text p-button-sm"
                  (click)="editSong(song)">
                </button>
                <button 
                  pButton 
                  icon="pi pi-trash" 
                  class="p-button-text p-button-sm p-button-danger"
                  (click)="confirmDelete(song)">
                </button>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Empty State -->
        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center p-4">
              <div class="text-surface-600">
                <i class="pi pi-inbox text-3xl mb-2"></i>
                <p>No songs found</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Edit Dialog -->
      <p-dialog 
        [(visible)]="showEditDialog" 
        [modal]="true"
        [style]="{width: '450px'}"
        header="Edit Song">
        <!-- Dialog content here -->
      </p-dialog>

      <!-- Confirmation Dialog -->
      <p-confirmDialog></p-confirmDialog>
      
      <!-- Toast Messages -->
      <p-toast></p-toast>
    </app-page-layout>
  `
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  showEditDialog: boolean = false;
  selectedSong: any = null;

  constructor(
    private apiService: ApiService,
    private songStore: SongStore,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  // Store computed signals
  songs$ = this.songStore.songs$;
  loading$ = this.songStore.loading$;
  error$ = this.songStore.error$;

  ngOnInit() {
    this.loadSongs();
  }

  async loadSongs() {
    await this.songStore.loadSongs();
  }

  onSearch() {
    // Implement search logic
  }

  editSong(song: any) {
    this.selectedSong = song;
    this.showEditDialog = true;
  }

  confirmDelete(song: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this song?',
      accept: () => this.deleteSong(song)
    });
  }

  async deleteSong(song: any) {
    try {
      await this.songStore.deleteSong(song.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Song deleted successfully'
      });
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete song'
      });
    }
  }

  formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
