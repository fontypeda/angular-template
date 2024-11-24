import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.isAuthenticated().pipe(
    take(1),
    map(authenticated => {
      if (authenticated) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};

export const roleGuard = (requiredRole: string) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return authService.hasRole(requiredRole).pipe(
    take(1),
    map(hasRole => {
      if (hasRole) {
        return true;
      } else {
        router.navigate(['/unauthorized']);
        return false;
      }
    })
  );
};
