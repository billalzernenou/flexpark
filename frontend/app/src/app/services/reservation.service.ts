import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Reservation {
  id: number;
  date: string;
  slot: string;
  user_id: number;
  parking_id: number;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/parkings/reservation`;

  constructor(private http: HttpClient) {}

  getReservations(date?: string): Observable<Reservation[]> {
    let url = this.apiUrl;
    if (date) {
      url += `?date=${date}`;
    }
    console.log('Fetching reservations from:', url);
    return this.http.get<Reservation[]>(url);
  }

  createReservation(
    reservation: Partial<Reservation>
  ): Observable<Reservation> {
    console.log('Creating reservation:', reservation);
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }

  deleteReservation(id: number): Observable<any> {
    console.log('Deleting reservation:', id);
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
