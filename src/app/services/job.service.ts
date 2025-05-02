import { OpportunitiesStats, PaginatedResponse } from '../interfaces';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { JobData } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class JobService {
  constructor(private http: HttpClient) {}
  async getOpportunitiesStats(): Promise<OpportunitiesStats> {
    return firstValueFrom(
      this.http.get<OpportunitiesStats>(`${environment.jobURL}/stats`, { withCredentials: true })
    );
  }

  async getOpportunities(limit?: number, offset?: number): Promise<PaginatedResponse<JobData>> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<JobData>>(`${environment.jobURL}?limit=${limit}&offset=${offset}`, { withCredentials: true })
    );
  }

  async getOpportunity(id: string): Promise<JobData> {
    return firstValueFrom(
      this.http.get<JobData>(`${environment.jobURL}/${id}`, { withCredentials: true })
    );
  }

  async postOpportunity(opportunity: JobData): Promise<JobData> {
    return firstValueFrom(
      this.http.post<JobData>(`${environment.jobURL}`, opportunity, { withCredentials: true })
    );
  }

  async putOpportunity(opportunity: JobData): Promise<JobData> {
    return firstValueFrom(
      this.http.patch<JobData>(`${environment.jobURL}/${opportunity.id}`, opportunity, { withCredentials: true })
    );
  }

  async deleteOpportunity(id: string): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${environment.jobURL}/${id}`, { withCredentials: true })
    );
  }

  async exportOpportunities(selectedYear: string, selectedFormat: string): Promise<void> {
    const url = `${environment.jobURL}/export/${selectedYear}/${selectedFormat}`;
    try {
      const response: any = await firstValueFrom(
        this.http.get(url, { responseType: 'blob' as 'json' })
      );
      const file = new Blob([response], { type: response.type });
      let filename;
      if (selectedFormat === 'excel') {
        filename = `Jerome_BAILLE_-_Tableau_de_bord_des_candidature_-_${Date.now()}.xlsx`;
      } else {
        filename = `Jerome_BAILLE_-_Tableau_de_bord_des_candidature_-_${Date.now()}.pdf`;
      }
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(file);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      }, 0);
    } catch (error: any) {
      if (error instanceof Error) {
        console.error(error);
        throw new Error(`Failed to export opportunities: ${error.message}`);
      } else {
        throw error;
      }
    }
  }
}
