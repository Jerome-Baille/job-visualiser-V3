import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-mobile-nav',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive],
  template: `
    <nav *ngIf="isAuthenticated()" class="mobile-nav">
      <ul class="mobile-nav-links">
        <li>
          <a routerLink="/dashboard" routerLinkActive="active" aria-label="Dashboard">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
          </a>
        </li>
        <li>
          <a routerLink="/list" routerLinkActive="active" aria-label="List of applications">
            <span class="nav-icon">📋</span>
            <span class="nav-text">List</span>
          </a>
        </li>
        <li>
          <a routerLink="/create" routerLinkActive="active" aria-label="Add a job application">
            <span class="nav-icon">➕</span>
            <span class="nav-text">Add</span>
          </a>
        </li>
        <li>
          <a routerLink="/job-boards" routerLinkActive="active" aria-label="Job Boards">
            <span class="nav-icon">🤝</span>
            <span class="nav-text">Boards</span>
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: [`
    .mobile-nav {
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--primary-color);
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      z-index: 100;
      display: none;
    }

    @media (max-width: 767px) {
      .mobile-nav {
        display: block;
      }
    }

    .mobile-nav-links {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      justify-content: space-around;
    }

    .mobile-nav-links li {
      flex: 1;
    }

    .mobile-nav-links a {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-decoration: none;
      color: var(--link-color);
      padding: 0.5rem 0;
      transition: background 0.2s;
    }

    .mobile-nav-links a.active, .mobile-nav-links a:hover {
      background-color: var(--secondary-color);
    }

    .nav-icon {
      font-size: 1.2rem;
      margin-bottom: 0.25rem;
    }

    .nav-text {
      font-size: 0.75rem;
    }
  `]
})
export class MobileNavComponent {
  private auth = inject(AuthService);
  
  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }
}
