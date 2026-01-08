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
  templateUrl: './voter-dashboard.html',
  styleUrls: ['./voter-dashboard.css']
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