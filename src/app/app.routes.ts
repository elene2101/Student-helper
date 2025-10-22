import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './core/auth/auth.guard';
import { LoginComponent } from './core/auth/login/login.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { AssignmentsComponent } from './components/assignments/assignments.component';
import { ClassesComponent } from './components/classes/classes.component';
import { ExamsComponent } from './components/exams/exams.component';
import { CalendarComponent } from './components/calendar/calendar.component';

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
  { path: 'assignments', component: AssignmentsComponent },
  { path: 'classes', component: ClassesComponent },
  { path: 'exams', component: ExamsComponent },
  { path: 'calendar', component: CalendarComponent },
];
