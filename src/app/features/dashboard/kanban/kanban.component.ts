import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { KanbanDialogComponent } from '../kanban-dialog/kanban-dialog.component';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { TaskService } from '../../../core/services/task.service';
import { TaskData } from '../../../shared/interfaces';
import { JobData } from '../../../shared/interfaces';

interface KanbanTask {
  id: number;
  description: string;
  dueDate?: string;
  priority: 'Low' | 'Medium' | 'High';
  jobId?: number[];
  status: 'Backlog' | 'In Progress' | 'Done';
  // Optionally, you can add more fields as needed
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss'
})
export class KanbanComponent implements OnInit {
  private dialog = inject(MatDialog);
  private snackbar = inject(SnackbarService);
  private taskService = inject(TaskService);

  @Input() jobs: JobData[] = [];

  // Sample tasks - in a real app these would come from a service

  todoTasks: KanbanTask[] = [];
  inProgressTasks: KanbanTask[] = [];
  doneTasks: KanbanTask[] = [];
  loading = false;


  ngOnInit() {
    this.fetchTasks();
  }

  private async fetchTasks() {
    this.loading = true;
    try {
      const tasks = await this.taskService.getTasks();
      this.categorizeTasks(tasks);
    } catch {
      this.snackbar.error('Failed to load tasks');
    } finally {
      this.loading = false;
    }
  }

  private categorizeTasks(tasks: TaskData[]) {
    // Filter out tasks without an id (shouldn't happen, but for type safety)
    this.todoTasks = tasks.filter(t => t.status === 'Backlog' && t.id !== undefined) as KanbanTask[];
    this.inProgressTasks = tasks.filter(t => t.status === 'In Progress' && t.id !== undefined) as KanbanTask[];
    this.doneTasks = tasks.filter(t => t.status === 'Done' && t.id !== undefined) as KanbanTask[];
  }



  async drop(event: CdkDragDrop<KanbanTask[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );

      // Update the status of the moved task and persist
      const movedTask = event.container.data[event.currentIndex];
      let newStatus: 'Backlog' | 'In Progress' | 'Done' = 'Backlog';
      if (event.container.id === 'todo-list') {
        newStatus = 'Backlog';
      } else if (event.container.id === 'in-progress-list') {
        newStatus = 'In Progress';
      } else if (event.container.id === 'done-list') {
        newStatus = 'Done';
      }
      try {
        await this.taskService.updateTask(movedTask.id, { status: newStatus });
        movedTask.status = newStatus;
        this.snackbar.success(`Task moved to ${newStatus}`);
      } catch {
        this.snackbar.error('Failed to update task status');
        // Optionally, reload tasks to restore state
        this.fetchTasks();
      }
    }
  }

  addNewTask() {
    const buttonElement = document.activeElement as HTMLElement; // Get the currently focused element
    buttonElement.blur(); // Remove focus from the button
    const dialogRef = this.dialog.open(KanbanDialogComponent, {
      width: '500px',
      data: { task: null }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.taskService.createTask(result);
          this.snackbar.success('Task created successfully');
          this.fetchTasks();
        } catch {
          this.snackbar.error('Failed to create task');
        }
      }
    });
  }
  
  editTask(task: KanbanTask) {
    const buttonElement = document.activeElement as HTMLElement; // Get the currently focused element
    buttonElement.blur(); // Remove focus from the button
    const dialogRef = this.dialog.open(KanbanDialogComponent, {
      width: '500px',
      data: { task: task }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await this.taskService.updateTask(task.id, result);
          this.snackbar.success('Task updated successfully');
          this.fetchTasks();
        } catch {
          this.snackbar.error('Failed to update task');
        }
      }
    });
  }

  async deleteTask(task: KanbanTask) {
    try {
      await this.taskService.deleteTask(task.id);
      this.snackbar.success('Task deleted');
      this.fetchTasks();
    } catch {
      this.snackbar.error('Failed to delete task');
    }
  }

  getTaskColor(priority: string): string {
    switch (priority) {
      case 'High': return 'var(--error-color)';
      case 'Medium': return 'var(--warning-color)';
      case 'Low': return 'var(--info-color)';
      default: return 'var(--info-color)';
    }
  }
}