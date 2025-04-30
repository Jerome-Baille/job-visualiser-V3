import { Routes } from '@angular/router';
import { AfterLoginComponent } from './auth/after-login/after-login.component';
import { AfterRegisterComponent } from './auth/after-register/after-register.component';
import { AuthComponent } from './auth/auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { Page404Component } from './page404/page404.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    // Auth callback routes at root level
    { path: 'auth/after-login', component: AfterLoginComponent },
    { path: 'auth/after-register', component: AfterRegisterComponent },

    // Main app routes under Layout
    {
        path: '',
        component: AppComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: DashboardComponent },
            { path: 'create', loadComponent: () => import('./create/create.component').then(m => m.CreateComponent) },
            { path: 'list', loadComponent: () => import('./list/list.component').then(m => m.ListComponent) },
            { path: 'job-boards', loadComponent: () => import('./job-boards/job-boards.component').then(m => m.JobBoardsComponent) },
            { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
            { path: 'how-to-use', loadComponent: () => import('./how-to-use/how-to-use.component').then(m => m.HowToUseComponent) },
            { path: 'job/:id', loadComponent: () => import('./list/detail/detail.component').then(m => m.DetailComponent) },
            { path: 'auth', component: AuthComponent },
            { path: '**', component: Page404Component },
        ]
    }
];
