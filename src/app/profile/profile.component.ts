import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ValidationErrors, AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';
import { UserData } from '../interfaces';
import { NgIf } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-profile',
  standalone: true,  imports: [
    NgIf,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  profile: UserData | null = null;
  showPassword = false;
  showConfirmPassword = false;
  isSubmitting = false;
  deleteDialogOpen = false;

  constructor(private fb: FormBuilder, private userService: UserService) {}

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
    const { confirmPassword, ...values } = this.profileForm.value;
    const changes: any = {};
    Object.keys(values).forEach(key => {
      if (values[key] !== (this.profile as any)[key]) {
        changes[key] = values[key];
      }
    });
    this.userService.patchUser(this.profile.id!, changes).then(() => {
      this.isSubmitting = false;
    });
  }

  openDeleteDialog() {
    this.deleteDialogOpen = true;
  }

  closeDeleteDialog() {
    this.deleteDialogOpen = false;
  }

  handleDelete() {
    if (!this.profile?.id) return;
    this.userService.deleteAccount(this.profile.id).then(() => {
      this.closeDeleteDialog();
    });
  }
}
