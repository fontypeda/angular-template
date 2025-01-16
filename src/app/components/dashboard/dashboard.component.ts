import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { PageHeaderComponent } from '../../layouts/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    PageHeaderComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-surface-50">
      <!-- Header (fixed at top) -->
      <header class="sticky top-0 z-50 bg-surface-0 shadow-sm">
        <app-header></app-header>
      </header>

      <!-- Middle section with sidebar and main content -->
      <div class="flex flex-1">
        <!-- Sidebar -->
        <aside class="w-[80px] bg-surface-0 shadow-sm">
          <app-sidebar></app-sidebar>
        </aside>

        <!-- Main content -->
        <main class="flex-1 p-4 sm:p-16 lg:p-24 xl:p-32">
          <div class="max-w-8xl mx-auto">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Footer -->
      <footer class="bg-surface-0 shadow-sm">
        <app-footer></app-footer>
      </footer>
    </div>
  `,
  styles: []
})
export class DashboardComponent {}
