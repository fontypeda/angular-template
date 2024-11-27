import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import myTheme from './theme.config';
import { ThemeService } from './services/theme.service';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    FooterComponent,
    ToastModule,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  themeService = inject(ThemeService);
  messageService = inject(MessageService);

  constructor(private config: PrimeNG) {
    // Default theme configuration
    this.config.theme.set({
      preset: myTheme,
      options: {
        ripple: true,
        inputStyle: 'filled',
      },
    });
  }
}
