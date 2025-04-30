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
    // Wait a bit for auth state to stabilize
    setTimeout(() => {
      this.auth.handlePostLogin().subscribe({
        next: (response) => {
          if (response.auth) {
            this.toast.success('Registration successful! You can now log in.');
            this.router.navigate(['/auth']);
          } else {
            this.toast.error('Registration verification failed.');
            this.router.navigate(['/auth']);
          }
        },
        error: (error) => {
          console.error('Registration verification failed:', error);
          this.toast.error('Registration verification failed. Please try again.');
          this.router.navigate(['/auth']);
        }
      });
    }, 500);
  }
}
