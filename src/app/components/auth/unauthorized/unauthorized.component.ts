import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PrimeNgModule } from '../../../primeng.module';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, PrimeNgModule],
  template: `
    <div class="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div class="w-full max-w-lg text-center">
        <p-card>
          <ng-template pTemplate="header">
            <div class="text-6xl text-red-500 mb-4">
              <i class="pi pi-exclamation-triangle"></i>
            </div>
          </ng-template>
          <h1 class="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-100">Unauthorized Access</h1>
          <p class="text-lg mb-6 text-gray-600 dark:text-gray-300">
            Sorry, you don't have permission to access this page.
          </p>
          <div class="flex justify-center gap-4">
            <p-button label="Go Home" icon="pi pi-home" (onClick)="navigateHome()"></p-button>
            <p-button label="Go Back" icon="pi pi-arrow-left" styleClass="p-button-secondary" (onClick)="goBack()"></p-button>
          </div>
        </p-card>
      </div>
    </div>
  `
})
export class UnauthorizedComponent {
  constructor(private router: Router) {}

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  goBack(): void {
    window.history.back();
  }
}
