import { Component } from '@angular/core';
import { LoaderService } from '../../services/loader.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss']
})
export class RegisterFormComponent {
  constructor(
    private loader: LoaderService,
    private auth: AuthService,
    private toast: ToastService
  ) {}

  async handleRegister() {
    this.loader.show();
    try {
      await this.auth.register();
    } catch (error) {
      this.toast.error('Registration failed.');
    } finally {
      this.loader.hide();
    }
  }
}
