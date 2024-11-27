import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome Home
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        This is the home page of your application.
      </p>
    </div>
  `,
})
export class HomeComponent {}
