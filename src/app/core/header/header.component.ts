import { Component, HostListener, inject } from '@angular/core';
import { Router, RouterModule, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NgClass } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NgClass,
    RouterModule,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatRippleModule,
    MatDividerModule,
    MatListModule
],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  readonly isAuthenticated: () => boolean;
  isLargerThanMD = false;
  showProfileSheet = false;
  constructor() {
    this.isAuthenticated = this.auth.isAuthenticated;
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isLargerThanMD = window.innerWidth >= 768;
  }
  
  isProfileActive(): boolean {
    return this.router.url.startsWith('/profile');
  }

  openProfileSheet() {
    this.showProfileSheet = true;
  }

  closeProfileSheet() {
    this.showProfileSheet = false;
  }

  logout() {
    this.auth.logout();
    this.closeProfileSheet();
    this.router.navigate(['/']);
  }
}
