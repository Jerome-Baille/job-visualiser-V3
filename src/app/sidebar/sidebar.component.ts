import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  isSidebarClosed = false;
  isAuthenticated = false;

  constructor(private auth: AuthService) {
    this.isAuthenticated = this.auth.isAuthenticated();
    this.loadSidebarState();
  }

  toggleSidebar() {
    this.isSidebarClosed = !this.isSidebarClosed;
    this.saveSidebarState();
  }

  loadSidebarState() {
    const val = localStorage.getItem('isSidebarClosed');
    this.isSidebarClosed = val === 'true';
  }

  saveSidebarState() {
    localStorage.setItem('isSidebarClosed', String(this.isSidebarClosed));
  }
}
