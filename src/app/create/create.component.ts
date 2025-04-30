import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../services/job.service';
import { ToastService } from '../services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
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
    private toast: ToastService,
    private router: Router
  ) {
    const today = new Date();
    this.createForm = this.fb.group({
      name: ['', Validators.required],
      company: ['', Validators.required],
      location: ['', Validators.required],
      type: ['Remote', Validators.required],
      link: ['', Validators.required],
      applicationDate: [today.toISOString().split('T')[0], Validators.required],
      interviewDate: [''],
      decisionDate: [''],
      decision: ['unknown', Validators.required]
    });
  }

  async onSubmit() {
    if (this.createForm.invalid) return;
    this.isSubmitting = true;
    try {
      await this.jobService.postOpportunity(this.createForm.value);
      this.toast.success('Opportunity created!');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.toast.error(err?.error?.message || 'Error creating opportunity.');
      this.isSubmitting = false;
    }
  }
}
