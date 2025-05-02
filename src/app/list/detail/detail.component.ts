import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { DeleteConfirmDialogComponent } from './delete-dialog.component';

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
    CommonModule,
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
    MatDividerModule
  ],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss'],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'fr' } // Using French locale for DD/MM/YYYY format
  ]
})
export class DetailComponent implements OnInit {
  openLink(url: string) {
    window.open(url, '_blank');
  }
  jobForm!: FormGroup;
  jobId: string | null = null;
  loading = true;
  readonly isAuthenticated: () => boolean;
  showDeleteConfirm = false;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private jobService: JobService,
    private authService: AuthService,
    private toast: ToastService,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.isAuthenticated = this.authService.isAuthenticated;
  }
  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    this.initForm();
    if (this.jobId) {      this.jobService.getOpportunity(this.jobId).then(job => {
        // Handle date formatting for display
        if (job.applicationDate && typeof job.applicationDate === 'string') {
          // Try to parse the date and convert it to a Date object for the datepicker
          try {
            let dateObject: Date | null = null;
            
            // Check if date is in ISO format (YYYY-MM-DD)
            if (job.applicationDate.includes('-')) {
              const [year, month, day] = job.applicationDate.split('T')[0].split('-');
              dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            } 
            // Check if date is already in DD/MM/YYYY format
            else if (job.applicationDate.includes('/')) {
              const [day, month, year] = job.applicationDate.split('/');
              dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            }
            
            // Store the original string value
            const originalDateString = job.applicationDate;
            
            // Update the form with the date object for the datepicker
            if (dateObject && !isNaN(dateObject.getTime())) {
              this.jobForm.get('applicationDate')?.setValue(dateObject);
            } else {
              this.jobForm.get('applicationDate')?.setValue(originalDateString);
            }
          } catch (e) {
            // If date parsing fails, leave as is
            console.error('Date parsing failed:', e);
            this.jobForm.get('applicationDate')?.setValue(job.applicationDate);
          }
        }
        
        // Remove applicationDate from job object before patching to avoid conflicts
        const { applicationDate, ...jobWithoutDate } = job;
        this.jobForm.patchValue(jobWithoutDate);
        this.loading = false;
      }).catch(() => {
        this.toast.error('Failed to load job data.');
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }
  initForm() {
    this.jobForm = this.fb.group({
      name: ['', Validators.required],
      company: ['', Validators.required],
      location: [''],
      type: ['Remote', Validators.required],
      link: [''],
      applicationDate: [null, Validators.required], // Changed from '' to null to accept Date objects
      applicationYear: [''],
      interviewDate: [''],
      decisionDate: [''],
      decision: ['unknown', Validators.required],
      id: ['']
    });
  }
  setTodayRefusal() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    this.jobForm.patchValue({
      decisionDate: `Refus le ${day}/${month}/${year}`,
      decision: 'negative'
    });
  }  async onSubmit() {
    if (this.jobForm.invalid) return;
    
    // Handle date formatting for submission
    const formData = { ...this.jobForm.value };
    
    // Format the application date if it's a Date object
    const applicationDateValue = this.jobForm.get('applicationDate')?.value;
    if (applicationDateValue instanceof Date) {
      // Format as DD/MM/YYYY for display
      const day = String(applicationDateValue.getDate()).padStart(2, '0');
      const month = String(applicationDateValue.getMonth() + 1).padStart(2, '0');
      const year = applicationDateValue.getFullYear();
      
      // Use the formatted date or convert to expected backend format
      formData.applicationDate = `${day}/${month}/${year}`;
    }
    
    try {
      await this.jobService.putOpportunity({ ...formData, id: this.jobId });
      this.toast.success('The job application has been successfully updated!');
    } catch {
      this.toast.error('Oh no, something went wrong! Try again');
    }
  }
  confirmDelete() {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent);
    
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
      this.toast.success('The job application has been deleted from the database!');
      this.router.navigate(['/list']);
    } catch {
      this.toast.error('Oh no, something went wrong! Try again');
    }
    this.showDeleteConfirm = false;
  }
}
