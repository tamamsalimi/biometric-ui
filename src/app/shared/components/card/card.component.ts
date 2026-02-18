import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * CardComponent
 * 
 * Reusable card container component.
 * Architecture Decision: Standalone component with content projection.
 * 
 * Usage:
 * <app-card [title]="'Card Title'">
 *   <ng-container card-content>Your content here</ng-container>
 * </app-card>
 */
@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.elevated]="elevated">
      <div *ngIf="title" class="card-header">
        <h3 class="card-title">{{ title }}</h3>
        <p *ngIf="subtitle" class="card-subtitle">{{ subtitle }}</p>
      </div>
      <div class="card-content">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: rgba(255, 255, 255, 0.92);
      border-radius: 28px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
      padding: 24px;
      width: 100%;
    }

    .card.elevated {
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.12);
    }

    .card-header {
      margin-bottom: 20px;
      text-align: center;
    }

    .card-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1a1a1a;
      margin: 0 0 8px 0;
      font-family: 'Inter', 'SF Pro Display', sans-serif;
    }

    .card-subtitle {
      font-size: 1rem;
      color: #00A758;
      margin: 0;
      font-weight: 500;
    }

    .card-content {
      width: 100%;
    }
  `]
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() elevated = false;
}
