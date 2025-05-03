import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-after-register',
  template: '',
  styleUrls: ['./after-register.component.scss']
})
export class AfterRegisterComponent {
  constructor(
    private router: Router,
    private loader: LoaderService,
    private auth: AuthService,
    private snackbar: SnackbarService
  ) {}

  ngOnInit() {
    // Wait a bit for auth state to stabilize
    setTimeout(() => {
      this.auth.handlePostLogin().subscribe({
        next: (response) => {
          if (response.auth) {
            this.snackbar.success('Registration successful! You can now log in.');
            this.router.navigate(['/auth']);
          } else {
            this.snackbar.error('Registration verification failed.');
            this.router.navigate(['/auth']);
          }
        },
        error: (error) => {
          console.error('Registration verification failed:', error);
          this.snackbar.error('Registration verification failed. Please try again.');
          this.router.navigate(['/auth']);
        }
      });
    }, 500);
  }
}
