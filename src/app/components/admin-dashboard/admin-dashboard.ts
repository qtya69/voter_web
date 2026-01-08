import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs'; // Importálni kell!
import { VotingService } from '../../services/voting';
import { AgendaItem, AppState, Vote } from '../../models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent {
  // JAVÍTÁS: Itt csak deklaráljuk a típust
  state$: Observable<AppState>;

  // JAVÍTÁS: A konstruktorban rendeljük hozzá az értéket
  constructor(private votingService: VotingService) {
    this.state$ = this.votingService.state$;
  }

  setStatus(id: number, status: 'ACTIVE' | 'CLOSED') {
    this.votingService.setAgendaStatus(id, status);
  }

  sumVotes(votes: Vote[], type: string): number {
    return votes
      .filter(v => v.choice === type)
      .reduce((acc, curr) => acc + curr.share, 0);
  }

  getMissingVotesCount(item: AgendaItem, totalPresent: number): number {
    const votedShare = item.votes.reduce((acc, v) => acc + v.share, 0);
    return totalPresent - votedShare;
  }

  printResults() {
    window.print();
  }
}