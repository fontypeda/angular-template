import { Component } from '@angular/core';

@Component({
  selector: 'app-features',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-theme-text dark:text-theme-text-dark mb-6">
        Features
      </h1>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Feature Cards -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-theme-text dark:text-theme-text-dark mb-4">
            Dark Mode
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Seamless dark mode integration with system preference support.
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-theme-text dark:text-theme-text-dark mb-4">
            PrimeNG Integration
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Beautiful UI components with full theme support.
          </p>
        </div>

        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-theme-text dark:text-theme-text-dark mb-4">
            Tailwind CSS
          </h2>
          <p class="text-gray-600 dark:text-gray-400">
            Utility-first CSS framework for rapid UI development.
          </p>
        </div>
      </div>
    </div>
  `
})
export class FeaturesComponent {}
