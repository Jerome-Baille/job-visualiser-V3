import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoaderService } from '../../services/loader.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-after-login',
  template: `
    <div class="loading-container">
      <h2>Authenticating...</h2>
      <div class="spinner"></div>
    </div>
  `,
  styleUrls: ['./after-login.component.scss']
})
export class AfterLoginComponent implements OnInit {
  constructor(
    private router: Router,
    private loader: LoaderService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loader.show();
    setTimeout(() => {
      this.auth.handlePostLogin().subscribe({
        next: (response) => {
          this.loader.hide();
          if (response.auth) {
            if (response.message) {
              this.toast.success(response.message);
            } else {
              this.toast.success('Successfully logged in!');
              console.log('Login successful:', response);
            }
            this.router.navigate(['/']);
          } else {
            this.toast.error('Login failed.');
            this.router.navigate(['/auth']);
          }
        },
        error: (error) => {
          this.loader.hide();
          console.error('Authentication verification failed:', error);
          this.toast.error('Authentication failed. Please try again.');
          this.router.navigate(['/auth']);
        }
      });
    }, 500);
  }
}
