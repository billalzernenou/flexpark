import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
  IonDatetime,
} from '@ionic/angular/standalone';

import {
  ReservationService,
  Reservation,
} from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reservation',
  templateUrl: './reservation.page.html',
  styleUrls: ['./reservation.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButton,
    IonItem,
    IonLabel,
    IonInput,
    IonList,
    IonDatetime,
    CommonModule,
    FormsModule,
  ],
})
export class ReservationPage implements OnInit {
  date: string | null = null;
  reservations: Reservation[] = [];
  users: { [id: number]: string } = {
    1: 'alice@example.com',
    2: 'bob@example.com',
  };
  currentUser: any = null;
  slots = ['08:00-09:00', '09:00-10:00', '10:00-11:00'];
  parkings = [
    { id: 1, name: 'Parking Centre' },
    { id: 2, name: 'Parking Gare' },
  ];
  selectedParking: number = 1;
  selectedSlot: string | null = null;
  successMessage = '';

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    console.log('ReservationPage ngOnInit');
    this.loadReservations();
    this.loadCurrentUser();
    // Initialiser la date avec aujourd'hui (3 décembre 2025)
    this.initializeDefaultDate();
  }

  initializeDefaultDate() {
    // Définir la date par défaut à aujourd'hui au format DD/MM/YYYY
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    this.date = `${day}/${month}/${year}`;
    console.log('Default date set to:', this.date);
  }

  loadReservations() {
    console.log('Loading reservations...');
    this.reservationService.getReservations().subscribe(
      (res) => {
        console.log('Reservations loaded:', res);
        this.reservations = res;
      },
      (error) => {
        console.error('Error loading reservations:', error);
        this.reservations = [];
      }
    );
  }

  loadCurrentUser() {
    // À adapter selon la logique d'authentification réelle
    const user = localStorage.getItem('user');
    if (user) this.currentUser = JSON.parse(user);
    else this.currentUser = { id: 1, email: 'alice@example.com' }; // fallback démo
    console.log('Current user:', this.currentUser);
  }

  getReservationsFor(date: string, parkingId: number, slot: string) {
    return this.reservations.filter(
      (r) => r.date === date && r.parking_id === parkingId && r.slot === slot
    );
  }

  isReserved(date: string, parkingId: number, slot: string) {
    return this.getReservationsFor(date, parkingId, slot).length > 0;
  }

  getReserverName(date: string, parkingId: number, slot: string) {
    const res = this.getReservationsFor(date, parkingId, slot)[0];
    return res ? this.users[res.user_id] || 'Utilisateur #' + res.user_id : '';
  }

  reserveSlot(parkingId: number, slot: string) {
    if (!this.date) {
      console.error('No date selected');
      return;
    }

    // Convertir le format de date si nécessaire
    let dateStr = this.date;
    if (dateStr.includes('/')) {
      // Format DD/MM/YYYY -> YYYY-MM-DD
      const parts = dateStr.split('/');
      dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    console.log('Reserving slot:', {
      dateStr,
      slot,
      parking: parkingId,
      user: this.currentUser.id,
    });

    this.reservationService
      .createReservation({
        date: dateStr,
        slot,
        user_id: this.currentUser.id,
        parking_id: parkingId,
      })
      .subscribe(
        () => {
          console.log('Reservation created successfully');
          this.loadReservations();
          this.successMessage = `Réservation confirmée pour le créneau ${slot}`;
        },
        (error) => {
          console.error('Error creating reservation:', error);
          this.successMessage = 'Erreur lors de la réservation';
        }
      );
  }
}
