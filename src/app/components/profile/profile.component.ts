import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimeNgModule } from '../../shared/primeng.module';
import { AuthService, User, UserProfile } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeNgModule],
  template: `
    <div class="p-4 max-w-3xl mx-auto">
      <div class="card">
        <h2 class="text-2xl font-bold mb-4">Profile Settings</h2>
        
        <div class="grid" *ngIf="currentUser">
          <!-- Avatar Section -->
          <div class="col-12 mb-4 flex flex-column align-items-center">
            <img 
              [src]="currentUser.profile?.avatar_url || 'assets/default-avatar.svg'" 
              [alt]="currentUser.profile?.full_name"
              class="w-10rem h-10rem rounded-full mb-3 border-2 border-primary"
            />
            <button 
              pButton 
              label="Change Avatar" 
              icon="pi pi-camera"
              class="p-button-outlined"
              (click)="onAvatarUpload()"
            ></button>
          </div>

          <!-- Profile Form -->
          <div class="col-12 md:col-6 mb-3">
            <label for="username" class="block mb-2">Username</label>
            <input 
              id="username"
              type="text"
              pInputText 
              [(ngModel)]="profile.username"
              class="w-full"
            />
          </div>

          <div class="col-12 md:col-6 mb-3">
            <label for="fullName" class="block mb-2">Full Name</label>
            <input 
              id="fullName"
              type="text"
              pInputText 
              [(ngModel)]="profile.full_name"
              class="w-full"
            />
          </div>

          <div class="col-12 mb-3">
            <label for="email" class="block mb-2">Email</label>
            <input 
              id="email"
              type="email"
              pInputText 
              [value]="currentUser.email"
              disabled
              class="w-full"
            />
          </div>



          <!-- Save Button -->
          <div class="col-12 flex justify-content-end">
            <button 
              pButton 
              label="Save Changes"
              icon="pi pi-check"
              (click)="saveProfile()"
              [loading]="saving"
            ></button>
          </div>
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
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  profile: Partial<UserProfile> = {
    username: '',
    full_name: '',
    avatar_url: '',
  };
  saving = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.profile = {
          ...this.profile,
          ...user.profile,
          preferences: {
            ...this.profile.preferences,
            ...user.profile?.preferences
          }
        };
      }
    });
  }

  async saveProfile() {
    if (!this.currentUser) return;
    
    this.saving = true;
    try {
      await this.authService.updateProfile(this.profile);
    } finally {
      this.saving = false;
    }
  }

  onAvatarUpload() {
    // TODO: Implement avatar upload functionality
    console.log('Avatar upload clicked');
  }
}
