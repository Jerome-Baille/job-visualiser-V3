import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../services/job.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { JobData } from '../../interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
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
    private router: Router
  ) {
    this.isAuthenticated = this.authService.isAuthenticated;
  }

  ngOnInit(): void {
    this.jobId = this.route.snapshot.paramMap.get('id');
    this.initForm();
    if (this.jobId) {
      this.jobService.getOpportunity(this.jobId).then(job => {
        this.jobForm.patchValue(job);
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
      applicationDate: ['', Validators.required],
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
  }

  async onSubmit() {
    if (this.jobForm.invalid) return;
    try {
      await this.jobService.putOpportunity({ ...this.jobForm.value, id: this.jobId });
      this.toast.success('The job application has been successfully updated!');
    } catch {
      this.toast.error('Oh no, something went wrong! Try again');
    }
  }

  confirmDelete() {
    this.showDeleteConfirm = true;
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
