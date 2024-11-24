import { Routes } from '@angular/router';
import { TestComponent } from './components/test/test.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    component: TestComponent,
    title: 'Home'
  },
  {
    path: 'features',
    loadChildren: () => import('./features/features.module').then(m => m.FeaturesModule),
    title: 'Features'
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then(m => m.AboutModule),
    title: 'About'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
