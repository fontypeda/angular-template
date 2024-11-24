import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PrimeNgModule } from '../../../primeng.module';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimeNgModule],
  template: `
    <div class="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div class="w-full max-w-md">
        <p-card header="Login" class="shadow-lg">
          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Email</label>
            <input id="email" type="email" pInputText [(ngModel)]="email" class="w-full" />
          </div>
          <div class="mb-6">
            <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-200">Password</label>
            <p-password id="password" [(ngModel)]="password" [toggleMask]="true" class="w-full"></p-password>
          </div>
          <div class="flex justify-between items-center">
            <p-button label="Login" (onClick)="onLogin()" [loading]="loading"></p-button>
            <p-button label="Register" styleClass="p-button-secondary" (onClick)="onRegister()"></p-button>
          </div>
        </p-card>
      </div>
    </div>
  `
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    if (!this.email || !this.password) {
      return;
    }

    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  onRegister(): void {
    // TODO: Implement registration logic or navigation
    this.router.navigate(['/register']);
  }
}
