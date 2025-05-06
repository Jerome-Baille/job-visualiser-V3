import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { TaskData } from '../../interfaces';
import { MatIconModule } from '@angular/material/icon';
import { DateMaskDirective } from './date-mask.directive';

// Custom date adapter for dd/MM/yyyy format
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
  selector: 'app-kanban-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    DateMaskDirective
  ],
  templateUrl: './kanban-dialog.component.html',
  styleUrl: './kanban-dialog.component.scss',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class KanbanDialogComponent implements OnInit {
  taskForm: FormGroup;
  dialogTitle: string;
  priorities: string[] = ['Low', 'Medium', 'High'];
  statuses: string[] = ['Backlog', 'In Progress', 'Done'];
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<KanbanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: TaskData }
  ) {
    this.isEditMode = !!data.task;
    this.dialogTitle = this.isEditMode ? 'Edit Task' : 'Create New Task';

    this.taskForm = this.fb.group({
      description: ['', Validators.required],
      status: ['Backlog', Validators.required],
      priority: ['Medium', Validators.required],
      dueDate: ['', [Validators.pattern(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/)]],
      // If we want to add job IDs in the future, can add here
      // jobId: [[]] 
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.task) {
      // Convert ISO string date to DD/MM/YYYY string if it exists
      let dueDate = '';
      if (this.data.task.dueDate) {
        const d = new Date(this.data.task.dueDate);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        dueDate = `${day}/${month}/${year}`;
      }

      this.taskForm.patchValue({
        description: this.data.task.description,
        status: this.data.task.status,
        priority: this.data.task.priority,
        dueDate: dueDate
        // If we add jobId support:
        // jobId: this.data.task.jobId || []
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    const taskData = this.taskForm.value;

    // Convert DD/MM/YYYY to ISO string (YYYY-MM-DD) for backend
    if (taskData.dueDate) {
      const [day, month, year] = taskData.dueDate.split('/');
      if (day && month && year) {
        taskData.dueDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }

    // Pass the form data back to the parent component
    this.dialogRef.close(taskData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
