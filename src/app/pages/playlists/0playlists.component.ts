import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PageLayoutComponent } from '../../components/shared/page-layout/page-layout.component';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    CardModule,
    PageLayoutComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <app-page-layout
      title="Playlists"
      description="Organize and manage your music collections">
      
      <!-- Actions Bar -->
      <div class="mb-6 flex justify-between items-center">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input 
            type="text" 
            pInputText 
            [(ngModel)]="searchQuery"
            class="w-full md:w-96" 
            placeholder="Search playlists..."/>
        </span>

        <button 
          pButton 
          icon="pi pi-plus" 
          label="New Playlist"
          (click)="showAddDialog()">
        </button>
      </div>

      <!-- Playlists Grid -->
      <div class="grid">
        @for (playlist of playlists; track playlist.id) {
          <div class="col-12 md:col-6 lg:col-4">
            <p-card styleClass="h-full">
              <div class="flex flex-col h-full">
                <!-- Playlist Header -->
                <div class="flex items-center gap-4 mb-4">
                  <div class="w-16 h-16 bg-primary rounded-lg flex items-center justify-center text-white">
                    <i class="pi pi-list text-3xl"></i>
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold mb-1">{{ playlist.name }}</h3>
                    <p class="text-surface-600">{{ playlist.songCount }} songs</p>
                  </div>
                </div>

                <!-- Playlist Info -->
                <div class="flex-1">
                  <p class="text-surface-600 mb-4">{{ playlist.description }}</p>
                  <div class="flex items-center gap-2 text-sm text-surface-600">
                    <i class="pi pi-clock"></i>
                    <span>{{ formatDuration(playlist.totalDuration) }}</span>
                    <span class="mx-2">•</span>
                    <i class="pi pi-calendar"></i>
                    <span>{{ playlist.lastUpdated | date:'mediumDate' }}</span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-2 mt-4 pt-4 border-t">
                  <button 
                    pButton 
                    icon="pi pi-pencil" 
                    class="p-button-text"
                    (click)="editPlaylist(playlist)">
                  </button>
                  <button 
                    pButton 
                    icon="pi pi-trash" 
                    class="p-button-text p-button-danger"
                    (click)="confirmDelete(playlist)">
                  </button>
                </div>
              </div>
            </p-card>
          </div>
        }

        <!-- Empty State -->
        @if (playlists.length === 0) {
          <div class="col-12">
            <div class="text-center p-8 bg-surface-50 rounded-lg">
              <i class="pi pi-list text-4xl text-surface-600 mb-4"></i>
              <h3 class="text-xl font-semibold mb-2">No Playlists Yet</h3>
              <p class="text-surface-600 mb-4">Create your first playlist to start organizing your music</p>
              <button 
                pButton 
                icon="pi pi-plus" 
                label="Create Playlist"
                (click)="showAddDialog()">
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Playlist Dialog -->
      <p-dialog 
        [(visible)]="showDialog" 
        [modal]="true"
        [style]="{width: '500px'}"
        [header]="dialogMode === 'add' ? 'Create Playlist' : 'Edit Playlist'">
        <!-- Dialog content here -->
      </p-dialog>

      <!-- Confirmation Dialog -->
      <p-confirmDialog></p-confirmDialog>
      
      <!-- Toast Messages -->
      <p-toast></p-toast>
    </app-page-layout>
  `
})
export class PlaylistsComponent implements OnInit {
  playlists: any[] = [];
  searchQuery: string = '';
  showDialog: boolean = false;
  dialogMode: 'add' | 'edit' = 'add';
  selectedPlaylist: any = null;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadPlaylists();
  }

  loadPlaylists() {
    // TODO: Load from API
    this.playlists = [
      {
        id: 1,
        name: 'Summer Hits',
        description: 'Best summer tracks of all time',
        songCount: 25,
        totalDuration: 5400,
        lastUpdated: new Date()
      },
      {
        id: 2,
        name: 'Workout Mix',
        description: 'High energy songs for exercise',
        songCount: 18,
        totalDuration: 3600,
        lastUpdated: new Date()
      }
    ];
  }

  showAddDialog() {
    this.dialogMode = 'add';
    this.selectedPlaylist = null;
    this.showDialog = true;
  }

  editPlaylist(playlist: any) {
    this.dialogMode = 'edit';
    this.selectedPlaylist = { ...playlist };
    this.showDialog = true;
  }

  confirmDelete(playlist: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this playlist?',
      accept: () => this.deletePlaylist(playlist)
    });
  }

  deletePlaylist(playlist: any) {
    // TODO: Implement delete
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Playlist deleted successfully'
    });
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
