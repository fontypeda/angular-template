import { Component } from '@angular/core';
import { ThemeService } from '../../services/theme.service';
import { PrimeNgModule } from '../../primeng.module';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [PrimeNgModule, AsyncPipe, RouterLink],
  template: `
    <header class="border-b border-gray-200 dark:border-gray-700 bg-theme-bg dark:bg-theme-bg-dark">
      <nav class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex h-16 items-center justify-between">
          <!-- Logo and Navigation -->
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-2xl font-bold text-primary-600 dark:text-primary-400">
                App Logo
              </h1>
            </div>
            <div class="hidden md:block ml-10">
              <div class="flex items-baseline space-x-4">
                <a routerLink="/" 
                   class="text-theme-text dark:text-theme-text-dark hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
                   routerLinkActive="text-primary-600 dark:text-primary-400">
                  Home
                </a>
                <a routerLink="/features" 
                   class="text-theme-text dark:text-theme-text-dark hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
                   routerLinkActive="text-primary-600 dark:text-primary-400">
                  Features
                </a>
              </div>
            </div>
          </div>

          <!-- Right side controls -->
          <div class="flex items-center space-x-4">
            <!-- Theme Toggle -->
            <div class="flex items-center">
              <p-inputSwitch 
                [(ngModel)]="darkMode" 
                (onChange)="toggleDarkMode()"
                class="mr-2">
              </p-inputSwitch>
              <span class="text-sm text-theme-text dark:text-theme-text-dark">
                {{ (themeService.darkMode$ | async) ? 'Dark' : 'Light' }} Mode
              </span>
            </div>

            <!-- Mobile menu button -->
            <button type="button" 
                    (click)="mobileMenuOpen = !mobileMenuOpen"
                    class="md:hidden rounded-md p-2 text-theme-text dark:text-theme-text-dark hover:bg-gray-100 dark:hover:bg-gray-800">
              <span class="sr-only">Open main menu</span>
              <i class="pi pi-bars text-xl"></i>
            </button>
          </div>
        </div>

        <!-- Mobile menu -->
        <div class="md:hidden" [class.hidden]="!mobileMenuOpen">
          <div class="space-y-1 px-2 pb-3 pt-2">
            <a routerLink="/" 
               class="block text-theme-text dark:text-theme-text-dark hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-base font-medium"
               routerLinkActive="text-primary-600 dark:text-primary-400"
               (click)="mobileMenuOpen = false">
              Home
            </a>
            <a routerLink="/features" 
               class="block text-theme-text dark:text-theme-text-dark hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-base font-medium"
               routerLinkActive="text-primary-600 dark:text-primary-400"
               (click)="mobileMenuOpen = false">
              Features
            </a>
          </div>
        </div>
      </nav>
    </header>
  `,
  styles: []
})
export class HeaderComponent {
  darkMode = false;
  mobileMenuOpen = false;

  constructor(public themeService: ThemeService) {
    this.themeService.darkMode$.subscribe(isDark => {
      this.darkMode = isDark;
    });
  }

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }
}
