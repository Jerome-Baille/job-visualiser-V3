import { ApplicationConfig, provideZoneChangeDetection, isDevMode, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideServiceWorker } from '@angular/service-worker';
import { authInterceptor } from './core/interceptors/http.interceptor';
import { AuthService } from './core/services/auth.service';

/**
 * Initialize authentication state on app startup
 * This ensures auth verification happens before any component loads
 */
function initializeAuth(authService: AuthService) {
  return () => {
    // Injecting the service triggers the constructor which calls verifyAuthState()
    // Explicitly mark as intentionally unused to satisfy linter
    void authService;
    // Return a resolved promise to allow app to continue bootstrapping
    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Provide animations support for Angular Material
    provideAnimations(),
    // Provide HttpClient with custom interceptor
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    // Initialize auth service at app startup
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [AuthService],
      multi: true
    },
    provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          })
  ]
};
