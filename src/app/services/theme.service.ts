import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    // Always start with light mode
    this.toggleDarkMode(false);
  }

  toggleDarkMode(force?: boolean) {
    const newValue = force !== undefined ? force : !this.darkModeSubject.value;
    this.darkModeSubject.next(newValue);
    document.documentElement.classList.toggle('dark', newValue);
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.darkModeSubject.value ? 'dark' : 'light';
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
}
