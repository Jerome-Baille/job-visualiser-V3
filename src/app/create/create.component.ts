import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../services/job.service';
import { SnackbarService } from '../services/snackbar.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

// Custom date adapter that ensures leading zeros
class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (!this.isValid(date)) {
      return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }
}

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },  // Use British English (day/month/year format)
    { provide: DateAdapter, useClass: CustomDateAdapter },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD/MM/YYYY',
        },
        display: {
          dateInput: 'DD/MM/YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  createForm: FormGroup;
  isSubmitting = false;
  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private snackbar: SnackbarService,
    private router: Router
  ) {
    const today = new Date();
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      company: ['', Validators.required],
      location: ['', Validators.required],
      type: ['Remote', Validators.required],
      link: ['', Validators.required],
      applicationDate: [today, Validators.required], // Store as Date object instead of string
      interviewDate: [null],
      decisionDate: [null],
      decision: ['unknown', Validators.required]
    });
  }
  async onSubmit() {
    if (this.createForm.invalid) return;
    this.isSubmitting = true;
    
    try {
      // Create a copy of the form value to format dates
      const formData = { ...this.createForm.value };
      
      // Format dates to ISO string for API
      if (formData.applicationDate) {
        formData.applicationDate = this.formatDateForApi(formData.applicationDate);
      }
      
      if (formData.interviewDate) {
        formData.interviewDate = this.formatDateForApi(formData.interviewDate);
      }
      
      if (formData.decisionDate) {
        formData.decisionDate = this.formatDateForApi(formData.decisionDate);
      }
      
      await this.jobService.postOpportunity(formData);
      this.snackbar.success('Opportunity created!');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.snackbar.error(err?.error?.message || 'Error creating opportunity.');
      this.isSubmitting = false;
    }
  }
    // Helper method to format dates for API
  private formatDateForApi(date: Date): string {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD for API
  }
  
  // Helper method to format a date with leading zeros (DD/MM/YYYY)
  private formatDateWithLeadingZeros(date: Date): string {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
