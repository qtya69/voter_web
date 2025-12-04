import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, take } from 'rxjs'; // Importok
import { VotingService } from '../../services/voting';
import { Router } from '@angular/router';
import { AgendaItem, AppState } from '../../models';

@Component({
  selector: 'app-voter-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- A template kód változatlan marad -->
    <div class="dashboard" *ngIf="state$ | async as state">
      <header>
        <h3>{{ state.currentUser?.name }}</h3>
        <p>{{ state.currentApartment?.address }}</p>
        <p>Tulajdoni hányad: <strong>{{ state.currentUser?.share }} / {{ state.totalShareBase }}</strong></p>
        <button (click)="logout()" class="btn-small">Kijelentkezés</button>
      </header>

      <div class="agenda-list">
        <h4>Napirendi pontok</h4>
        
        <div *ngFor="let item of state.agendaItems" class="agenda-card" [ngClass]="item.status">
          <div class="agenda-header">
            <span>{{ item.id }}. {{ item.title }}</span>
            <span class="status-badge">{{ item.status }}</span>
          </div>

          <div *ngIf="item.status === 'ACTIVE'" class="voting-area">
            <p *ngIf="hasVoted(item, state.currentUser?.id!)">
              ✅ Szavazat rögzítve!
            </p>
            
            <div *ngIf="!hasVoted(item, state.currentUser?.id!)" class="buttons">
              <button (click)="vote(item.id, 'IGEN')" class="btn-yes">IGEN</button>
              <button (click)="vote(item.id, 'NEM')" class="btn-no">NEM</button>
              <button (click)="vote(item.id, 'TARTÓZKODIK')" class="btn-abs">TARTÓZKODIK</button>
            </div>

            <button (click)="speak(item.id)" class="btn-speak">📢 FELSZÓLALOK</button>
          </div>

          <div *ngIf="item.status === 'CLOSED'" class="result-area">
             <p>Szavazás lezárva.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* A stílusok változatlanok */
    .dashboard { padding: 20px; max-width: 600px; margin: 0 auto; }
    header { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid #007bff; }
    .agenda-card { border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 5px; }
    .agenda-card.ACTIVE { border-color: #28a745; box-shadow: 0 0 10px rgba(40,167,69,0.2); }
    .agenda-card.CLOSED { background-color: #f0f0f0; opacity: 0.8; }
    .status-badge { font-size: 0.8em; padding: 2px 6px; background: #eee; border-radius: 4px; float: right; }
    .buttons { display: flex; gap: 10px; margin-top: 15px; }
    button { flex: 1; padding: 15px; border: none; border-radius: 5px; font-weight: bold; cursor: pointer; color: white; }
    .btn-yes { background-color: #28a745; }
    .btn-no { background-color: #dc3545; }
    .btn-abs { background-color: #ffc107; color: black; }
    .btn-speak { background-color: #17a2b8; margin-top: 10px; width: 100%; }
    .btn-small { width: auto; padding: 5px 10px; background: #6c757d; font-size: 0.8em; margin-top: 10px;}
  `]
})
export class VoterDashboardComponent implements OnInit {
  // JAVÍTÁS: Deklaráció
  state$: Observable<AppState>;

  // JAVÍTÁS: Értékadás a konstruktorban
  constructor(private votingService: VotingService, private router: Router) {
    this.state$ = this.votingService.state$;
  }

  ngOnInit() {
    // JAVÍTÁS: Ellenőrizzük, hogy be van-e lépve. Ha nincs user, visszadobjuk a loginra.
    this.state$.pipe(take(1)).subscribe(state => {
      if (!state.currentUser) {
        this.router.navigate(['/']);
      }
    });
  }

  vote(itemId: number, choice: 'IGEN' | 'NEM' | 'TARTÓZKODIK') {
    this.votingService.castVote(itemId, choice);
  }

  speak(itemId: number) {
    this.votingService.requestToSpeak(itemId);
    alert('Felszólalási igényét jeleztük az elnöknek!');
  }

  // JAVÍTÁS: Típusok pontosítása (any helyett AgendaItem)
  hasVoted(item: AgendaItem, userId: string): boolean {
    return item.votes.some(v => v.ownerId === userId);
  }

  logout() {
    this.votingService.logout();
    this.router.navigate(['/']);
  }
}