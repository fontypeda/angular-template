import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PageLayoutComponent } from '../../components/shared/page-layout/page-layout.component';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileUploadModule,
    ProgressBarModule,
    ToastModule,
    PageLayoutComponent
  ],
  providers: [MessageService],
  template: `
    <app-page-layout
      title="Upload Music"
      description="Add new songs to your library">
      
      <!-- Upload Area -->
      <div class="grid">
        <div class="col-12">
          <p-fileUpload
            name="files"
            url="your-upload-url"
            [multiple]="true"
            accept="audio/*"
            [maxFileSize]="50000000"
            (onUpload)="onUpload($event)"
            (onError)="onError($event)"
            [showCancelButton]="true"
            chooseLabel="Select Files"
            uploadLabel="Upload All"
            cancelLabel="Clear All">
            
            <ng-template pTemplate="content">
              <div class="text-center p-4">
                <i class="pi pi-upload text-4xl text-surface-600 mb-4"></i>
                <p class="mb-2">Drag and drop files here</p>
                <p class="text-sm text-surface-600">Supported formats: MP3, WAV, FLAC (max 50MB)</p>
              </div>
            </ng-template>
          </p-fileUpload>
        </div>
      </div>

      <!-- Toast Messages -->
      <p-toast></p-toast>
    </app-page-layout>
  `
})
export class UploadComponent {
  constructor(private messageService: MessageService) {}

  onUpload(event: any) {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Files uploaded successfully'
    });
  }

  onError(event: any) {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to upload files'
    });
  }
}
