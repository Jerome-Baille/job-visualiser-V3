
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { JobData, OpportunitiesStats, PaginatedResponse } from '../../interfaces';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);

  async getOpportunitiesStats(): Promise<OpportunitiesStats> {
    return firstValueFrom(
      this.http.get<OpportunitiesStats>(`${environment.jobURL}/stats`, { withCredentials: true })
    );
  }
  async getOpportunities(limit?: number, offset?: number, type?: string, status?: string, search?: string): Promise<PaginatedResponse<JobData>> {
    let url = `${environment.jobURL}?`;
    const params: string[] = [];
    
    if (limit !== undefined) params.push(`limit=${limit}`);
    if (offset !== undefined) params.push(`offset=${offset}`);
    if (type && type !== 'all') params.push(`type=${encodeURIComponent(type)}`);
    if (status && status !== 'all') params.push(`status=${encodeURIComponent(status)}`);
    if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
    
    url += params.join('&');
    
    return firstValueFrom(
      this.http.get<PaginatedResponse<JobData>>(url, { withCredentials: true })
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

  async deleteOpportunity(id: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${environment.jobURL}/${id}`, { withCredentials: true })
    );
  }

  async exportOpportunities(selectedYear: string, selectedFormat: string): Promise<void> {
    const url = `${environment.jobURL}/export/${selectedYear}/${selectedFormat}`;
    try {
      const responseBlob = await firstValueFrom(
        this.http.get(url, { responseType: 'blob', withCredentials: true })
      );
      const file = new Blob([responseBlob], { type: responseBlob.type });
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        throw new Error(`Failed to export opportunities: ${error.message}`);
      }
      throw error;
    }
  }
}
