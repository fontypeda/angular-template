import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PrimeNgModule } from '../../shared/primeng.module';
import { AuthService, User } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import { GradientService } from '../../services/gradient.service';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, PrimeNgModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription | null = null;
  currentUser: User | null = null;
  avatarGradient: SafeStyle | null = null;

  userMenuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: 'pi pi-user',
      routerLink: '/profile',
    },
    {
      separator: true
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      routerLink: '/settings',
    },
    {
      separator: true
    },
    {
      label: 'Logout',
      icon: 'pi pi-sign-out',
      command: () => this.logout(),
    },
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService,
    private gradientService: GradientService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
      console.log('Current user:', user);
      if (user) {
        // Always generate gradient as fallback
        const seed = user.email || 'default';
        this.avatarGradient = this.sanitizer.bypassSecurityTrustStyle(
          `background: ${this.gradientService.generateRandomPastelGradient()}`
        );
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getAvatarStyle(): SafeStyle | null {
    if (this.currentUser?.profile?.avatar_url) {
      return null;
    }
    return this.avatarGradient;
  }

  getAvatarUrl(): string | null {
    return this.currentUser?.profile?.avatar_url || null;
  }

  getDisplayName(): string {
    return this.currentUser?.email || '';
  }

  getUserInitials(): string {
    const email = this.currentUser?.email || '';
    return email.charAt(0).toUpperCase();
  }
}
