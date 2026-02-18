import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * LoadingSpinnerComponent
 * 
 * Reusable loading indicator component.
 * Architecture Decision: Standalone component for easy import anywhere.
 * 
 * Usage:
 * <app-loading-spinner [show]="isLoading" [overlay]="true"></app-loading-spinner>
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="loading-container" [class.overlay]="overlay">
      <div class="spinner">
        <div class="spinner-ring"></div>
      </div>
      <span *ngIf="message" class="loading-message">{{ message }}</span>
    </div>
  `,
  styles: [`
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(255, 255, 255, 0.85);
      z-index: 9999;
      backdrop-filter: blur(4px);
    }

    .spinner {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner-ring {
      width: 40px;
      height: 40px;
      border: 4px solid #e8f5ee;
      border-top-color: #00A758;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .loading-message {
      font-family: 'Inter', 'SF Pro Display', sans-serif;
      font-size: 1rem;
      color: #00A758;
      font-weight: 500;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() show = false;
  @Input() overlay = false;
  @Input() message?: string;
}
