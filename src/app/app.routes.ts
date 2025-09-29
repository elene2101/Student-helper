import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './core/auth/auth.guard';
import { LoginComponent } from './core/auth/login/login.component';
import { RegisterComponent } from './core/auth/register/register.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, data: { hideHeader: true } },
  {
    path: 'register',
    component: RegisterComponent,
    data: { hideHeader: true },
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
];
