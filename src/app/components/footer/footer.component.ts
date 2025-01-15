import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerComponent } from '../player/player.component';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, PlayerComponent],
  template: `
    <footer class="bg-surface-50 border-t border-surface-200 p-4">
      <div class="max-w-7xl mx-auto">
        <div class="text-center text-surface-600 text-sm">
          {{ currentYear }} Your Music App. All rights reserved.
        </div>
      </div>
      <app-player></app-player>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
