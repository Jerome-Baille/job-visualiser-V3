import { inject, runInInjectionContext, EnvironmentInjector, signal } from '@angular/core';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { throwError, Observable, from } from 'rxjs';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { LoaderService } from '../services/loader.service';

// Using signals instead of Subject for token refresh state
let isRefreshing = false;
// Create a signal for token refresh events - increments on each refresh
export const tokenRefreshCounter = signal<number>(0);
let refreshAttempts = 0; // Add counter for refresh attempts

// A queue to store pending requests during refresh
const pendingRequests: Array<{
  resolve: (value: boolean) => void;
}> = [];

// Function to notify waiting requests
function notifyRefreshComplete() {
  // Update counter signal to notify components of a token refresh
  tokenRefreshCounter.update(count => count + 1);

  // Process any pending requests
  pendingRequests.forEach(request => {
    request.resolve(true);
  });

  // Clear the queue
  pendingRequests.length = 0;
}

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Bypass refresh token endpoints
  if (req.url.includes('/refresh')) {
    return next(req);
  }

  const injector = inject(EnvironmentInjector);
  const loaderService = inject(LoaderService);

  // We'll use the injector inside the pipes where we need the services
  const modifiedRequest = req.clone({
    withCredentials: true
  });

  loaderService.show();  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only attempt refresh if we have the shouldRefresh flag and haven't exceeded attempts
      if (error.error.shouldRefresh && refreshAttempts < 2) {
        refreshAttempts++; // Increment attempts
      if (!isRefreshing) {
        isRefreshing = true;
        return runInInjectionContext(injector, () => {
          const authService = inject(AuthService);
          return authService.refreshToken().pipe(            switchMap(() => {
              isRefreshing = false;
              refreshAttempts = 0;
              notifyRefreshComplete();
              const retryRequest = req.clone({
                withCredentials: true
              });
              return next(retryRequest);
            }), catchError(refreshError => {
              isRefreshing = false;
              if (refreshAttempts >= 2) {
                refreshAttempts = 0;
                // Use logout() as observable and subscribe to it
                authService.logout().subscribe({
                  complete: () => {
                    window.location.href = '/auth';
                  }
                });
              }
              // Return the original error after refresh fails, not the refresh error
              return throwError(() => error);
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
        ).pipe(switchMap((refreshSuccess) => {
          if (refreshSuccess) {
            const retryRequest = req.clone({
              withCredentials: true
            });
            return next(retryRequest);
          } else {
            // Timeout occurred, return the original error
            return throwError(() => error);
          }
        })
        );
      }
    } else {
      // No refresh needed or max attempts exceeded, return the error
      return throwError(() => error);
    }
  }),
    finalize(() => {
      loaderService.hide();
    })
  );
}