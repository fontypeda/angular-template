import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { PageLayoutComponent } from '../../components/shared/page-layout/page-layout.component';

@Component({
  selector: 'app-contacts',
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
    PageLayoutComponent
  ],
  providers: [MessageService, ConfirmationService],
  template: `
    <app-page-layout
      title="Contacts"
      description="Manage your music contacts and collaborators">
      
      <!-- Actions Bar -->
      <div class="mb-4 flex justify-between items-center">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input 
            type="text" 
            pInputText 
            [(ngModel)]="searchQuery"
            class="w-full md:w-96" 
            placeholder="Search contacts..."/>
        </span>

        <button 
          pButton 
          icon="pi pi-plus" 
          label="New Contact"
          (click)="showAddDialog()">
        </button>
      </div>

      <!-- Contacts Table -->
      <p-table 
        [value]="contacts" 
        [paginator]="true" 
        [rows]="10"
        [showCurrentPageReport]="true"
        [globalFilterFields]="['name','email','role']"
        styleClass="p-datatable-sm">
        
        <ng-template pTemplate="header">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </ng-template>

        <ng-template pTemplate="body" let-contact>
          <tr>
            <td>
              <div class="flex align-items-center gap-2">
                <span class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white">
                  {{ getInitials(contact.name) }}
                </span>
                <span>{{ contact.name }}</span>
              </div>
            </td>
            <td>{{ contact.email }}</td>
            <td>{{ contact.role }}</td>
            <td>
              <span [class]="'status-badge status-' + contact.status.toLowerCase()">
                {{ contact.status }}
              </span>
            </td>
            <td>
              <div class="flex gap-2">
                <button 
                  pButton 
                  icon="pi pi-pencil" 
                  class="p-button-text p-button-sm"
                  (click)="editContact(contact)">
                </button>
                <button 
                  pButton 
                  icon="pi pi-trash" 
                  class="p-button-text p-button-sm p-button-danger"
                  (click)="confirmDelete(contact)">
                </button>
              </div>
            </td>
          </tr>
        </ng-template>

        <ng-template pTemplate="emptymessage">
          <tr>
            <td colspan="5" class="text-center p-4">
              <div class="text-surface-600">
                <i class="pi pi-users text-3xl mb-2"></i>
                <p>No contacts found</p>
              </div>
            </td>
          </tr>
        </ng-template>
      </p-table>

      <!-- Contact Dialog -->
      <p-dialog 
        [(visible)]="showDialog" 
        [modal]="true"
        [style]="{width: '450px'}"
        [header]="dialogMode === 'add' ? 'Add Contact' : 'Edit Contact'">
        <!-- Dialog content here -->
      </p-dialog>

      <!-- Confirmation Dialog -->
      <p-confirmDialog></p-confirmDialog>
      
      <!-- Toast Messages -->
      <p-toast></p-toast>
    </app-page-layout>
  `,
  styles: [`
    .status-badge {
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .status-active {
      background-color: #E6F4EA;
      color: #1E7E34;
    }
    .status-inactive {
      background-color: #FBE9E7;
      color: #D84315;
    }
    .status-pending {
      background-color: #FFF3E0;
      color: #EF6C00;
    }
  `]
})
export class ContactsComponent implements OnInit {
  contacts: any[] = [];
  searchQuery: string = '';
  showDialog: boolean = false;
  dialogMode: 'add' | 'edit' = 'add';
  selectedContact: any = null;

  constructor(
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadContacts();
  }

  loadContacts() {
    // TODO: Load from API
    this.contacts = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Artist',
        status: 'Active'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'Producer',
        status: 'Pending'
      }
    ];
  }

  showAddDialog() {
    this.dialogMode = 'add';
    this.selectedContact = null;
    this.showDialog = true;
  }

  editContact(contact: any) {
    this.dialogMode = 'edit';
    this.selectedContact = { ...contact };
    this.showDialog = true;
  }

  confirmDelete(contact: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this contact?',
      accept: () => this.deleteContact(contact)
    });
  }

  deleteContact(contact: any) {
    // TODO: Implement delete
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Contact deleted successfully'
    });
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  }
}
