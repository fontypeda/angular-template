import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../primeng.module';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    AsyncPipe,
    FormsModule,
    PrimeNgModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  darkMode = false;
  mobileMenuOpen = false;

  constructor(public themeService: ThemeService) {
    this.themeService.darkMode$.subscribe(
      isDark => this.darkMode = isDark
    );
  }

  toggleDarkMode(): void {
    this.themeService.toggleDarkMode();
  }
}
