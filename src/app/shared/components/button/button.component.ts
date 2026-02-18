import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * ButtonComponent
 * 
 * Reusable button component with enterprise styling.
 * Architecture Decision: Standalone component with consistent theming.
 * 
 * Usage:
 * <app-button [disabled]="isLoading" (clicked)="onSubmit()">Submit</app-button>
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [class.loading]="loading"
      [class.secondary]="variant === 'secondary'"
      [class.outline]="variant === 'outline'"
      (click)="onClick($event)"
    >
      <span *ngIf="loading" class="button-spinner"></span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      width: 100%;
      height: 58px;
      background: linear-gradient(135deg, #00A758, #007A43);
      color: #fff;
      border: none;
      border-radius: 28px;
      font-size: 1.18rem;
      font-weight: 600;
      font-family: 'Inter', 'SF Pro Display', sans-serif;
      cursor: pointer;
      box-shadow: 0 10px 25px rgba(0, 167, 88, 0.35);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    button:enabled:hover {
      box-shadow: 0 16px 32px rgba(0, 167, 88, 0.45);
      transform: translateY(-2px);
    }

    button:disabled {
      background: #e8f5ee;
      color: #b2b2b2;
      cursor: not-allowed;
      box-shadow: none;
      transform: none;
    }

    button.secondary {
      background: #f4f6f5;
      color: #00A758;
      box-shadow: none;
    }

    button.outline {
      background: transparent;
      color: #00A758;
      border: 2px solid #00A758;
      box-shadow: none;
    }

    button.loading {
      opacity: 0.8;
    }

    .button-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';

  @Output() clicked = new EventEmitter<MouseEvent>();

  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.clicked.emit(event);
    }
  }
}
