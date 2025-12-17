
import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private snackBar = inject(MatSnackBar);

  private defaultDuration = 3000;

  success(message: string, duration: number = this.defaultDuration) {
    this.open(message, 'snackbar-success', duration);
  }

  error(message: string, duration: number = this.defaultDuration) {
    this.open(message, 'snackbar-error', duration);
  }

  info(message: string, duration: number = this.defaultDuration) {
    this.open(message, 'snackbar-info', duration);
  }

  open(message: string, panelClass: string, duration: number) {
    const config: MatSnackBarConfig = {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      duration,
      panelClass: [panelClass]
    };
    this.snackBar.open(message, 'Close', config);
  }
}
