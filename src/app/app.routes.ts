import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'playlists',
        pathMatch: 'full',
      },
      {
        path: 'search',
        loadComponent: () =>
          import('./pages/search/search.component').then((m) => m.SearchComponent),
        title: 'Search',
      },
      {
        path: 'playlists',
        loadComponent: () =>
          import('./pages/playlists/playlists.component').then((m) => m.PlaylistsComponent),
        title: 'Playlists',
      },
      {
        path: 'stats',
        loadComponent: () =>
          import('./pages/stats/stats.component').then((m) => m.StatsComponent),
        title: 'Stats',
      },
      {
        path: 'contacts',
        loadComponent: () =>
          import('./pages/contacts/contacts.component').then((m) => m.ContactsComponent),
        title: 'Contacts',
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./pages/upload/upload.component').then((m) => m.UploadComponent),
        title: 'Upload',
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./components/settings/settings.component').then((m) => m.SettingsComponent),
        title: 'Settings',
      },
      {
        path: 'test',
        loadComponent: () =>
          import('./components/test/test.component').then((m) => m.TestComponent),
        title: 'API Test Dashboard',
      }
    ],
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./components/auth/login/login.component').then((m) => m.LoginComponent),
        title: 'Login',
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('./components/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent
          ),
        title: 'Reset Password',
      },
      {
        path: 'callback',
        loadComponent: () =>
          import('./components/auth/callback/auth-callback.component').then(
            (m) => m.AuthCallbackComponent
          ),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    loadComponent: () =>
      import('./components/not-found/not-found.component').then((m) => m.NotFoundComponent),
    title: '404 Not Found',
  },
];
