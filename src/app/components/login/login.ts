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
  templateUrl: './login.html',
  styleUrls: ['./login.css']
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