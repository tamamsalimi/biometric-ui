import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

/**
 * LoadingInterceptor
 * 
 * Automatically shows/hides loading indicator for HTTP requests.
 * Architecture Decision: Centralized loading state management via interceptor.
 * 
 * Features:
 * - Automatically shows loading on request start
 * - Automatically hides loading on request complete
 * - Handles concurrent requests properly
 * - Can skip loading for specific requests via header
 */
@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private readonly SKIP_LOADING_HEADER = 'X-Skip-Loading';

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Check if loading should be skipped for this request
    const skipLoading = request.headers.has(this.SKIP_LOADING_HEADER);

    if (skipLoading) {
      // Remove the header before sending the request
      const headers = request.headers.delete(this.SKIP_LOADING_HEADER);
      const modifiedRequest = request.clone({ headers });
      return next.handle(modifiedRequest);
    }

    // Show loading indicator
    this.loadingService.show();

    return next.handle(request).pipe(
      finalize(() => {
        // Hide loading indicator when request completes
        this.loadingService.hide();
      })
    );
  }
}
