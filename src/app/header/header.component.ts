import { Component, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatBottomSheet, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatBottomSheetModule,
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
  readonly isAuthenticated: () => boolean;
  isLargerThanMD = false;
  showProfileSheet = false;

  constructor(
    public auth: AuthService, 
    private router: Router,
    private bottomSheet: MatBottomSheet
  ) {
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
