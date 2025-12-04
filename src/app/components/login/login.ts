import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VotingService } from '../../services/voting';
import { Apartment, Owner } from '../../models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Társasházi Közgyűlés Belépés</h2>
      
      <div class="form-group">
        <label>Válassza ki az Albetétet:</label>
        <select [(ngModel)]="selectedApartmentId" (change)="onApartmentChange()">
          <option value="" disabled selected>Válasszon...</option>
          <option *ngFor="let apt of apartments" [value]="apt.id">
            {{ apt.address }} ({{ apt.hrsz }})
          </option>
        </select>
      </div>

      <div class="form-group" *ngIf="selectedApartmentId">
        <label>Válassza ki a Tulajdonost / Képviselőt:</label>
        <select [(ngModel)]="selectedOwnerId">
          <option value="" disabled selected>Válasszon...</option>
          <option *ngFor="let owner of availableOwners" [value]="owner.id">
            {{ owner.name }}
          </option>
        </select>
      </div>

      <button (click)="onLogin()" [disabled]="!selectedOwnerId" class="btn-primary">Belépés</button>
      
      <hr>
      <button (click)="goToAdmin()" class="btn-secondary">Adminisztrátori felület (Demo)</button>
    </div>
  `,
  styles: [`
    .login-container { max-width: 500px; margin: 50px auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
    .form-group { margin-bottom: 15px; }
    select { width: 100%; padding: 8px; margin-top: 5px; }
    button { width: 100%; padding: 10px; margin-top: 10px; cursor: pointer; }
    .btn-primary { background-color: #007bff; color: white; border: none; }
    .btn-secondary { background-color: #6c757d; color: white; border: none; }
  `]
})
export class LoginComponent {
  apartments: Apartment[] = [];
  availableOwners: Owner[] = [];
  
  selectedApartmentId: string = '';
  selectedOwnerId: string = '';

  constructor(private votingService: VotingService, private router: Router) {
    this.apartments = this.votingService.getApartments();
  }

  onApartmentChange() {
    const apt = this.apartments.find(a => a.id === this.selectedApartmentId);
    this.availableOwners = apt ? apt.owners : [];
    this.selectedOwnerId = '';
  }

  onLogin() {
    if (this.selectedApartmentId && this.selectedOwnerId) {
      this.votingService.login(this.selectedApartmentId, this.selectedOwnerId);
      this.router.navigate(['/voter']);
    }
  }

  goToAdmin() {
    this.router.navigate(['/admin']);
  }
}