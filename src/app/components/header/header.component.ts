import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

interface MenuItemWithIcon {
  label: string;
  icon: string;
  routerLink: string[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, MenuModule, ToastModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  // Authentication state
  isAuthenticated$ = this.authService.isAuthenticated();
  userName = 'John Doe'; // Replace with actual user name from auth service
  userImageUrl = '/assets/images/avatar.jpg'; // Replace with actual user image

  // Show login button only when not on login page
  showLoginButton$ = this.router.events.pipe(
    map(() => !this.router.url.includes('/login'))
  );

  // Menu items for authenticated users
  authenticatedMenuItems: MenuItemWithIcon[] = [
    {
      label: 'Admin',
      icon: 'pi pi-cog',
      routerLink: ['/admin'],
    },
    {
      label: 'PrimeComponents',
      icon: 'pi pi-cog',
      routerLink: ['/primeComponents'],
    },
  ];

  // Menu items for public users
  publicMenuItems: MenuItemWithIcon[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: ['/'],
    },
    {
      label: 'About',
      icon: 'pi pi-info-circle',
      routerLink: ['/about'],
    },
  ];

  // Profile menu items
  profileItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      command: () => this.router.navigate(['/profile']),
    },
    // {
    //   label: 'Settings',
    //   icon: 'pi pi-cog',
    //   command: () => this.router.navigate(['/settings']),
    // },
    {
      separator: true,
    },
    {
      label: 'Sign out',
      icon: 'pi pi-power-off',
      command: () => this.logout(),
    },
  ];

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }
}
