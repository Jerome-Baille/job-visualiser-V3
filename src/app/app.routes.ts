import { Routes } from '@angular/router';
import { AfterRegisterComponent } from './features/auth/after-register/after-register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AuthComponent } from './features/auth/auth/auth.component';
import { Page404Component } from './features/page404/page404.component';

export const routes: Routes = [
  // Auth callback routes at root level
  {
    path: 'auth/after-login',
    loadComponent: () =>
      import('./features/auth/after-login/after-login.component').then(
        (m) => m.AfterLoginComponent
      ),
  },
  { path: 'auth/after-register', component: AfterRegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'create',
    loadComponent: () =>
      import('./features/create/create.component').then(
        (m) => m.CreateComponent
      ),
  },
  {
    path: 'list',
    loadComponent: () =>
      import('./features/list/list.component').then((m) => m.ListComponent),
  },
  {
    path: 'job-boards',
    loadComponent: () =>
      import('./features/job-boards/job-boards.component').then(
        (m) => m.JobBoardsComponent
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
  },
  {
    path: 'how-to-use',
    loadComponent: () =>
      import('./features/how-to-use/how-to-use.component').then(
        (m) => m.HowToUseComponent
      ),
  },
  {
    path: 'job/:id',
    loadComponent: () =>
      import('./features/list/detail/detail.component').then(
        (m) => m.DetailComponent
      ),
  },
  { path: 'auth', component: AuthComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', component: Page404Component },
];
