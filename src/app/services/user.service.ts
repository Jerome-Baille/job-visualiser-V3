
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { UserData } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = `${environment.apiBaseURL}/user`;

  constructor(private http: HttpClient) {}

  async getProfile(): Promise<UserData> {
    return firstValueFrom(
      this.http.get<UserData>(`${this.baseUrl}/profile`, { withCredentials: true })
    );
  }

  async searchUser(searchTerm: string): Promise<UserData[]> {
    return firstValueFrom(
      this.http.get<UserData[]>(`${this.baseUrl}/search?username=${encodeURIComponent(searchTerm)}`, { withCredentials: true })
    );
  }

  async patchUser(userId: number, profile: Partial<UserData>): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${this.baseUrl}/${userId}`, profile, { withCredentials: true })
    );
  }

  async deleteAccount(userId: number): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.baseUrl}/${userId}`, { withCredentials: true })
    );
  }
}
