import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../shared/primeng.module';
import { AuthService, UserPreferences } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeNgModule],
  template: `
    <div class="p-4 max-w-3xl mx-auto">
      <div class="card">
        <h2 class="text-2xl font-bold mb-4">Settings</h2>
        
        <!-- Appearance Section -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-3">Appearance</h3>
          <div class="flex align-items-center">
            <p-selectButton
              [options]="themeOptions"
              [(ngModel)]="selectedTheme"
              (onChange)="onThemeChange()"
              optionLabel="label"
              optionValue="value"
            ></p-selectButton>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-3">Notifications</h3>
          <div class="flex flex-column gap-3">
            <div class="flex align-items-center">
              <p-checkbox
                [(ngModel)]="notificationSettings.email"
                [binary]="true"
                inputId="emailNotif"
              ></p-checkbox>
              <label for="emailNotif" class="ml-2">Email Notifications</label>
            </div>
            <div class="flex align-items-center">
              <p-checkbox
                [(ngModel)]="notificationSettings.push"
                [binary]="true"
                inputId="pushNotif"
              ></p-checkbox>
              <label for="pushNotif" class="ml-2">Push Notifications</label>
            </div>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-3">Privacy</h3>
          <div class="flex flex-column gap-3">
            <div class="flex align-items-center">
              <p-checkbox
                [(ngModel)]="privacySettings.profileVisible"
                [binary]="true"
                inputId="profileVisibility"
              ></p-checkbox>
              <label for="profileVisibility" class="ml-2">Public Profile</label>
            </div>
            <div class="flex align-items-center">
              <p-checkbox
                [(ngModel)]="privacySettings.activityVisible"
                [binary]="true"
                inputId="activityVisibility"
              ></p-checkbox>
              <label for="activityVisibility" class="ml-2">Show Activity Status</label>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex justify-content-end">
          <button 
            pButton 
            label="Save Changes"
            icon="pi pi-check"
            (click)="saveSettings()"
            [loading]="saving"
          ></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SettingsComponent implements OnInit {
  themeOptions = [
    { label: 'Light', value: 'light', icon: 'pi pi-sun' },
    { label: 'Dark', value: 'dark', icon: 'pi pi-moon' }
  ];

  selectedTheme: 'light' | 'dark' = 'light';
  saving = false;

  notificationSettings = {
    email: false,
    push: false
  };

  privacySettings = {
    profileVisible: true,
    activityVisible: true
  };

  constructor(
    private authService: AuthService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Load user preferences
    this.authService.currentUser.subscribe(user => {
      if (user?.profile?.preferences) {
        const prefs = user.profile.preferences;
        this.selectedTheme = prefs.theme === 'dark' ? 'dark' : 'light';
        this.notificationSettings = {
          email: prefs.emailNotifications ?? false,
          push: prefs.pushNotifications ?? false
        };
        this.privacySettings = {
          profileVisible: prefs.publicProfile ?? true,
          activityVisible: prefs.showActivity ?? true
        };
      }
    });

    // Set initial theme based on service
    this.selectedTheme = this.themeService.isDarkMode() ? 'dark' : 'light';
  }

  onThemeChange() {
    this.themeService.toggleDarkMode(this.selectedTheme === 'dark');
  }

  async saveSettings() {
    this.saving = true;
    try {
      const preferences: UserPreferences = {
        theme: this.selectedTheme,
        emailNotifications: this.notificationSettings.email,
        pushNotifications: this.notificationSettings.push,
        publicProfile: this.privacySettings.profileVisible,
        showActivity: this.privacySettings.activityVisible
      };

      await this.authService.updateProfile({ preferences });
      this.saving = false;
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.saving = false;
    }
  }
}
