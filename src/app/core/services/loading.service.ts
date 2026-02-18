import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * LoadingService
 * 
 * Centralized loading state management service.
 * Architecture Decision: Uses BehaviorSubject for reactive loading state.
 * Can be used with HTTP interceptor for automatic loading indication.
 * 
 * Usage:
 * - Inject into components to show/hide loading indicators
 * - Used by LoadingInterceptor for automatic HTTP loading state
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private requestCount = 0;

  /**
   * Observable for loading state
   */
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Show loading indicator
   * Uses request counting to handle concurrent requests
   */
  show(): void {
    this.requestCount++;
    if (this.requestCount === 1) {
      this.loadingSubject.next(true);
    }
  }

  /**
   * Hide loading indicator
   * Only hides when all requests are complete
   */
  hide(): void {
    this.requestCount = Math.max(0, this.requestCount - 1);
    if (this.requestCount === 0) {
      this.loadingSubject.next(false);
    }
  }

  /**
   * Force hide loading indicator
   * Resets request count
   */
  forceHide(): void {
    this.requestCount = 0;
    this.loadingSubject.next(false);
  }
}
