import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';
import { LoaderService } from '../../services/loader.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-after-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './after-login.component.html',
  styleUrls: ['./after-login.component.scss']
})
export class AfterLoginComponent implements OnInit {
  constructor(
    private router: Router,
    private auth: AuthService,
    private snackbar: SnackbarService,
    private loaderService: LoaderService
  ) {}
  ngOnInit() {
    this.loaderService.show();
    setTimeout(() => {
      this.auth.handlePostLogin().subscribe({
        next: (response) => {
          this.loaderService.hide();
          if (response.auth) {
            if (response.message) {
              this.snackbar.success(response.message);
            } else {
              this.snackbar.success('Successfully logged in!');
            }
            this.router.navigate(['/']);
          } else {
            this.snackbar.error('Login failed.');
            this.router.navigate(['/auth']);
          }
        },        error: (error) => {
          this.loaderService.hide();
          console.error('Authentication verification failed:', error);
          this.snackbar.error('Authentication failed. Please try again.');
          this.router.navigate(['/auth']);
        }
      });
    }, 500);
  }
}
