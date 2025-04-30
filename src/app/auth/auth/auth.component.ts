
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoginFormComponent } from "./login-form.component";
import { RegisterFormComponent } from "./register-form.component";
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, RegisterFormComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  isLoggedIn = false;
  isLoading = false;
  isRegisterMode = false;

  constructor(
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
}
