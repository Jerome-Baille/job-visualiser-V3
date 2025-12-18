import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { UserData } from '../../shared/interfaces';
import { UserService } from '../../core/services/user.service';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  profileForm!: FormGroup;
  profile: UserData | null = null;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;

  ngOnInit() {
    this.userService.getProfile().then(data => {
      this.profile = data;
      this.profileForm = this.fb.group({
        username: [data.username, Validators.required],
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(100),
          Validators.pattern(/[a-z]/),
          Validators.pattern(/[A-Z]/),
          Validators.pattern(/\d/)
        ]],
        confirmPassword: ['', Validators.required]
      }, { validators: this.passwordsMatch });
    });
  }

  passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    if (!this.profileForm.valid || !this.profile) return;
    this.isSubmitting = true;
    const values = { ...this.profileForm.value } as Record<string, unknown>;
    delete values['confirmPassword'];

    const changes: Partial<UserData> = {};
    const currentProfile = this.profile as unknown as Record<string, unknown>;
    Object.keys(values).forEach((key) => {
      if (values[key] !== currentProfile[key]) {
        (changes as unknown as Record<string, unknown>)[key] = values[key];
      }
    });
    this.userService.patchUser(this.profile.id!, changes).then(() => {
      this.isSubmitting = false;
    });
  }

  openDeleteDialog() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Account',
        message: 'Are you sure? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn' as const,
        confirmIcon: 'delete_forever'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.profile?.id) {
        this.userService.deleteAccount(this.profile.id);
      }
    });
  }
}
