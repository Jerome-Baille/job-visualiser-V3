
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { UserData } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private authBaseURL = `${environment.authBaseURL}/user`;

  constructor(private http: HttpClient) {}

  async getProfile(): Promise<UserData> {
    return firstValueFrom(
      this.http.get<UserData>(`${this.authBaseURL}/profile`, { withCredentials: true })
    );
  }

  async searchUser(searchTerm: string): Promise<UserData[]> {
    return firstValueFrom(
      this.http.get<UserData[]>(`${this.authBaseURL}/search?username=${encodeURIComponent(searchTerm)}`, { withCredentials: true })
    );
  }

  async patchUser(userId: number, profile: Partial<UserData>): Promise<any> {
    return firstValueFrom(
      this.http.patch(`${this.authBaseURL}/${userId}`, profile, { withCredentials: true })
    );
  }

  async deleteAccount(userId: number): Promise<any> {
    return firstValueFrom(
      this.http.delete(`${this.authBaseURL}/${userId}`, { withCredentials: true })
    );
  }
}
