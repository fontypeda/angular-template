import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkMode.asObservable();

  constructor() {
    // Check if user prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.toggleDarkMode(true);
    }

    // Listen for changes in system dark mode preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.toggleDarkMode(e.matches);
    });
  }

  toggleDarkMode(isDark?: boolean) {
    const dark = isDark ?? !this.darkMode.value;
    this.darkMode.next(dark);
    
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
