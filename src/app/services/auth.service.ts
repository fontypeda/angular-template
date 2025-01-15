import { Injectable } from '@angular/core';
import { SupabaseClient, User as SupabaseUser, createClient, AuthSession } from '@supabase/supabase-js';
import { BehaviorSubject, Observable, from, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { SessionService } from './session.service';

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  publicProfile?: boolean;
  showActivity?: boolean;
}

export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  permissions?: string[];
  preferences?: UserPreferences;
}

export interface User extends SupabaseUser {
  profile?: UserProfile;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase: SupabaseClient;
  private userSubject = new BehaviorSubject<User | null>(null);
  currentUser = this.userSubject.asObservable();

  constructor(
    private router: Router,
    private messageService: MessageService,
    private sessionService: SessionService
  ) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Check for existing session
    const { data: { session }, error } = await this.supabase.auth.getSession();
    
    if (session) {
      await this.handleAuthSession(session);
    }

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await this.handleAuthSession(session);
      } else if (event === 'SIGNED_OUT') {
        this.sessionService.clearSession();
        this.userSubject.next(null);
      }
    });
  }

  private async handleAuthSession(session: AuthSession) {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Create user object with profile
      const user: User = {
        ...session.user,
        profile: profile || {
          id: session.user.id,
          username: session.user.email?.split('@')[0],
          created_at: new Date().toISOString()
        }
      };

      this.userSubject.next(user);
    } catch (error) {
      console.error('Error handling auth session:', error);
    }
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<void> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.session) {
        this.sessionService.saveSession(data.session, rememberMe);
        await this.handleAuthSession(data.session);
        
        this.messageService.add({
          severity: 'success',
          summary: 'Welcome back!',
          detail: 'You have successfully logged in.',
          life: 3000
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.message || 'An error occurred during login.',
        life: 5000
      });
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      
      this.sessionService.clearSession();
      this.userSubject.next(null);
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      console.error('Logout error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Logout Failed',
        detail: error.message || 'An error occurred during logout.',
        life: 5000
      });
    }
  }

  getSession(): Observable<AuthSession | null> {
    return from(this.supabase.auth.getSession().then(({ data }) => data.session));
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser.pipe(
      map(user => !!user)
    );
  }

  getSupabaseClient(): SupabaseClient {
    return this.supabase;
  }

  getCurrentUserValue(): User | null {
    return this.userSubject.value;
  }

  async handleAuthCallback(): Promise<void> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      
      if (!session) {
        throw new Error('No session found after callback');
      }

      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') || '/';
      await this.router.navigate([next]);
    } catch (error) {
      console.error('Auth callback error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Authentication failed. Please try again.',
        life: 5000
      });
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`
      });

      if (error) throw error;

      this.messageService.add({
        severity: 'success',
        summary: 'Email Sent',
        detail: 'If an account exists with this email, you will receive a password reset link shortly.',
        life: 8000
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to send reset email',
        life: 5000
      });
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      await this.supabase.auth.signOut();
      this.userSubject.next(null);

      this.messageService.add({
        severity: 'success',
        summary: 'Password Updated',
        detail: 'Your password has been successfully updated. Please log in with your new password.',
        life: 5000
      });
    } catch (error: any) {
      console.error('Password update error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to update password',
        life: 5000
      });
      throw error;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const user = this.userSubject.value;
      if (!user) throw new Error('No user logged in');

      const { data, error } = await this.supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const updatedUser: User = {
        ...user,
        profile: {
          ...user.profile,
          ...updates
        } as UserProfile
      };
      this.userSubject.next(updatedUser);

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Profile updated successfully',
        life: 3000
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: error.message || 'Failed to update profile',
        life: 5000
      });
      throw error;
    }
  }
}
