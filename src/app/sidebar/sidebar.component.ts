import { Component, OnInit, signal, inject, OnDestroy, Renderer2 } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [NgIf, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private breakpointObserver = inject(BreakpointObserver);
  private renderer = inject(Renderer2);
  private destroy$ = new Subject<void>();
  
  isSidebarClosed = signal(false);
  isMobileView = signal(false);
  
  ngOnInit(): void {
    this.loadSidebarState();
    this.setupResponsiveObserver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setupResponsiveObserver(): void {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        // True if viewport is mobile sized
        const isMobile = result.matches;
        this.isMobileView.set(isMobile);
        
        // If switching to mobile view, ensure sidebar is closed
        if (isMobile) {
          this.isSidebarClosed.set(true);
        }
        
        this.updateBodyClass();
      });
  }

  isAuthenticated(): boolean {
    return this.auth.isAuthenticated();
  }

  toggleSidebar(): void {
    this.isSidebarClosed.update(value => !value);
    this.saveSidebarState();
    this.updateBodyClass();
  }

  loadSidebarState(): void {
    const val = localStorage.getItem('isSidebarClosed');
    this.isSidebarClosed.set(val === 'true');
  }

  saveSidebarState(): void {
    localStorage.setItem('isSidebarClosed', String(this.isSidebarClosed()));
  }
  shouldShowSidebar(): boolean {
    // On mobile, don't add sidebar to the DOM at all
    if (this.isMobileView()) {
      return false;
    }
    // On desktop, show sidebar if authenticated
    return this.isAuthenticated();
  }
  
  /**
   * Updates the body class to control the backdrop
   */
  private updateBodyClass(): void {
    const body = document.body;
    
    if (this.isMobileView() && !this.isSidebarClosed() && this.isAuthenticated()) {
      this.renderer.addClass(body, 'sidebar-open');
    } else {
      this.renderer.removeClass(body, 'sidebar-open');
    }
  }
}
