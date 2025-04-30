import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent {
  constructor(
    private loader: LoaderService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  async handleLogin() {
    this.loader.show();
    try {
      await this.auth.login();
    } catch (error) {
      this.toast.error('Login failed.');
    } finally {
      this.loader.hide();
    }
  }
}
