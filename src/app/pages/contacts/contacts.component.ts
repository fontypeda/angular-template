import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

// Services and Components
import { ContactStore } from '../../stores/contact.store';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';
import { PageHeaderComponent } from '../../layouts/components/page-header/page-header.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    ToastModule,
    TagModule,
    TooltipModule,
    RippleModule,
    CardModule,
    ConfirmDialogModule,
    ContactFormComponent,
    PageHeaderComponent,
    AvatarModule,
    AvatarGroupModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  contactStore = inject(ContactStore);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  fb = inject(FormBuilder);

  // Dialog visibility states
  contactDialog = false;
  songsDialogVisible = false;
  submitted = false;
  editingContact: any = null;

  // Form
  contactForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.email]],
    phone: ['']
  });

  // Computed contacts with song count for sorting
  contactsWithSongCount = computed(() => {
    return this.contactStore.contacts$().map(contact => ({
      ...contact,
      songCount: contact.song_contact?.length || 0
    }));
  });

  ngOnInit() {
    this.loadContacts();
  }

  async loadContacts() {
    try {
      await this.contactStore.loadContacts();
    } catch (error) {
      console.error('Error loading contacts:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load contacts'
      });
    }
  }

  openNewContactDialog() {
    this.contactForm.reset();
    this.editingContact = null;
    this.submitted = false;
    this.contactDialog = true;
  }

  editContact(contact: any) {
    this.editingContact = { ...contact };
    this.contactForm.patchValue({
      name: contact.name,
      email: contact.email,
      phone: contact.phone
    });
    this.contactDialog = true;
  }

  hideDialog() {
    this.contactDialog = false;
    this.submitted = false;
    this.contactForm.reset();
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.contactStore.setSearchQuery(target.value);
  }

  async saveContact() {
    this.submitted = true;

    if (this.contactForm.invalid) {
      return;
    }

    try {
      const contactData = this.contactForm.value;
      
      if (this.editingContact) {
        await this.contactStore.updateContact(this.editingContact.id, contactData);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Contact updated successfully'
        });
      } else {
        await this.contactStore.createContact(contactData);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Contact created successfully'
        });
      }

      this.contactDialog = false;
      this.contactForm.reset();
      this.submitted = false;
    } catch (error) {
      console.error('Error saving contact:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save contact'
      });
    }
  }

  confirmDelete(contact: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this contact?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteContact(contact)
    });
  }

  async deleteContact(contact: any) {
    try {
      await this.contactStore.deleteContact(contact.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Contact deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting contact:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to delete contact'
      });
    }
  }

  showSongsDialog(contact: any) {
    this.contactStore.setSelectedContact(contact);
    this.songsDialogVisible = true;
  }

  // Helper method to format phone numbers
  formatPhoneNumber(phone: string | null): string {
    if (!phone) return '';
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3];
    }
    return phone;
  }

  // Helper method to get song role label
  getSongRoleLabel(role: string): string {
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  // Helper method to get role severity for tags
  getRoleSeverity(role: string): 'success' | 'warning' | 'info' | 'danger' | 'secondary' {
    switch (role.toLowerCase()) {
      case 'artist':
        return 'success';
      case 'producer':
        return 'warning';
      case 'writer':
        return 'info';
      case 'featured':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  // Helper method for song status severity
  getSongSeverity(status: string): 'success' | 'warn' | 'info' | 'secondary' {
    switch (status.toLowerCase()) {
      case 'released':
        return 'success';
      case 'draft':
        return 'warn';
      case 'pending_approval':
        return 'info';
      default:
        return 'secondary';
    }
  }
}
