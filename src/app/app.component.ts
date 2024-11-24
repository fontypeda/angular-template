import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PrimeNG } from 'primeng/config';
import myTheme from './theme.config';
import { PrimeNgModule } from './primeng.module';
import { TestComponent } from './components/test/test.component';
import { ThemeService } from './services/theme.service';
import { AsyncPipe } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    PrimeNgModule,
    TestComponent,
    AsyncPipe,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-template';

  constructor(
    private config: PrimeNG,
    public themeService: ThemeService
  ) {
    // Default theme configuration
    this.config.theme.set({
      preset: myTheme,
      options: {
        prefix: 'p',
        darkModeSelector: '.dark',
        cssLayer: {
          name: 'primeng',
          order: 'tailwind-base, primeng, tailwind-utilities'
        }
      }
    });
  }
}
