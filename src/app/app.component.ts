import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoaderService } from './services/loader.service';
import { AuthComponent } from "./auth/auth/auth.component";
import { HeaderComponent } from "./header/header.component";
import { SidebarComponent } from "./sidebar/sidebar.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, AuthComponent, HeaderComponent, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'job-visualiser-V3';

  isAuthenticated = false;
  isLoading = false;
  isLargerThanMD = false;

  constructor(
    private auth: AuthService,
    private loader: LoaderService
  ) { }

  ngOnInit() {
    this.isAuthenticated = this.auth.isAuthenticated();
    this.checkScreenSize();
  }


  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    // md breakpoint ~768px
    this.isLargerThanMD = window.innerWidth >= 768;
  }
}
