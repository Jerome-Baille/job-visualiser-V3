import { inject, runInInjectionContext, EnvironmentInjector, signal } from '@angular/core';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { throwError, Observable, from } from 'rxjs';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Use signals instead of Subject for token refresh state
let isRefreshing = false;
const refreshTokenSignal = signal<boolean>(false);

// Queue to store pending requests during refresh
const pendingRequests: Array<{
  resolve: (value: boolean) => void;
}> = [];

// Function to notify waiting requests
function notifyRefreshComplete() {
  // Use signal to notify components
  refreshTokenSignal.set(true);

  // Process any pending requests
  pendingRequests.forEach(request => {
    request.resolve(true);
  });

  // Clear the queue
  pendingRequests.length = 0;

  // Reset signal state after a short delay
  setTimeout(() => {
    refreshTokenSignal.set(false);
  }, 100);
}

export const httpInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  // Bypass refresh token endpoints
  if (req.url.includes('/refresh')) {
    return next(req);
  }

  const injector = inject(EnvironmentInjector);

  // Clone request to ensure withCredentials is set and proper headers
  const modifiedRequest = req.clone({
    withCredentials: true,
    setHeaders: {
      // Override any CSP headers coming from the server
      // This tells the browser to use the CSP from our meta tag
      'X-Content-Security-Policy': 'override',
    }
  });

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error && error.error.shouldRefresh) {
        if (!isRefreshing) {
          isRefreshing = true;

          return runInInjectionContext(injector, () => {
            const authService = inject(AuthService);
            const router = inject(Router);

            return authService.refreshToken().pipe(
              switchMap(() => {
                isRefreshing = false;
                notifyRefreshComplete();
                const retryRequest = req.clone({
                  withCredentials: true
                });
                return next(retryRequest);
              }),
              catchError(refreshError => {
                isRefreshing = false;
                authService.logout().subscribe({ complete: () => {} }); // Log out the user
                router.navigate(['/auth/login']); // Redirect to login page
                return throwError(() => refreshError);
              }),
              finalize(() => {
                isRefreshing = false;
              })
            );
          });
        } else {
          // Wait for the refresh to complete using a promise
          return from(
            new Promise<boolean>((resolve) => {
              // Add this request to the pending queue
              pendingRequests.push({ resolve });

              // Set up a timeout to avoid hanging forever
              setTimeout(() => {
                resolve(false);
              }, 10000); // 10 second timeout
            })
          ).pipe(
            switchMap(() => {
              const retryRequest = req.clone({
                withCredentials: true
              });
              return next(retryRequest);
            })
          );
        }
      } else {
        return throwError(() => error);
      }
    })
  );
};
