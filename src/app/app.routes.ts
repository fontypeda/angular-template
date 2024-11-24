import { Routes } from '@angular/router';
import { TestComponent } from './components/test/test.component';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: TestComponent,
    canActivate: [authGuard],
    title: 'Home'
  },
  {
    path: 'admin',
    loadChildren: () => import('./components/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [() => roleGuard('admin')],
    title: 'Admin'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login'
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./components/auth/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent),
    title: 'Unauthorized'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
