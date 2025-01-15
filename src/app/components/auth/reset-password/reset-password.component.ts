import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PrimeNgModule } from '../../../shared/primeng.module';
import { AuthService } from '../../../services/auth.service';
import { MessageService } from 'primeng/api';
import { AuthSession } from '@supabase/supabase-js';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, PrimeNgModule],
  template: `
    <div class="flex h-screen">
      <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div class="mx-auto w-full max-w-sm lg:w-96">
          <div class="text-center">
            <h2 class="mt-8 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {{ isRequestMode ? 'Reset Password' : 'Update Password' }}
            </h2>
            <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {{ isRequestMode ? 'Enter your email to receive a password reset link' : 'Enter your new password' }}
            </p>
          </div>

          <div class="mt-10">
            <form [formGroup]="resetForm" (ngSubmit)="onSubmit()" class="space-y-6">
              <ng-container *ngIf="isRequestMode">
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-900 dark:text-gray-200">
                    Email
                  </label>
                  <div class="mt-2">
                    <input
                      pInputText
                      id="email"
                      type="email"
                      formControlName="email"
                      class="w-full"
                      [ngClass]="{
                        'ng-invalid ng-dirty': resetForm.get('email')?.invalid && resetForm.get('email')?.touched
                      }"
                    />
                    <small
                      class="text-red-500"
                      *ngIf="resetForm.get('email')?.errors?.['required'] && resetForm.get('email')?.touched"
                    >
                      Email is required
                    </small>
                    <small
                      class="text-red-500"
                      *ngIf="resetForm.get('email')?.errors?.['email'] && resetForm.get('email')?.touched"
                    >
                      Please enter a valid email
                    </small>
                  </div>
                </div>
              </ng-container>

              <ng-container *ngIf="!isRequestMode">
                <div>
                  <label for="password" class="block text-sm font-medium text-gray-900 dark:text-gray-200">
                    New Password
                  </label>
                  <div class="mt-2">
                    <p-password
                      id="password"
                      formControlName="password"
                      [toggleMask]="true"
                      [feedback]="true"
                      [style]="{ width: '100%' }"
                      [inputStyle]="{ width: '100%' }"
                      styleClass="w-full"
                      [ngClass]="{
                        'ng-invalid ng-dirty': resetForm.get('password')?.invalid && resetForm.get('password')?.touched
                      }"
                    ></p-password>
                    <small
                      class="text-red-500"
                      *ngIf="resetForm.get('password')?.errors?.['required'] && resetForm.get('password')?.touched"
                    >
                      Password is required
                    </small>
                    <small
                      class="text-red-500"
                      *ngIf="resetForm.get('password')?.errors?.['minlength'] && resetForm.get('password')?.touched"
                    >
                      Password must be at least 8 characters
                    </small>
                  </div>
                </div>

                <div>
                  <label for="confirmPassword" class="block text-sm font-medium text-gray-900 dark:text-gray-200">
                    Confirm Password
                  </label>
                  <div class="mt-2">
                    <p-password
                      id="confirmPassword"
                      formControlName="confirmPassword"
                      [toggleMask]="true"
                      [feedback]="false"
                      [style]="{ width: '100%' }"
                      [inputStyle]="{ width: '100%' }"
                      styleClass="w-full"
                      [ngClass]="{
                        'ng-invalid ng-dirty':
                          resetForm.get('confirmPassword')?.invalid && resetForm.get('confirmPassword')?.touched
                      }"
                    ></p-password>
                    <small
                      class="text-red-500"
                      *ngIf="resetForm.get('confirmPassword')?.errors?.['required'] && resetForm.get('confirmPassword')?.touched"
                    >
                      Please confirm your password
                    </small>
                    <small class="text-red-500" *ngIf="resetForm.errors?.['passwordMismatch']">
                      Passwords do not match
                    </small>
                  </div>
                </div>
              </ng-container>

              <div>
                <button
                  pButton
                  type="submit"
                  [label]="isRequestMode ? 'Send Reset Link' : 'Update Password'"
                  [loading]="loading"
                  [disabled]="resetForm.invalid || loading"
                  class="w-full"
                ></button>
              </div>

              <div class="text-center">
                <a routerLink="/auth/login" class="text-sm text-primary-500 hover:text-primary-400">
                  Back to Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="relative hidden w-0 flex-1 lg:block">
        <div
          class="absolute inset-0 h-full w-full bg-cover bg-center"
          style="background-image: url('assets/images/bg.jpg')"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .p-password {
        width: 100%;
        
        input {
          width: 100%;
        }
      }
      
      .p-progress-spinner {
        width: 50px;
        height: 50px;
        
        .p-progress-spinner-circle {
          animation: custom-progress-spinner-dash 1.5s ease-in-out infinite;
        }
      }
      
      @keyframes custom-progress-spinner-dash {
        0% {
          stroke-dasharray: 1, 200;
          stroke-dashoffset: 0;
        }
        50% {
          stroke-dasharray: 89, 200;
          stroke-dashoffset: -35px;
        }
        100% {
          stroke-dasharray: 89, 200;
          stroke-dashoffset: -124px;
        }
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  loading = false;
  isRequestMode = true;
  maxAttempts = 3;
  currentAttempts = 0;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private messageService: MessageService
  ) {
    this.resetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if we have a session (coming from callback)
    this.authService.getSession().subscribe((session: AuthSession | null) => {
      if (session) {
        this.isRequestMode = false;
        
        // Only validate password fields in update mode
        this.resetForm.get('email')?.clearValidators();
        this.resetForm.get('email')?.updateValueAndValidity();
        
        this.messageService.add({
          severity: 'info',
          summary: 'Set New Password',
          detail: 'Please enter and confirm your new password. It must be at least 8 characters long.',
          life: 6000,
          sticky: true
        });
      } else {
        // Only validate email in request mode
        this.resetForm.get('password')?.clearValidators();
        this.resetForm.get('confirmPassword')?.clearValidators();
        this.resetForm.get('password')?.updateValueAndValidity();
        this.resetForm.get('confirmPassword')?.updateValueAndValidity();
      }
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  private async handleError(error: any, context: string) {
    console.error(`Reset password error (${context}):`, error);
    this.currentAttempts++;
    
    let message = 'An unexpected error occurred';
    let sticky = false;

    switch (context) {
      case 'token-expired':
        message = 'Your password reset link has expired. Please request a new one.';
        sticky = true;
        break;
      case 'token-invalid':
        message = 'Invalid password reset link. Please request a new one.';
        sticky = true;
        break;
      case 'password-requirements':
        message = 'Password must be at least 8 characters long and include a mix of letters and numbers.';
        break;
      case 'email-not-found':
        message = 'If an account exists with this email, you will receive a reset link.';
        break;
      default:
        message = error?.message || 'Failed to process your request. Please try again.';
    }

    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: sticky ? 0 : 5000,
      sticky
    });

    if (this.currentAttempts >= this.maxAttempts) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Too Many Attempts',
        detail: 'You have exceeded the maximum number of attempts. Please try again later.',
        life: 0,
        sticky: true
      });
      await this.router.navigate(['/auth/login']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.resetForm.invalid) {
      Object.keys(this.resetForm.controls).forEach(key => {
        const control = this.resetForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      
      if (this.resetForm.hasError('passwordMismatch')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Passwords do not match',
          life: 5000
        });
      }
      return;
    }

    this.loading = true;

    try {
      if (this.isRequestMode) {
        // Request password reset email
        const email = this.resetForm.get('email')?.value;
        await this.authService.requestPasswordReset(email);
        await this.router.navigate(['/auth/login']);
        return;
      }

      // Update password
      const password = this.resetForm.get('password')?.value;
      await this.authService.updatePassword(password);
      
      // Success message and redirect are handled by the auth service
      await this.router.navigate(['/auth/login']);
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      if (error.message?.includes('session')) {
        this.messageService.add({
          severity: 'error',
          summary: 'Session Expired',
          detail: 'Your session has expired. Please request a new password reset link.',
          life: 0,
          sticky: true
        });
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password']);
        }, 3000);
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'Failed to reset password. Please try again.',
          life: 5000
        });
      }
    } finally {
      this.loading = false;
    }
  }
}
