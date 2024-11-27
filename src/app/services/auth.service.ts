import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, delay } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  roles: string[];
  name: string;
}

interface TestUser {
  email: string;
  password: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = new BehaviorSubject<boolean>(false);
  private userRoles = new BehaviorSubject<string[]>([]);
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  // Test users data
  private readonly testUsers: TestUser[] = [
    {
      email: 'admin@example.com',
      password: 'admin123',
      user: {
        id: '1',
        email: 'admin@example.com',
        roles: ['admin', 'user'],
        name: 'Admin User'
      }
    },
    {
      email: 'user@example.com',
      password: 'user123',
      user: {
        id: '2',
        email: 'user@example.com',
        roles: ['user'],
        name: 'Regular User'
      }
    }
  ];

  constructor() {
    this.currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
    this.currentUser = this.currentUserSubject.asObservable();
    // Check for existing session
    this.checkSession();
  }

  private checkSession() {
    const session = localStorage.getItem('session');
    if (session) {
      try {
        const { authenticated, roles } = JSON.parse(session);
        this.authenticated.next(authenticated);
        this.userRoles.next(roles || []);
      } catch (e) {
        this.clearSession();
      }
    }
  }

  private saveSession(authenticated: boolean, roles: string[] = []) {
    const session = { authenticated, roles };
    localStorage.setItem('session', JSON.stringify(session));
    this.authenticated.next(authenticated);
    this.userRoles.next(roles);
  }

  private clearSession() {
    localStorage.removeItem('session');
    this.authenticated.next(false);
    this.userRoles.next([]);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password: string): Observable<boolean> {
    // Find test user
    const testUser = this.testUsers.find(u => u.email === email && u.password === password);

    if (testUser) {
      // Simulate API delay
      return of(true).pipe(
        delay(1000),
        map(() => {
          const { user } = testUser;
          this.saveSession(true, user.roles);
          this.currentUserSubject.next(user);
          return true;
        })
      );
    }

    // Return error for invalid credentials
    return throwError(() => new Error('Invalid email or password'));
  }

  async logout(): Promise<void> {
    // Clear session first
    this.clearSession();
    this.currentUserSubject.next(null);
    // Add a small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  isAuthenticated(): Observable<boolean> {
    return this.authenticated.asObservable();
  }

  hasRole(role: string): Observable<boolean> {
    return this.userRoles.pipe(
      map(roles => roles.includes(role))
    );
  }

  private getUserFromStorage(): User | null {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  }
}
