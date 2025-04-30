import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { JobData } from '../services/job.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-in-progress-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './in-progress-jobs.component.html',
  styleUrls: ['./in-progress-jobs.component.scss']
})
export class InProgressJobsComponent {
  @Input() jobs: JobData[] = [];

  get inProgressJobs(): JobData[] {
    return this.jobs.filter(job => job.decision === 'in progress');
  }

  get inProgressCount(): number {
    return this.inProgressJobs.length;
  }

  constructor(private router: Router) {}

  goToJob(job: JobData) {
    this.router.navigate(['/job', job.id]);
  }
}
