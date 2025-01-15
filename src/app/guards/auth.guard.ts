import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { SessionService } from '../services/session.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private router: Router,
    private messageService: MessageService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // First check if we have a valid session
    if (!this.sessionService.isSessionValid()) {
      this.handleAuthFailure('Session expired. Please log in again.', state.url);
      return of(false);
    }

    return this.authService.currentUser.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          this.handleAuthFailure('Please log in to access this page', state.url);
          return of(false);
        }

        // Check role if specified
        const requiredRole = route.data['role'];
        if (requiredRole && user.profile?.role !== requiredRole) {
          this.messageService.add({
            severity: 'error',
            summary: 'Access Denied',
            detail: `You need ${requiredRole} role to access this page`,
            life: 5000
          });
          this.router.navigate(['/unauthorized']);
          return of(false);
        }

        // Check additional permissions if specified
        const requiredPermissions = route.data['permissions'] as string[];
        if (requiredPermissions?.length > 0) {
          const userPermissions = user.profile?.permissions || [];
          const hasAllPermissions = requiredPermissions.every(
            permission => userPermissions.includes(permission)
          );

          if (!hasAllPermissions) {
            this.messageService.add({
              severity: 'error',
              summary: 'Access Denied',
              detail: 'You do not have the required permissions',
              life: 5000
            });
            this.router.navigate(['/unauthorized']);
            return of(false);
          }
        }

        return of(true);
      })
    );
  }

  private handleAuthFailure(message: string, returnUrl: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Access Denied',
      detail: message,
      life: 5000
    });
    this.router.navigate(['/auth/login'], {
      queryParams: { returnUrl }
    });
  }
}
