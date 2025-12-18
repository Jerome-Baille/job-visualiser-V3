import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/services/auth.service';
import { SnackbarService } from '../../../core/services/snackbar.service';

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

// Custom date formats
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({  
  selector: 'app-detail',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDividerModule,
    RouterLink,
    RouterLink
],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }, // Using British English locale for DD/MM/YYYY format
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
})
export class DetailComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  openLink(url: string) {
    window.open(url, '_blank');
  }
  jobForm!: FormGroup;
  jobId: string | null = null;
  loading = true;
  readonly isAuthenticated: () => boolean;
  showDeleteConfirm = false;

  // Define the valid options for case insensitive matching
  private readonly jobTypeOptions = ['Remote', 'Hybrid', 'On Site'];
  private readonly decisionOptions = ['positive', 'negative', 'in progress', 'expired', 'unknown'];

  constructor() {
    this.isAuthenticated = this.authService.isAuthenticated;
  }  

  // Helper method to normalize job type values (case insensitive)
  private normalizeJobType(value: string): string {
    if (!value) return 'Remote'; // default value
    
    const normalizedValue = value.trim();
    const foundOption = this.jobTypeOptions.find(option => 
      option.toLowerCase() === normalizedValue.toLowerCase()
    );
    
    return foundOption || 'Remote'; // fallback to default
  }

  // Helper method to normalize decision values (case insensitive)
  private normalizeDecision(value: string): string {
    if (!value) return 'unknown'; // default value
    
    const normalizedValue = value.trim();
    const foundOption = this.decisionOptions.find(option => 
      option.toLowerCase() === normalizedValue.toLowerCase()
    );
    
    return foundOption || 'unknown'; // fallback to default
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    this.initForm();
    if (this.jobId) {
      this.jobService.getOpportunity(this.jobId).then(job => {
        // Create a copy of job to avoid modifying original
        const processedJob: Record<string, unknown> = { ...job };
        
        // Process application date
        if (job['applicationDate'] && typeof job['applicationDate'] === 'string') {
          processedJob['applicationDate'] = this.parseStringToDate(job['applicationDate']);
        }
        
        // Process interview date
        if (job['interviewDate'] && typeof job['interviewDate'] === 'string') {
          processedJob['interviewDate'] = this.parseStringToDate(job['interviewDate']);
        }
          // Process decision date
        if (job['decisionDate'] && typeof job['decisionDate'] === 'string') {
          processedJob['decisionDate'] = this.parseStringToDate(job['decisionDate']);
        }
        
        // Normalize job type and decision values (case insensitive)
        if (job['type']) {
          processedJob['type'] = this.normalizeJobType(String(job['type']));
        }
        if (job['decision']) {
          processedJob['decision'] = this.normalizeDecision(String(job['decision']));
        }
        
        // Update the form
        this.jobForm.patchValue(processedJob);
        this.loading = false;
      }).catch(() => {
        this.snackbar.error('Failed to load job data.');
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }
  
  // Helper method to parse date strings to Date objects
  private parseStringToDate(dateString: string): Date | string {
    try {
      let dateObject: Date | null = null;
      
      // Check if date is in ISO format (YYYY-MM-DD)
      if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('T')[0].split('-');
        dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } 
      // Check if date is in DD/MM/YYYY format
      else if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const [day, month, year] = parts;
          dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        }
      }
      
      // Return date object if valid, otherwise return original string
      return (dateObject && !isNaN(dateObject.getTime())) ? dateObject : dateString;
    } catch (e) {
      console.error('Date parsing failed:', e);
      return dateString;
    }
  }initForm() {
    this.jobForm = this.fb.group({
      name: ['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      type: ['Remote', Validators.required],
      link: [''],
      applicationDate: [null, Validators.required], // Accept Date objects
      applicationYear: [''],
      interviewDate: [null], // Changed to accept Date objects
      decisionDate: [null], // Changed to accept Date objects
      decision: ['unknown', Validators.required],
      id: ['']
    });
  }  setTodayRefusal() {
    const now = new Date();
    this.jobForm.patchValue({
      decisionDate: now,
      decision: 'negative'
    });
  }async onSubmit() {
    if (this.jobForm.invalid) return;
    
    // Handle date formatting for submission
    const formData = { ...this.jobForm.value };
    
    // Format the application date if it's a Date object
    if (formData.applicationDate instanceof Date) {
      formData.applicationDate = this.formatDateToString(formData.applicationDate);
    }
    
    // Format the interview date if it's a Date object
    if (formData.interviewDate instanceof Date) {
      formData.interviewDate = this.formatDateToString(formData.interviewDate);
    }
    
    // Format the decision date if it's a Date object
    if (formData.decisionDate instanceof Date) {
      formData.decisionDate = this.formatDateToString(formData.decisionDate);
    }
    
    try {
      await this.jobService.putOpportunity({ ...formData, id: this.jobId });
      this.snackbar.success('The job application has been successfully updated!');
    } catch {
      this.snackbar.error('Oh no, something went wrong! Try again');
    }
  }
  confirmDelete() {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Confirm Deletion',
        message: "Are you sure? You can't undo this action afterwards.",
        confirmText: 'Delete',
        cancelText: 'Cancel',
        confirmColor: 'warn' as const,
        confirmIcon: 'delete'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteJob();
      }
    });
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }

  async deleteJob() {
    if (!this.jobId) return;
    try {
      await this.jobService.deleteOpportunity(this.jobId);
      this.snackbar.success('The job application has been deleted from the database!');
      this.router.navigate(['/list']);
    } catch {
      this.snackbar.error('Oh no, something went wrong! Try again');
    }
    this.showDeleteConfirm = false;
  }

  // Helper method to format dates to strings in DD/MM/YYYY format
  private formatDateToString(date: Date): string {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
