import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,

    title: 'Home',
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./components/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
    canActivate: [() => roleGuard('admin')],
    title: 'Admin',
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/auth/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
    title: 'Profile',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'Login',
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/auth/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
    title: 'Unauthorized',
  },
  {
    path: 'primeComponents',
    loadComponent: () =>
      import('./components/test/test.component').then((m) => m.TestComponent),
    canActivate: [authGuard],
    title: 'primeComponents',
  },
  {
    path: '404',
    loadComponent: () =>
      import('./components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    title: '404 Not Found',
  },
  {
    path: '**',
    redirectTo: '404',
    pathMatch: 'full',
  },
];
