import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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
import { JobService } from '../../core/services/job.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { JobData } from '../../shared/interfaces';

// Custom date adapter that ensures leading zeros
class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: object): string {
    void displayFormat;
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
  private fb = inject(FormBuilder);
  private jobService = inject(JobService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);

  createForm: FormGroup;
  isSubmitting = false;
  constructor() {
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
      const rawFormValue = this.createForm.value as {
        applicationDate?: Date | string | null;
        interviewDate?: Date | string | null;
        decisionDate?: Date | string | null;
        [key: string]: unknown;
      };

      // Normalize date fields to strings for the API (no Date/null in payload)
      const applicationDate = rawFormValue.applicationDate;
      const applicationDateString =
        applicationDate instanceof Date
          ? this.formatDateForApi(applicationDate)
          : typeof applicationDate === 'string'
            ? applicationDate
            : undefined;

      const interviewDate = rawFormValue.interviewDate;
      const interviewDateString =
        interviewDate instanceof Date
          ? this.formatDateForApi(interviewDate)
          : typeof interviewDate === 'string'
            ? interviewDate
            : undefined;

      const decisionDate = rawFormValue.decisionDate;
      const decisionDateString =
        decisionDate instanceof Date
          ? this.formatDateForApi(decisionDate)
          : typeof decisionDate === 'string'
            ? decisionDate
            : undefined;

      const formData: JobData = {
        ...(rawFormValue as Record<string, unknown>),
        applicationDate: applicationDateString,
        interviewDate: interviewDateString,
        decisionDate: decisionDateString,
      };
      
      await this.jobService.postOpportunity(formData);
      this.snackbar.success('Opportunity created!');
      this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      const backendMessage = (err as { error?: { message?: string } })?.error?.message;
      const message = backendMessage || (err instanceof Error ? err.message : undefined);
      this.snackbar.error(message || 'Error creating opportunity.');
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
