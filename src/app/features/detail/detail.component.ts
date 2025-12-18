import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { JobFormComponent, JobFormData } from '../../shared/components/job-form/job-form.component';
import { JobService } from '../../core/services/job.service';
import { AuthService } from '../../core/services/auth.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { JobData } from '../../shared/interfaces';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({  
  selector: 'app-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatDividerModule,
    RouterLink,
    JobFormComponent
],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private jobService = inject(JobService);
  private authService = inject(AuthService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  @ViewChild(JobFormComponent) jobFormComponent?: JobFormComponent;

  jobId: string | null = null;
  loading = true;
  readonly isAuthenticated: () => boolean;
  jobData: JobFormData | null = null;

  constructor() {
    this.isAuthenticated = this.authService.isAuthenticated;
  }  

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    if (this.jobId) {
      this.jobService.getOpportunity(this.jobId).then(job => {
        this.jobData = {
          name: job['name'] as string || '',
          company: job['company'] as string || '',
          location: job['location'] as string,
          type: job['type'] as string || 'Remote',
          link: job['link'] as string,
          applicationDate: job['applicationDate'] as string,
          interviewDate: job['interviewDate'] as string,
          decisionDate: job['decisionDate'] as string,
          decision: job['decision'] as string || 'unknown',
          id: job['id'] as string
        };
        this.loading = false;
      }).catch(() => {
        this.snackbar.error('Failed to load job data.');
        this.loading = false;
      });
    } else {
      this.loading = false;
    }
  }

  async onFormSubmit(formData: JobFormData) {
    try {
      const jobDataToSave: JobData = {
        ...(formData as Record<string, unknown>),
        id: this.jobId || undefined,
        applicationDate: formData.applicationDate as string | undefined,
        interviewDate: formData.interviewDate as string | undefined,
        decisionDate: formData.decisionDate as string | undefined,
      };
      
      await this.jobService.putOpportunity(jobDataToSave);
      this.snackbar.success('The job application has been successfully updated!');
    } catch {
      this.snackbar.error('Oh no, something went wrong! Try again');
    }
  }

  onLinkOpen(url: string) {
    window.open(url, '_blank');
  }

  setTodayRefusal() {
    this.jobFormComponent?.setTodayRefusal();
  }

  get isFormValid(): boolean {
    return this.jobFormComponent?.isValid ?? false;
  }

  submitForm(): void {
    this.jobFormComponent?.onSubmit();
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

  async deleteJob() {
    if (!this.jobId) return;
    try {
      await this.jobService.deleteOpportunity(this.jobId);
      this.snackbar.success('The job application has been deleted from the database!');
      this.router.navigate(['/list']);
    } catch {
      this.snackbar.error('Oh no, something went wrong! Try again');
    }
  }
}
