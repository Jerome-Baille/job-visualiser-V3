import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../core/services/snackbar.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    NgIf
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  isLoggedIn = false;
  isLoading = false;
  isRegisterMode = false;

  constructor(
    private authService: AuthService,
    private snackbar: SnackbarService
  ) {
    this.authService.waitForAuthState().subscribe(
      (isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
      }
    );
  }

  toggleForm() {
    if (!this.isLoading) {
      this.isRegisterMode = !this.isRegisterMode;
    }
  }

  onAction() {
    this.isLoading = true;
    try {
      if (this.isRegisterMode) {
        this.authService.register();
      } else {
        this.authService.login();
      }
    } catch (error) {
      this.isLoading = false;
      this.snackbar.error(`Failed to redirect to ${this.isRegisterMode ? 'registration' : 'authentication'} service`);
    }
  }

  onLogout() {
    this.isLoading = true;
    try {
      this.authService.logout();
    } catch (error) {
      this.isLoading = false;
      this.snackbar.error('Failed to redirect to logout');
    }
  }

  handleLogin() {
    try {
      this.authService.login();
    } catch (error) {
      this.snackbar.error('Login failed.');
    }
  }

  handleRegister() {
    try {
      this.authService.register();
    } catch (error) {
      this.snackbar.error('Registration failed.');
    }
  }
}