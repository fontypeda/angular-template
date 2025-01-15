import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MenuModule, ButtonModule, SidebarModule, TooltipModule],
  template: `
    <div class="h-full flex flex-col">
      <!-- Fixed icon container -->
      <div class="fixed w-[80px] bg-surface-0 flex flex-col items-center py-4">
        <div class="menu-items flex flex-col gap-4">
          @for (item of menuItems; track item.label) {
            <button 
              pButton
              [icon]="item.icon!"
              pRipple="false"
              class="p-button-text p-button-rounded w-12 h-12"
              [class.!bg-surface-700]="isActive(item.routerLink!)"
              [class.!text-white]="isActive(item.routerLink!)"
              (click)="navigate(item.routerLink!)"
              [pTooltip]="item.label!"
              tooltipPosition="right">
            </button>
          }
        </div>
      </div>

      <!-- Scrollable content area (if needed in the future) -->
      <div class="flex-1 overflow-y-auto mt-[300px]">
        <!-- Future scrollable content can go here -->
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-button.p-button-text {
        background: transparent;
        border: none;
      }

      .p-button-text:not(:disabled):hover {
        background: #eef2f6 !important;
      }
    }
  `]
})
export class SidebarComponent {
  menuItems: MenuItem[] = [
    {
      label: 'Search',
      icon: 'pi pi-search',
      routerLink: '/search'
    },
    {
      label: 'Upload',
      icon: 'pi pi-upload',
      routerLink: '/upload'
    },
    {
      label: 'Stats',
      icon: 'pi pi-chart-bar',
      routerLink: '/stats'
    },
    {
      label: 'Playlists',
      icon: 'pi pi-list',
      routerLink: '/playlists'
    },
    {
      label: 'Contacts',
      icon: 'pi pi-users',
      routerLink: '/contacts'
    }
  ];

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
