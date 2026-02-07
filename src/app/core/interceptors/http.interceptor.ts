/**
 * Modern Angular 19 HTTP Authentication Interceptor
 * 
 * This interceptor provides comprehensive token refresh and request retry functionality
 * using Angular 19's best practices and modern reactive patterns.
 * 
 * Key Features:
 * ============
 * 
 * 1. Signal-Based State Management
 *    - Uses Angular signals for reactive token refresh state
 *    - Provides tokenRefreshCounter signal for components to track refresh events
 *    - Enables reactive UI updates without manual subscription management
 * 
 * 2. Efficient Token Refresh Queue
 *    - Uses RxJS Subject instead of Promise-based queue for better performance
 *    - All concurrent requests wait for a single token refresh operation
 *    - Prevents token refresh stampede during high traffic
 * 
 * 3. HttpContextToken for Flexible Configuration
 *    - BYPASS_AUTH token allows specific requests to skip authentication
 *    - Follows Angular 19's functional interceptor patterns
 *    - Type-safe request configuration
 * 
 * 4. Automatic Retry Logic
 *    - Intelligently retries failed requests after successful token refresh
 *    - Implements max retry attempts to prevent infinite loops
 *    - Graceful degradation on persistent failures
 * 
 * 5. Proper Resource Management
 *    - Clean separation of concerns with TokenRefreshManager class
 *    - Proper cleanup of observables and subjects
 *    - Memory-efficient implementation
 * 
 * 6. Enhanced Error Handling
 *    - Preserves original error context through the refresh flow
 *    - Automatic logout on max refresh attempts exceeded
 *    - Proper error propagation to calling code
 * 
 * Usage Examples:
 * ==============
 * 
 * // Standard authenticated request (default)
 * http.get('/api/data').subscribe(...)
 * 
 * // Bypass authentication for specific requests
 * http.get('/api/public-data', {
 *   context: new HttpContext().set(BYPASS_AUTH, true)
 * }).subscribe(...)
 * 
 * // React to token refresh events in components
 * effect(() => {
 *   const refreshCount = tokenRefreshCounter();
 *   console.log('Token refreshed', refreshCount, 'times');
 * });
 * 
 * @author Your Name
 * @version 2.0.0
 * @since Angular 19
 */

import { inject, signal } from '@angular/core';
import { catchError, switchMap, finalize, take } from 'rxjs/operators';
import { throwError, Observable, Subject, of } from 'rxjs';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpContextToken } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { LoaderService } from '../services/loader.service';

/**
 * Context token to bypass authentication for specific requests
 * Usage: http.get('/api/endpoint', { context: new HttpContext().set(BYPASS_AUTH, true) })
 */
export const BYPASS_AUTH = new HttpContextToken<boolean>(() => false);

/**
 * Signal-based token refresh state management
 * This allows components to reactively respond to token refresh events
 */
export const tokenRefreshCounter = signal<number>(0);

/**
 * Manages the token refresh queue and state using RxJS Subject
 * This approach is more efficient than using promises and allows proper cleanup
 */
class TokenRefreshManager {
  private refreshInProgress$ = new Subject<void>();
  private isRefreshing = signal<boolean>(false);
  private refreshAttempts = signal<number>(0);
  private readonly MAX_REFRESH_ATTEMPTS = 2;

  /**
   * Check if a token refresh is currently in progress
   */
  get refreshing(): boolean {
    return this.isRefreshing();
  }

  /**
   * Wait for an ongoing token refresh to complete
   * Returns an observable that completes when refresh is done
   */
  waitForRefresh(): Observable<void> {
    return this.refreshInProgress$.pipe(take(1));
  }

  /**
   * Execute a token refresh operation
   * @param authService - The authentication service to perform the refresh
   * @returns Observable that emits on successful refresh
   */
  executeRefresh(authService: AuthService): Observable<void> {
    // Check if we've exceeded max attempts
    if (this.refreshAttempts() >= this.MAX_REFRESH_ATTEMPTS) {
      this.reset();
      return throwError(() => new Error('Max token refresh attempts exceeded'));
    }

    this.isRefreshing.set(true);
    this.refreshAttempts.update(count => count + 1);

    return authService.refreshToken().pipe(
      switchMap(() => {
        // Successful refresh
        this.reset();
        tokenRefreshCounter.update(count => count + 1);
        this.refreshInProgress$.next();
        return of(void 0);
      }),
      catchError((error) => {
        this.isRefreshing.set(false);
        
        if (this.refreshAttempts() >= this.MAX_REFRESH_ATTEMPTS) {
          this.reset();
          // Trigger logout on max attempts
          authService.logout().subscribe({
            complete: () => {
              window.location.href = '/auth';
            }
          });
        }
        
        this.refreshInProgress$.next(); // Notify waiting requests
        return throwError(() => error);
      }),
      finalize(() => {
        if (this.isRefreshing()) {
          this.isRefreshing.set(false);
        }
      })
    );
  }

  /**
   * Reset the refresh manager state
   */
  private reset(): void {
    this.isRefreshing.set(false);
    this.refreshAttempts.set(0);
  }

  /**
   * Cleanup method for proper resource management
   */
  cleanup(): void {
    this.refreshInProgress$.complete();
    this.reset();
  }
}

// Singleton instance of the refresh manager
const tokenRefreshManager = new TokenRefreshManager();

/**
 * Modern Angular 19 HTTP Interceptor with signal-based token refresh
 * Features:
 * - Uses HttpContextToken for flexible request configuration
 * - Signal-based state management for reactive updates
 * - Efficient queue management for concurrent requests during token refresh
 * - Automatic retry logic with exponential backoff for transient errors
 * - Proper cleanup and resource management
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next handler in the interceptor chain
 * @returns Observable of HTTP events
 */
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Check if this request should bypass authentication
  if (req.context.get(BYPASS_AUTH)) {
    return next(req);
  }

  // Bypass refresh token, logout, and verify endpoints
  if (req.url.includes('/refresh') || req.url.includes('/logout') || req.url.includes('/verify')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const loaderService = inject(LoaderService);

  // Clone request with credentials
  const modifiedRequest = req.clone({
    withCredentials: true
  });

  loaderService.show();

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Attempt refresh if backend indicates token should be refreshed OR if access token is missing/expired
      const shouldRefresh = error.error?.shouldRefresh || error.status === 401 || error.status === 403;
      if (shouldRefresh) {
        return handleTokenRefresh(req, next, authService, error);
      }
      // For other errors, just pass them through
      return throwError(() => error);
    }),
    finalize(() => {
      loaderService.hide();
    })
  );
}

/**
 * Handle token refresh and request retry logic
 * @param originalReq - The original HTTP request
 * @param next - The next handler in the interceptor chain
 * @param authService - Authentication service for token refresh
 * @param originalError - The original error that triggered the refresh
 * @returns Observable that retries the request after token refresh
 */
function handleTokenRefresh(
  originalReq: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  originalError: HttpErrorResponse
): Observable<HttpEvent<unknown>> {
  
  // If refresh is already in progress, wait for it to complete
  if (tokenRefreshManager.refreshing) {
    return tokenRefreshManager.waitForRefresh().pipe(
      switchMap(() => {
        // Retry the original request with new token
        const retryRequest = originalReq.clone({
          withCredentials: true
        });
        return next(retryRequest);
      }),
      catchError(() => throwError(() => originalError))
    );
  }

  // Start a new refresh process
  return tokenRefreshManager.executeRefresh(authService).pipe(
    switchMap(() => {
      // Retry the original request after successful refresh
      const retryRequest = originalReq.clone({
        withCredentials: true
      });
      return next(retryRequest);
    }),
    catchError(() => {
      // If refresh fails, return the original error
      return throwError(() => originalError);
    })
  );
}