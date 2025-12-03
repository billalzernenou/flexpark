import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { addCircle, list } from 'ionicons/icons';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonDatetime,
  IonIcon,
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
    IonDatetime,
    IonIcon,
    CommonModule,
    FormsModule,
  ],
})
export class ReservationPage implements OnInit, AfterViewInit {
  onDateChange(newDate: string) {
    this.date = newDate;
    this.loadReservations(newDate);
  }
  // Liste des pages pour la pagination
  getUserReservationsPages(): number[] {
    const total = this.getUserReservationsTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  goToReservationPage(page: number) {
    if (page >= 1 && page <= this.getUserReservationsTotalPages()) {
      this.reservationPage = page;
    }
  }
  // Pagination pour mes réservations
  reservationPage: number = 1;
  reservationPageSize: number = 5;

  getUserReservationsPaginated(): Reservation[] {
    const all = this.getUserReservations();
    const start = (this.reservationPage - 1) * this.reservationPageSize;
    return all.slice(start, start + this.reservationPageSize);
  }

  getUserReservationsTotalPages(): number {
    return (
      Math.ceil(this.getUserReservations().length / this.reservationPageSize) ||
      1
    );
  }

  nextReservationPage() {
    if (this.reservationPage < this.getUserReservationsTotalPages()) {
      this.reservationPage++;
    }
  }

  prevReservationPage() {
    if (this.reservationPage > 1) {
      this.reservationPage--;
    }
  }
  // Vérifie si une réservation est passée (date < aujourd'hui)
  isPastReservation(reservation: Reservation): boolean {
    const today = new Date();
    const resDate = new Date(reservation.date);
    // On compare uniquement la date (pas l'heure)
    return (
      resDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())
    );
  }
  date: string | null = null;
  reservations: Reservation[] = [];
  users: { [id: number]: string } = {
    1: 'alice@example.com',
    2: 'bob@example.com',
  };
  currentUser: any = null;
  slots: string[] = [];
  parkings = [{ id: 1, name: 'Centre Parking' }];
  activeTab: string = 'reserver';

  // Pour la modale de confirmation
  showCancelModal: boolean = false;
  cancelTargetId: number | null = null;

  ngAfterViewInit() {
    this.generatePlaces();
  }

  generatePlaces() {
    this.slots = [];
    // Rangée A: A1-A5 (5 places)
    for (let i = 1; i <= 5; i++) {
      this.slots.push(`A${i}`);
    }
    // Rangée B: B1-B4 (4 places)
    for (let i = 1; i <= 4; i++) {
      this.slots.push(`B${i}`);
    }
    // Rangée C: C1-C3 (3 places)
    for (let i = 1; i <= 3; i++) {
      this.slots.push(`C${i}`);
    }
  }
  selectedParking: number = 1;
  selectedSlot: string | null = null;
  successMessage = '';

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {
    addIcons({ addCircle, list });
  }

  ngOnInit() {
    console.log('ReservationPage ngOnInit');
    this.loadCurrentUser();
    // Initialiser la date avec aujourd'hui (3 décembre 2025)
    this.initializeDefaultDate();
    if (this.date) {
      this.loadReservations(this.date);
    }
  }

  initializeDefaultDate() {
    // Définir la date par défaut à aujourd'hui au format YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.date = `${year}-${month}-${day}`;
    console.log('Default date set to:', this.date);
  }

  loadReservations(date?: string) {
    console.log('Loading reservations...' + (date ? ' for date ' + date : ''));
    this.reservationService.getReservations(date).subscribe(
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

  getReservationId(date: string, parkingId: number, slot: string): number {
    const res = this.getReservationsFor(date, parkingId, slot)[0];
    return res ? res.id : 0;
  }

  getUserReservations(): Reservation[] {
    if (!this.currentUser) return [];
    return this.reservations
      .filter((r) => r.user_id === this.currentUser.id)
      .sort((a, b) => {
        // Tri décroissant (plus récente d'abord)
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return dateB - dateA;
      });
  }

  getParkingName(parkingId: number): string {
    const parking = this.parkings.find((p) => p.id === parkingId);
    return parking ? parking.name : `Parking #${parkingId}`;
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
          this.loadReservations(this.date ?? undefined); // Recharge les réservations du jour
          this.successMessage = `Réservation confirmée pour le créneau ${slot}`;
        },
        (error) => {
          console.error('Error creating reservation:', error);
          this.successMessage = 'Erreur lors de la réservation';
        }
      );
  }

  cancelReservation(reservationId: number) {
    this.cancelTargetId = reservationId;
    this.showCancelModal = true;
  }

  confirmCancelReservation() {
    if (this.cancelTargetId) {
      this.reservationService.deleteReservation(this.cancelTargetId).subscribe(
        () => {
          console.log('Reservation cancelled successfully');
          this.loadReservations();
          this.successMessage = 'Réservation annulée avec succès';
          this.showCancelModal = false;
          this.cancelTargetId = null;
        },
        (error) => {
          console.error('Error cancelling reservation:', error);
          this.successMessage = "Erreur lors de l'annulation de la réservation";
          this.showCancelModal = false;
          this.cancelTargetId = null;
        }
      );
    }
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.cancelTargetId = null;
  }
}
