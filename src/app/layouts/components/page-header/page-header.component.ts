import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="page-header">
      <div class="header-content">
        <h1 class="title">{{ title }}</h1>
        <p class="description" *ngIf="description">{{ description }}</p>
      </div>
    </header>
    
  `,
  styles: [`
    .page-header {
      background: var(--surface-card);
      padding-bottom: 1rem;
      border-bottom: 1px solid #333;
      margin-bottom: 4rem;
    }
    
    .title {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
      color: var(--text-color);
    }
    .description {
      margin: 0.5rem 0 0;
      color: var(--text-color-secondary);
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() description?: string;
}
