import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
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

        <!-- Main Content Area -->
        <main class="flex-1 p-4">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Footer (fixed at bottom) -->
      <footer class="sticky bottom-0 z-50 bg-surface-0 shadow-sm h-[50px]">
        <app-footer></app-footer>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    :host ::ng-deep {
      /* Ensure header has consistent height */
      app-header {
        display: block;
        height: 64px;
      }

      /* Make sidebar fill available height */
      app-sidebar {
        display: block;
        height: calc(100vh - 114px); /* viewport height minus header and footer */
        position: relative;
      }

      /* Footer styles */
      app-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
      }
    }
  `]
})
export class DashboardComponent {}
