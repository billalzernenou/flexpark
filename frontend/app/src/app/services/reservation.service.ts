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

export interface ReservationPage {
  total: number;
  items: Reservation[];
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = `${environment.apiUrl}/parkings/reservation`;

  constructor(private http: HttpClient) {}

  getReservations(params?: {
    date?: string;
    user_id?: number;
    page?: number;
    page_size?: number;
  }): Observable<ReservationPage> {
    let url = this.apiUrl;
    const query: string[] = [];
    if (params) {
      // Extraire seulement la partie date (YYYY-MM-DD) si présente
      if (params.date) {
        const dateOnly = params.date.split('T')[0]; // Retire la partie heure (après le T)
        query.push(`date=${dateOnly}`);
      }
      if (params.user_id) query.push(`user_id=${params.user_id}`);
      if (params.page) query.push(`page=${params.page}`);
      if (params.page_size) query.push(`page_size=${params.page_size}`);
    }
    if (query.length > 0) {
      url += '?' + query.join('&');
    }
    console.log('Fetching reservations from:', url);
    return this.http.get<ReservationPage>(url);
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
