import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { AgendaItem, Apartment, AppState, Owner, Vote } from '../models';

@Injectable({
  providedIn: 'root'
})
export class VotingService {
  // Kezdeti dummy adatok
  private mockApartments: Apartment[] = [
    {
      id: 'A1',
      address: 'Budapest Minta utca 28. 2.lph. 3.em. 8.',
      hrsz: '2485/A/24',
      totalShare: 245,
      owners: [
        { id: 'O1', name: 'Minta János', share: 245 },
        { id: 'O2', name: 'Minta Jánosné (Meghatalmazott)', share: 245 } // Ugyanaz a tulajdoni hányad, opcióként
      ]
    },
    {
      id: 'A2',
      address: 'Budapest Minta utca 28. 1.em. 5.',
      hrsz: '2485/A/10',
      totalShare: 320,
      owners: [
        { id: 'O3', name: 'Próba Péter', share: 160 },
        { id: 'O4', name: 'Próba Pálné', share: 160 }
      ]
    }
  ];

  private mockAgenda: AgendaItem[] = [
    { id: 1, title: 'Közgyűlés tisztségviselőinek megválasztása', status: 'PENDING', votes: [], speakers: [] },
    { id: 2, title: '2024. évi beszámoló elfogadása', status: 'PENDING', votes: [], speakers: [] },
    { id: 3, title: 'Felújítási alap növelése', status: 'PENDING', votes: [], speakers: [] }
  ];

  // State Management
  private state = new BehaviorSubject<AppState>({
    totalShareBase: 10000,
    presentShare: 0,
    apartments: this.mockApartments,
    agendaItems: this.mockAgenda,
    currentUser: null,
    currentApartment: null
  });

  state$ = this.state.asObservable();

  // --- LOGIN LOGIC ---
  login(apartmentId: string, ownerId: string) {
    const currentState = this.state.value;
    const apt = currentState.apartments.find(a => a.id === apartmentId);
    const owner = apt?.owners.find(o => o.id === ownerId);

    if (apt && owner) {
      // Ha belép, növeljük a jelenléti arányt (egyszerűsített logika: ha belép, jelen van)
      // Valós appnál ellenőrizni kell, hogy már hozzáadtuk-e
      const newPresentShare = currentState.presentShare + owner.share;
      
      this.state.next({
        ...currentState,
        currentUser: owner,
        currentApartment: apt,
        presentShare: newPresentShare
      });
    }
  }

  logout() {
    const currentState = this.state.value;
    if (currentState.currentUser) {
      this.state.next({
        ...currentState,
        presentShare: currentState.presentShare - currentState.currentUser.share,
        currentUser: null,
        currentApartment: null
      });
    }
  }

  // --- ADMIN LOGIC ---
  setAgendaStatus(itemId: number, status: 'ACTIVE' | 'CLOSED') {
    const currentState = this.state.value;
    const updatedItems = currentState.agendaItems.map(item => {
      if (item.id === itemId) {
        return { ...item, status };
      }
      // Ha egyet aktiválunk, a többit zárjuk le vagy hagyjuk pendingben?
      // Most csak az adott itemet módosítjuk.
      return item;
    });

    this.state.next({ ...currentState, agendaItems: updatedItems });
  }

  // --- VOTER LOGIC ---
  castVote(itemId: number, choice: 'IGEN' | 'NEM' | 'TARTÓZKODIK') {
    const currentState = this.state.value;
    const user = currentState.currentUser;
    const apt = currentState.currentApartment;

    if (!user || !apt) return;

    const updatedItems = currentState.agendaItems.map(item => {
      if (item.id === itemId && item.status === 'ACTIVE') {
        // Ellenőrizzük, szavazott-e már
        const alreadyVoted = item.votes.find(v => v.ownerId === user.id);
        if (alreadyVoted) return item;

        const newVote: Vote = {
          ownerId: user.id,
          ownerName: user.name,
          apartmentAddress: apt.address,
          share: user.share,
          choice: choice
        };
        return { ...item, votes: [...item.votes, newVote] };
      }
      return item;
    });

    this.state.next({ ...currentState, agendaItems: updatedItems });
  }

  requestToSpeak(itemId: number) {
    const currentState = this.state.value;
    const user = currentState.currentUser;
    if (!user) return;

    const updatedItems = currentState.agendaItems.map(item => {
      if (item.id === itemId) {
        const speakerText = `${user.name} (${currentState.currentApartment?.address}) - ${user.share}/10000 th.`;
        return { ...item, speakers: [...item.speakers, speakerText] };
      }
      return item;
    });

    this.state.next({ ...currentState, agendaItems: updatedItems });
  }

  // --- HELPERS ---
  getApartments() {
    return this.state.value.apartments;
  }
}