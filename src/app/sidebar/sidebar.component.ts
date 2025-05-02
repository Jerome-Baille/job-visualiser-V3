import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  private auth = inject(AuthService);
  
  isSidebarClosed = signal(false);
  
  ngOnInit(): void {
    this.loadSidebarState();
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  toggleSidebar(): void {
    this.isSidebarClosed.update(value => !value);
    this.saveSidebarState();
  }

  loadSidebarState(): void {
    const val = localStorage.getItem('isSidebarClosed');
    this.isSidebarClosed.set(val === 'true');
  }

  saveSidebarState(): void {
    localStorage.setItem('isSidebarClosed', String(this.isSidebarClosed()));
  }
}
