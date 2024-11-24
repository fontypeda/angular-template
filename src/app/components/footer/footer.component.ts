import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="bg-theme-bg dark:bg-theme-bg-dark border-t border-gray-200 dark:border-gray-700">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="py-8">
          <!-- Footer Grid -->
          <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
            <!-- Company Info -->
            <div class="col-span-1">
              <h2 class="text-lg font-semibold text-theme-text dark:text-theme-text-dark mb-4">Company</h2>
              <ul class="space-y-2">
                <li>
                  <a routerLink="/about" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    About Us
                  </a>
                </li>
                <li>
                  <a routerLink="/contact" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <!-- Resources -->
            <div class="col-span-1">
              <h2 class="text-lg font-semibold text-theme-text dark:text-theme-text-dark mb-4">Resources</h2>
              <ul class="space-y-2">
                <li>
                  <a routerLink="/docs" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    Documentation
                  </a>
                </li>
                <li>
                  <a routerLink="/guides" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    Guides
                  </a>
                </li>
              </ul>
            </div>

            <!-- Legal -->
            <div class="col-span-1">
              <h2 class="text-lg font-semibold text-theme-text dark:text-theme-text-dark mb-4">Legal</h2>
              <ul class="space-y-2">
                <li>
                  <a routerLink="/privacy" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a routerLink="/terms" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>

            <!-- Social -->
            <div class="col-span-1">
              <h2 class="text-lg font-semibold text-theme-text dark:text-theme-text-dark mb-4">Follow Us</h2>
              <div class="flex space-x-4">
                <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  <i class="pi pi-twitter text-xl"></i>
                </a>
                <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  <i class="pi pi-github text-xl"></i>
                </a>
                <a href="#" class="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                  <i class="pi pi-linkedin text-xl"></i>
                </a>
              </div>
            </div>
          </div>

          <!-- Copyright -->
          <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p class="text-center text-gray-600 dark:text-gray-400">
              © {{ currentYear }} Your Company. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: []
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
