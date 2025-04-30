import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-after-register',
  template: '',
  styleUrls: ['./after-register.component.scss']
})
export class AfterRegisterComponent {
  constructor(
    private router: Router,
    private loader: LoaderService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.verifyRegistration();
  }

  async verifyRegistration() {
    this.loader.show();
    try {
      const response = await this.auth.verify();
      if (response.status === 'success' && response.userId) {
        this.toast.success('Registration successful! You can now log in.');
        this.router.navigate(['/auth']);
      } else {
        throw new Error('Registration verification failed');
      }
    } catch (error) {
      this.toast.error('Registration verification failed. Please try again.');
      this.router.navigate(['/auth']);
    } finally {
      this.loader.hide();
    }
  }
}
