import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface VerifyResponse {
  message: string;
  status: string;
  userId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private authURL = environment.authURL;
  private authFrontURL = environment.authFrontURL;
  
  // Using signal instead of BehaviorSubject
  private authState = signal<boolean>(false);
  // Expose the signal as a readonly signal
  readonly isAuthenticated = this.authState.asReadonly();
  
  // New signal to track if verification is complete
  private _verificationCompleted = signal<boolean>(false);
  // Expose verification completion for components/templates
  readonly verificationCompleted = this._verificationCompleted.asReadonly();

  // Create observables from the signals
  readonly authState$ = toObservable(this.isAuthenticated);
  readonly verificationCompleted$ = toObservable(this.verificationCompleted);

  constructor() {
    this.verifyAuthState();
  }

  private verifyAuthState() {
    this.http.get<VerifyResponse>(`${this.authURL}/verify`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.authState.set(response.status === 'success');
          this._verificationCompleted.set(true);
        },
        error: (error) => {
          // If verify fails due to expired token, try to refresh and verify again
          if (error.error?.shouldRefresh) {
            this.refreshToken().subscribe({
              next: () => {
                // Retry verification after successful refresh
                this.http.get<VerifyResponse>(`${this.authURL}/verify`, { withCredentials: true })
                  .subscribe({
                    next: (response) => {
                      this.authState.set(response.status === 'success');
                      this._verificationCompleted.set(true);
                    },
                    error: () => {
                      this.authState.set(false);
                      this._verificationCompleted.set(true);
                    }
                  });
              },
              error: () => {
                this.authState.set(false);
                this._verificationCompleted.set(true);
              }
            });
          } else {
            this.authState.set(false);
            this._verificationCompleted.set(true);
          }
        }
      });
  }

  // Wait until verification is complete then emit the authState value
  waitForAuthState(): Observable<boolean> {
    return combineLatest([this.authState$, this.verificationCompleted$]).pipe(
      filter(([, verified]) => verified),
      map(([auth]) => auth),
      take(1)
    );
  }
  
  // For backward compatibility with existing components
  isLoggedIn(): Observable<boolean> {
    return this.waitForAuthState();
  }

  login() {
    // Get current origin for the return URL
    const currentOrigin = window.location.origin;
    const returnPath = '/auth/after-login'; // Where to go after auth
    const returnUrl = `${currentOrigin}${returnPath}`;
    
    // Redirect to auth app
    window.location.href = `${this.authFrontURL}/external-login?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  // Method to handle post-login verification
  handlePostLogin() {
    return this.http.get<VerifyResponse>(`${this.authURL}/verify`, { withCredentials: true }).pipe(
      tap((response) => {
        this.authState.set(response.status === 'success');
      }),
      map(response => ({
        auth: response.status === 'success',
        message: response.message,
        userId: response.userId
      }))
    );
  }

  logout() {
    return this.http.post(`${this.authURL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.authState.set(false);
      })
    );
  }

  register() {
    // Get current origin for the return URL
    const currentOrigin = window.location.origin;
    const returnPath = '/auth/after-register'; // Where to go after registration
    const returnUrl = `${currentOrigin}${returnPath}`;
    
    // Redirect to auth app registration page
    window.location.href = `${this.authFrontURL}/external-register?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  refreshToken() {
    return this.http.post(`${this.authURL}/refresh`, {}, { withCredentials: true });
  }
}