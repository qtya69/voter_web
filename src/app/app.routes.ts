import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { VoterDashboardComponent } from './components/voter-dashboard/voter-dashboard';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'voter', component: VoterDashboardComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' }
];