import { Injectable, computed, signal } from '@angular/core';
import { ApiService, Contact } from '../services/api.service';

export interface ContactWithSongs extends Contact {
  song_contact?: Array<{
    id: number;
    song_id: number;
    role_in_song: string;
    split_percentage?: number;
    song: {
      id: number;
      title: string;
      track_status: string;
      cover_image_url?: string;
    };
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class ContactStore {
  private contacts = signal<ContactWithSongs[]>([]);
  private loading = signal<boolean>(false);
  private error = signal<string | null>(null);
  private selectedContact = signal<ContactWithSongs | null>(null);
  private searchQuery = signal<string>('');

  // Computed signals
  readonly contacts$ = computed(() => {
    const query = this.searchQuery().toLowerCase();
    return this.contacts().filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      (contact.email?.toLowerCase().includes(query) || '') ||
      (contact.phone?.toLowerCase().includes(query) || '')
    );
  });
  readonly loading$ = computed(() => this.loading());
  readonly error$ = computed(() => this.error());
  readonly selectedContact$ = computed(() => this.selectedContact());
  readonly searchQuery$ = computed(() => this.searchQuery());

  constructor(private apiService: ApiService) {}

  async loadContacts() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const contacts = await this.apiService.getContacts();
      this.contacts.set(contacts as ContactWithSongs[]);
    } catch (err) {
      this.error.set('Failed to load contacts');
      console.error('Error loading contacts:', err);
    } finally {
      this.loading.set(false);
    }
  }

  async createContact(contactData: { name: string; email?: string | null; phone?: string | null }) {
    try {
      this.loading.set(true);
      this.error.set(null);
      const newContact = await this.apiService.createContact(contactData);
      this.contacts.update(contacts => [...contacts, newContact as ContactWithSongs]);
      return newContact;
    } catch (err) {
      this.error.set('Failed to create contact');
      console.error('Error creating contact:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async updateContact(id: number, contactData: { name: string; email?: string | null; phone?: string | null }) {
    try {
      this.loading.set(true);
      this.error.set(null);
      
      // Since there's no updateContact method in the API service,
      // we'll need to implement it or handle updates differently
      // For now, we'll just update the local state
      this.contacts.update(contacts =>
        contacts.map(contact =>
          contact.id === id
            ? { ...contact, ...contactData }
            : contact
        )
      );
      
      return this.contacts().find(contact => contact.id === id) || null;
    } catch (err) {
      this.error.set('Failed to update contact');
      console.error('Error updating contact:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  async deleteContact(id: number) {
    try {
      this.loading.set(true);
      this.error.set(null);
      
      // Since there's no deleteContact method in the API service,
      // we'll just update the local state for now
      this.contacts.update(contacts =>
        contacts.filter(contact => contact.id !== id)
      );
    } catch (err) {
      this.error.set('Failed to delete contact');
      console.error('Error deleting contact:', err);
      throw err;
    } finally {
      this.loading.set(false);
    }
  }

  setSelectedContact(contact: ContactWithSongs | null) {
    this.selectedContact.set(contact);
  }

  setSearchQuery(query: string) {
    this.searchQuery.set(query);
  }
}
