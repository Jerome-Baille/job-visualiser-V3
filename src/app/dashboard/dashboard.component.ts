import { Component, OnInit } from '@angular/core';
import { JobService } from '../services/job.service';
import { JobData } from '../interfaces';
import { LoaderService } from '../services/loader.service';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { InProgressJobsComponent } from "./in-progress-jobs/in-progress-jobs.component";
import { ChartContainerComponent } from "./chart-container/chart-container.component";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    InProgressJobsComponent, 
    ChartContainerComponent,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  jobs: JobData[] = [];
  readonly isAuthenticated: () => boolean;

  constructor(
    private jobService: JobService,
    private loader: LoaderService,
    private toast: ToastService,
    private auth: AuthService
  ) {
    this.isAuthenticated = this.auth.isAuthenticated;
  }

  async ngOnInit() {
    if (this.isAuthenticated()) {
      this.loader.show();
      try {
        this.jobs = await this.jobService.getOpportunities();
      } catch (error: any) {
        this.toast.error(error?.message || 'An unknown error occurred');
      } finally {
        this.loader.hide();
      }
    }
  }

  get positiveJobs() {
    return this.jobs.filter(job => job.decision === 'positive').length;
  }
  get inProgressJobs() {
    return this.jobs.filter(job => job.decision === 'in progress').length;
  }
  get unknownJobs() {
    return this.jobs.filter(job => job.decision === 'unknown' || job.decision === 'expired').length;
  }
  get negativeJobs() {
    return this.jobs.filter(job => job.decision === 'negative').length;
  }
}
