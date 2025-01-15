import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-surface-900 mb-2">{{ title }}</h1>
        @if (description) {
          <p class="text-lg text-surface-600">{{ description }}</p>
        }
      </div>

      <!-- Page Content -->
      <div class="bg-surface-0 rounded-lg shadow-sm p-6">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class PageLayoutComponent {
  @Input() title!: string;
  @Input() description?: string;
}
