import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-theme-text dark:text-theme-text-dark mb-6">
        About
      </h1>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
        <div class="prose dark:prose-invert max-w-none">
          <h2 class="text-2xl font-semibold text-theme-text dark:text-theme-text-dark mb-4">
            Angular Template
          </h2>
          
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            This template is built with Angular 18, featuring a modern tech stack and best practices:
          </p>
          
          <ul class="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6">
            <li>Angular 18 with standalone components</li>
            <li>PrimeNG 18.0.0-rc.1 for UI components</li>
            <li>Tailwind CSS for styling</li>
            <li>Dark mode support</li>
            <li>Lazy loading</li>
            <li>Type-safe API integration</li>
          </ul>
          
          <h3 class="text-xl font-semibold text-theme-text dark:text-theme-text-dark mb-4">
            Getting Started
          </h3>
          
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Clone the repository and run:
          </p>
          
          <pre class="bg-gray-100 dark:bg-gray-900 p-4 rounded-md mb-6">
            <code>npm install
npm start</code>
          </pre>
          
          <p class="text-gray-600 dark:text-gray-400">
            Visit our documentation for more information on customization and deployment.
          </p>
        </div>
      </div>
    </div>
  `
})
export class AboutComponent {}
