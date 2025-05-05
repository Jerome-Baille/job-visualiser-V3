import { Component, OnDestroy, effect, EffectRef } from '@angular/core';
import { JobService } from '../services/job.service';
import { JobData } from '../interfaces';
import { SnackbarService } from '../services/snackbar.service';
import { AuthService } from '../services/auth.service';
import { NgIf } from '@angular/common';
import { InProgressJobsComponent } from "./in-progress-jobs/in-progress-jobs.component";
import { ChartContainerComponent } from "./chart-container/chart-container.component";
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgIf,
    InProgressJobsComponent,
    ChartContainerComponent,
    MatIconModule,
    MatButtonModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnDestroy {
  jobs: JobData[] = [];
  private jobsLoaded = false;
  private destroyEffect: EffectRef | null = null;
  constructor(
    private jobService: JobService,
    private snackbar: SnackbarService,
    private router: Router,
    public auth: AuthService
  ) {
    this.destroyEffect = effect(async () => {
      const isAuth = this.auth.isAuthenticated();
      if (isAuth && !this.jobsLoaded) {
        try {
          // Get all opportunities with a large limit to ensure we get all data for the dashboard
          const response = await this.jobService.getOpportunities();
          this.jobs = response.data;
          this.jobsLoaded = true;
        } catch (error: any) {
          this.snackbar.error(error?.message || 'An unknown error occurred');
        }
      } else if (!isAuth) {
        this.jobs = [];
        this.jobsLoaded = false;
        // Optionally, show login prompt here
      }
    });
  }

  ngOnDestroy() {
    if (this.destroyEffect) {
      this.destroyEffect.destroy();
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
  }  get isAuthenticated() {
    return this.auth.isAuthenticated();
  }  

  navigateToList(status: string) {
    this.router.navigate(['/list'], { 
      queryParams: { 
        status: status,
        page: 1
      } 
    });
  }

  navigateToListWithExpired() {
    this.router.navigate(['/list'], { 
      queryParams: { 
        status: 'unknown',
        includeExpired: 'true',
        page: 1
      } 
    });
  }
}
