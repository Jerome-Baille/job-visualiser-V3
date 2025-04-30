import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = false;

  constructor(private http: HttpClient) {}

  async login(): Promise<void> {
    // Redirect to the login endpoint (OAuth2 or similar)
    window.location.href = `${environment.authBaseURL}/auth/login`;
  }

  async register(): Promise<void> {
    // Redirect to the register endpoint
    window.location.href = `${environment.authBaseURL}/auth/register`;
  }

  async logout(): Promise<void> {
    // Redirect to the logout endpoint
    window.location.href = `${environment.authBaseURL}/auth/logout`;
  }

  async verify(): Promise<any> {
    // Call the verify endpoint
    return firstValueFrom(
      this.http.get(`${environment.authBaseURL}/auth/verify`, { withCredentials: true })
    );
  }

  setAuthenticated(value: boolean) {
    this.authenticated = value;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }
}
