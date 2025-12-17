import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserData } from '../../shared/interfaces';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  private authBaseURL = `${environment.authBaseURL}/user`;

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

  async patchUser(userId: number, profile: Partial<UserData>): Promise<unknown> {
    return firstValueFrom(
      this.http.patch<unknown>(`${this.authBaseURL}/${userId}`, profile, { withCredentials: true })
    );
  }

  async deleteAccount(userId: number): Promise<unknown> {
    return firstValueFrom(
      this.http.delete<unknown>(`${this.authBaseURL}/${userId}`, { withCredentials: true })
    );
  }
}
