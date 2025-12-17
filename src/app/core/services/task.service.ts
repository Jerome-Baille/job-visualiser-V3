
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TaskData } from '../../shared/interfaces';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);

  private baseUrl = environment.taskURL;

  async getTasks(): Promise<TaskData[]> {
    return firstValueFrom(
      this.http.get<TaskData[]>(`${this.baseUrl}`, { withCredentials: true })
    );
  }

  async createTask(task: Partial<TaskData>): Promise<TaskData> {
    return firstValueFrom(
      this.http.post<TaskData>(`${this.baseUrl}`, task, { withCredentials: true })
    );
  }

  async updateTask(taskId: number, task: Partial<TaskData>): Promise<TaskData> {
    return firstValueFrom(
      this.http.patch<TaskData>(`${this.baseUrl}/${taskId}`, task, { withCredentials: true })
    );
  }

  async deleteTask(taskId: number): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}/${taskId}`, { withCredentials: true })
    );
  }

  async getTasksByJob(jobId: number): Promise<TaskData[]> {
    return firstValueFrom(
      this.http.get<TaskData[]>(`${this.baseUrl}/job/${jobId}`, { withCredentials: true })
    );
  }
}
