import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, NativeDateAdapter } from '@angular/material/core';
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

// Custom date adapter that ensures leading zeros for DD/MM/YYYY
class CustomDateAdapter extends NativeDateAdapter {
  override format(date: Date, displayFormat: Object): string {
    if (!this.isValid(date)) {
      return '';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.includes('/')) {
      const [day, month, year] = value.split('/');
      // Create date assuming day/month/year format (European)
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
    return super.parse(value);
  }
}

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
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: DateAdapter, useClass: CustomDateAdapter }
  ]
})
export class KanbanDialogComponent implements OnInit {
  taskForm: FormGroup;
  dialogTitle: string;
  priorities: string[] = ['Low', 'Medium', 'High'];
  statuses: string[] = ['To Do', 'In Progress', 'Done'];
  statusMap: { [key: string]: string } = {
    'To Do': 'Backlog',
    'Backlog': 'To Do',
    'In Progress': 'In Progress',
    'Done': 'Done'
  };
  isEditMode: boolean;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<KanbanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { task?: TaskData }
  ) {
    this.isEditMode = !!data.task;    this.dialogTitle = this.isEditMode ? 'Edit Task' : 'Create New Task';    this.taskForm = this.fb.group({
      description: ['', Validators.required],
      status: ['To Do', Validators.required],
      priority: ['Medium', Validators.required],
      dueDate: [''], // Empty string to support both date picker and manual entry
      // If we want to add job IDs in the future, can add here
      // jobId: [[]] 
    });
  }
  // Handle date picker selection events
  onDateChange(event: any): void {
    // When datepicker changes, make sure we update the form
    this.taskForm.get('dueDate')?.setValue(event.value);
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.task) {
      // Convert ISO string date to Date object if it exists
      let dueDate = null;
      if (this.data.task.dueDate) {
        dueDate = new Date(this.data.task.dueDate);
      }

      // Convert backend status to display status
      const displayStatus = this.data.task.status === 'Backlog' ? 'To Do' : this.data.task.status;
      
      this.taskForm.patchValue({
        description: this.data.task.description,
        status: displayStatus,
        priority: this.data.task.priority,
        dueDate: dueDate
        // If we add jobId support:
        // jobId: this.data.task.jobId || []
      });
    }
  }  onSubmit(): void {
    if (this.taskForm.invalid) {
      return;
    }

    const taskData = { ...this.taskForm.value };

    // Convert display status to backend status
    if (taskData.status === 'To Do') {
      taskData.status = 'Backlog';
    }

    // Handle date conversion to ISO format (YYYY-MM-DD) for backend
    if (taskData.dueDate) {
      if (taskData.dueDate instanceof Date) {
        // If it's a Date object (from datepicker)
        const d = taskData.dueDate;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        taskData.dueDate = `${year}-${month}-${day}`;
      } else if (typeof taskData.dueDate === 'string' && taskData.dueDate.includes('/')) {
        // If it's a manually entered string in DD/MM/YYYY format
        const [day, month, year] = taskData.dueDate.split('/');
        if (day && month && year) {
          // Ensure correct order for backend: YYYY-MM-DD
          taskData.dueDate = `${year}-${month}-${day}`;
        }
      }
    }

    // Pass the form data back to the parent component
    this.dialogRef.close(taskData);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
