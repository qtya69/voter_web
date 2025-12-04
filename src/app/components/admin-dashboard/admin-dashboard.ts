import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs'; // Importálni kell!
import { VotingService } from '../../services/voting';
import { AgendaItem, AppState, Vote } from '../../models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- A template kód változatlan marad -->
    <div class="admin-panel" *ngIf="state$ | async as state">
      <h1>Közgyűlés Vezérlőpult</h1>
      
      <div class="stats-box">
        <h3>Jelenléti Statisztika</h3>
        <p>Összes tulajdoni hányad: {{ state.totalShareBase }}</p>
        <p>Jelen van: <strong>{{ state.presentShare }}</strong> / {{ state.totalShareBase }}</p>
        <div class="progress-bar">
          <div class="fill" [style.width.%]="(state.presentShare / state.totalShareBase) * 100"></div>
        </div>
      </div>

      <div *ngFor="let item of state.agendaItems" class="admin-card">
        <div class="card-header">
          <h3>{{ item.id }}. {{ item.title }}</h3>
          <span [class]="'badge ' + item.status">{{ item.status }}</span>
        </div>

        <div class="controls">
          <button *ngIf="item.status === 'PENDING'" (click)="setStatus(item.id, 'ACTIVE')" class="btn-start">Szavazás INDÍTÁSA</button>
          <button *ngIf="item.status === 'ACTIVE'" (click)="setStatus(item.id, 'CLOSED')" class="btn-stop">Szavazás LEZÁRÁSA</button>
        </div>

        <div class="results" *ngIf="item.status !== 'PENDING'">
          <h4>Eredmények (Valós időben)</h4>
          <div class="result-row">
            <span>IGEN: {{ sumVotes(item.votes, 'IGEN') }} th.</span>
            <span>NEM: {{ sumVotes(item.votes, 'NEM') }} th.</span>
            <span>TART.: {{ sumVotes(item.votes, 'TARTÓZKODIK') }} th.</span>
          </div>
          
          <div *ngIf="item.status === 'ACTIVE'" class="missing">
             <strong>Még nem szavazott:</strong>
             <span *ngIf="getMissingVotesCount(item, state.presentShare) <= 0" style="color:green"> Mindenki szavazott!</span>
             <span *ngIf="getMissingVotesCount(item, state.presentShare) > 0" style="color:red"> {{ getMissingVotesCount(item, state.presentShare) }} th. hiányzik</span>
          </div>

          <details>
            <summary>Részletes lista</summary>
            <ul>
              <li *ngFor="let v of item.votes">
                {{ v.ownerName }} ({{ v.share }} th.) - <strong>{{ v.choice }}</strong>
              </li>
            </ul>
          </details>

          <div *ngIf="item.speakers.length > 0" class="speakers">
            <h4>Felszólalások:</h4>
            <ul>
              <li *ngFor="let s of item.speakers">{{ s }}</li>
            </ul>
          </div>
        </div>
      </div>
      
      <button class="btn-export" (click)="printResults()">Jegyzőkönyv Exportálása (Nyomtatás)</button>
    </div>
  `,
  styles: [`
    /* A stílusok változatlanok */
    .admin-panel { padding: 20px; background: #f4f4f4; min-height: 100vh; }
    .stats-box { background: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .progress-bar { height: 20px; background: #ddd; border-radius: 10px; overflow: hidden; }
    .fill { height: 100%; background: #28a745; transition: width 0.5s; }
    .admin-card { background: white; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 5px solid #6c757d; }
    .badge { padding: 5px 10px; border-radius: 4px; color: white; font-size: 0.8em; }
    .badge.PENDING { background: #ffc107; color: black; }
    .badge.ACTIVE { background: #28a745; }
    .badge.CLOSED { background: #343a40; }
    .controls { margin: 15px 0; }
    .btn-start { background: #28a745; color: white; padding: 10px 20px; border: none; cursor: pointer; font-size: 1.1em; }
    .btn-stop { background: #dc3545; color: white; padding: 10px 20px; border: none; cursor: pointer; font-size: 1.1em; }
    .result-row { display: flex; justify-content: space-around; font-weight: bold; font-size: 1.2em; margin: 10px 0; }
    .missing { margin-top: 10px; font-style: italic; }
    .speakers { margin-top: 15px; background: #e9ecef; padding: 10px; }
    .btn-export { background: #007bff; color: white; padding: 15px; border: none; width: 100%; font-size: 1.2em; cursor: pointer; margin-top: 20px;}
  `]
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