import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  isLoggedIn = false;
  isLoading = false;
  isRegisterMode = false;

  constructor(
    private loader: LoaderService,
    private authService: AuthService,
    private toast: ToastService
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
      this.toast.error(`Failed to redirect to ${this.isRegisterMode ? 'registration' : 'authentication'} service`);
    }
  }

  onLogout() {
    this.isLoading = true;
    try {
      this.authService.logout();
    } catch (error) {
      this.isLoading = false;
      this.toast.error('Failed to redirect to logout');
    }
  }

  handleLogin() {
    this.loader.show();
    try {
      this.authService.login();
    } catch (error) {
      this.toast.error('Login failed.');
    } finally {
      this.loader.hide();
    }
  }

  handleRegister() {
    this.loader.show();
    try {
      this.authService.register();
    } catch (error) {
      this.toast.error('Registration failed.');
    } finally {
      this.loader.hide();
    }
  }
}
