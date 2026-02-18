import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * HttpErrorInterceptor
 * 
 * Global HTTP error handling interceptor.
 * Architecture Decision: Centralized error handling for all HTTP requests.
 * 
 * Features:
 * - Catches all HTTP errors
 * - Transforms errors into user-friendly messages
 * - Logs errors for debugging
 * - Can be extended for specific error handling (401, 403, 500, etc.)
 */
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = this.getErrorMessage(error);
        
        // Log error for debugging (in production, send to logging service)
        this.logError(error, request);

        return throwError(() => ({
          message: errorMessage,
          status: error.status,
          url: error.url
        }));
      })
    );
  }

  /**
   * Extract user-friendly error message from HTTP error
   */
  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      return `Network error: ${error.error.message}`;
    }

    // Server-side error
    switch (error.status) {
      case 0:
        return 'Unable to connect to server. Please check your connection.';
      case 400:
        return error.error?.message || 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission.';
      case 404:
        return 'Resource not found.';
      case 409:
        return error.error?.message || 'Conflict. Resource already exists.';
      case 422:
        return error.error?.message || 'Validation error. Please check your input.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error.error?.message || `Error: ${error.status} ${error.statusText}`;
    }
  }

  /**
   * Log error for debugging purposes
   * In production, this should send to a logging service
   */
  private logError(error: HttpErrorResponse, request: HttpRequest<unknown>): void {
    const errorDetails = {
      timestamp: new Date().toISOString(),
      url: request.url,
      method: request.method,
      status: error.status,
      message: error.message,
      error: error.error
    };

    // In development, log to console
    // In production, send to logging service (e.g., Sentry, LogRocket)
    if (typeof console !== 'undefined') {
      console.error('[HTTP Error]', errorDetails);
    }
  }
}
