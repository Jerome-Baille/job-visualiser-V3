import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-after-login',
  template: '',
  styleUrls: ['./after-login.component.scss']
})
export class AfterLoginComponent {
  constructor(
    private router: Router,
    private loader: LoaderService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.verifyAuth();
  }

  async verifyAuth() {
    this.loader.show();
    try {
      const response = await this.auth.verify();
      if (response.status === 'success' && response.userId) {
        this.auth.setAuthenticated?.(true);
        this.toast.success('Successfully logged in!');
        this.router.navigate(['/']);
      } else {
        throw new Error('Authentication verification failed');
      }
    } catch (error) {
      this.auth.setAuthenticated?.(false);
      this.toast.error('Authentication failed. Please try again.');
      this.router.navigate(['/auth']);
    } finally {
      this.loader.hide();
    }
  }
}
