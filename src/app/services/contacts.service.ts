import { Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Contact {
  id?: number;
  name: string;
  contact_type?: string;
  email?: string;
  phone?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ContactsService {
  private supabase: SupabaseClient;

  constructor(private authService: AuthService) {
    this.supabase = this.authService.getSupabaseClient();
  }

  searchContacts(query: string): Observable<Contact[]> {
    return from(this.supabase
      .from('contacts')
      .select('*')
      .ilike('name', `%${query}%`)
      .order('name')
      .limit(10)
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }));
  }

  getContacts(): Observable<Contact[]> {
    return from(this.supabase
      .from('contacts')
      .select('*')
      .order('name')
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }));
  }

  getArtists(): Observable<Contact[]> {
    return from(this.supabase
      .from('contacts')
      .select('*')
      .eq('contact_type', 'ARTIST')
      .order('name')
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }));
  }

  searchArtists(query: string): Observable<Contact[]> {
    return from(this.supabase
      .from('contacts')
      .select('*')
      .eq('contact_type', 'ARTIST')
      .ilike('name', `%${query}%`)
      .order('name')
      .then(({ data, error }) => {
        if (error) throw error;
        return data || [];
      }));
  }

  createContact(contact: Contact): Observable<Contact> {
    const user = this.authService.getCurrentUserValue();
    if (!user) throw new Error('No user signed in');

    return from(this.supabase
      .from('contacts')
      .insert([{
        ...contact,
        owner_id: user.id
      }])
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      }));
  }

  updateContact(id: number, updates: Partial<Contact>): Observable<Contact> {
    return from(this.supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        return data;
      }));
  }

  deleteContact(id: number): Observable<void> {
    return from(this.supabase
      .from('contacts')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) throw error;
      }));
  }
}
