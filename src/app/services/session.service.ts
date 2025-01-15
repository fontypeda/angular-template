import { Injectable } from '@angular/core';
import { AuthSession } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly SESSION_KEY = 'app_session';
  private readonly SESSION_EXPIRY_KEY = 'app_session_expiry';
  private readonly REMEMBER_ME_KEY = 'app_remember_me';
  private readonly DEFAULT_SESSION_DURATION = 24 * 60 * 60; // 24 hours in seconds
  private readonly EXTENDED_SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds

  constructor() {}

  saveSession(session: AuthSession, rememberMe: boolean = false): void {
    if (!session) return;
    
    // Store remember me preference
    localStorage.setItem(this.REMEMBER_ME_KEY, JSON.stringify(rememberMe));
    
    // Calculate expiry based on remember me preference
    const expiryTime = new Date();
    const sessionDuration = rememberMe ? 
      this.EXTENDED_SESSION_DURATION : 
      this.DEFAULT_SESSION_DURATION;
    
    expiryTime.setSeconds(expiryTime.getSeconds() + sessionDuration);
    
    // Use sessionStorage for temporary sessions and localStorage for remembered sessions
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem(this.SESSION_KEY, JSON.stringify(session));
    storage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toISOString());
  }

  getSession(): AuthSession | null {
    // Try sessionStorage first, then localStorage
    const sessionStr = sessionStorage.getItem(this.SESSION_KEY) || 
                      localStorage.getItem(this.SESSION_KEY);
    const expiryStr = sessionStorage.getItem(this.SESSION_EXPIRY_KEY) || 
                      localStorage.getItem(this.SESSION_EXPIRY_KEY);
    
    if (!sessionStr || !expiryStr) return null;
    
    // Check if session is expired
    const expiry = new Date(expiryStr);
    if (expiry <= new Date()) {
      this.clearSession();
      return null;
    }
    
    try {
      return JSON.parse(sessionStr);
    } catch {
      this.clearSession();
      return null;
    }
  }

  clearSession(): void {
    // Clear from both storage types
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem(this.SESSION_EXPIRY_KEY);
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.SESSION_EXPIRY_KEY);
    localStorage.removeItem(this.REMEMBER_ME_KEY);
  }

  isSessionValid(): boolean {
    const session = this.getSession();
    return !!session;
  }

  isRememberMeEnabled(): boolean {
    try {
      return JSON.parse(localStorage.getItem(this.REMEMBER_ME_KEY) || 'false');
    } catch {
      return false;
    }
  }
}
