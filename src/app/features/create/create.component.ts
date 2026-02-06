import { Component, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { JobService } from '../../core/services/job.service';
import { SnackbarService } from '../../core/services/snackbar.service';
import { JobData } from '../../shared/interfaces';
import { JobFormComponent, JobFormData } from '../../shared/components/job-form/job-form.component';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    JobFormComponent
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent {
  private jobService = inject(JobService);
  private snackbar = inject(SnackbarService);
  private router = inject(Router);

  @ViewChild(JobFormComponent) jobFormComponent?: JobFormComponent;

  isSubmitting = false;
  initialData: JobFormData;

  constructor() {
    const today = new Date();
    this.initialData = {
      name: '',
      company: '',
      location: '',
      type: 'Remote',
      link: '',
      applicationDate: today,
      interviewDate: null,
      decisionDate: null,
      decision: 'unknown',
      notes: []
    };
  }

  async onFormSubmit(formData: JobFormData) {
    this.isSubmitting = true;
    
    try {
      const jobData: JobData = {
        ...(formData as Record<string, unknown>),
        applicationDate: formData.applicationDate as string | undefined,
        interviewDate: formData.interviewDate as string | undefined,
        decisionDate: formData.decisionDate as string | undefined,
      };
      
      await this.jobService.postOpportunity(jobData);
      this.snackbar.success('Opportunity created!');
      this.router.navigate(['/dashboard']);
    } catch (err: unknown) {
      const backendMessage = (err as { error?: { message?: string } })?.error?.message;
      const message = backendMessage || (err instanceof Error ? err.message : undefined);
      this.snackbar.error(message || 'Error creating opportunity.');
      this.isSubmitting = false;
    }
  }

  onLinkOpen(url: string) {
    window.open(url, '_blank');
  }

  get isFormValid(): boolean {
    return this.jobFormComponent?.isValid ?? false;
  }

  submitForm(): void {
    this.jobFormComponent?.onSubmit();
  }
}
