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
    path: 'test',
    component: TestComponent,
    title: 'Test'
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];
