import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import { ThemeService } from './services/theme.service';
import { primaryColors } from './config/colors';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
    colorScheme: {
      light: {
        primary: {
          main: '{zinc.800}',
          surface: '{zinc.50}',
          border: '{zinc.200}',
          hover: '{zinc.100}',
        },
      },
      dark: {
        primary: {
          main: '{zinc.200}',
          surface: '{zinc.800}',
          border: '{zinc.700}',
          hover: '{zinc.900}',
        },
      },
    },
  },
});

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
  ],
  template: `
    <div class="min-h-screen">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class AppComponent {
  themeService = inject(ThemeService);
  messageService = inject(MessageService);

  constructor(private config: PrimeNG) {
    // Default theme configuration
    this.config.theme.set({
      preset: MyPreset,
      options: {
        darkModeSelector: '.dark',
        cssLayer: {
          name: 'primeng',
          order: 'tailwind-base, primeng, tailwind-utilities',
        },
      },
      semantic: {
        primary: primaryColors,
      },
    });
  }
}
