// src/app/models.ts

export interface Owner {
  id: string;
  name: string;
  share: number; // Tulajdoni hányad (pl. 245 a 10000-ből)
}

export interface Apartment {
  id: string;
  address: string; // pl. Budapest Minta utca 28. 2.lph. 3.em. 8.
  hrsz: string;
  totalShare: number;
  owners: Owner[];
}

export interface Vote {
  ownerId: string;
  ownerName: string;
  apartmentAddress: string;
  share: number;
  choice: 'IGEN' | 'NEM' | 'TARTÓZKODIK';
}

export interface AgendaItem {
  id: number;
  title: string;
  description?: string;
  status: 'PENDING' | 'ACTIVE' | 'CLOSED'; // PENDING: még nem aktív, ACTIVE: szavazható, CLOSED: lezárt
  votes: Vote[];
  speakers: string[]; // Felszólalók listája
}

export interface AppState {
  totalShareBase: number; // pl. 10000
  presentShare: number; // Jelenlévők összesített hányada
  apartments: Apartment[];
  agendaItems: AgendaItem[];
  currentUser: Owner | null;
  currentApartment: Apartment | null;
}