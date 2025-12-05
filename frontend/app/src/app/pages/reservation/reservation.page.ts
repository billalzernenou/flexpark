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
import { IonToast } from '@ionic/angular/standalone';
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
    IonToast,
    CommonModule,
    FormsModule,
  ],
})
export class ReservationPage implements OnInit, AfterViewInit {
  onDateChange(newDate: string) {
    this.date = newDate;
    // Convertir la date au format YYYY-MM-DD pour l'API
    let dateForApi = newDate;
    // Extraire la partie date si c'est un format ISO (avec T et time)
    if (dateForApi && dateForApi.includes('T')) {
      dateForApi = dateForApi.split('T')[0];
    }
    // Convertir DD/MM/YYYY en YYYY-MM-DD
    else if (dateForApi && dateForApi.includes('/')) {
      const parts = dateForApi.split('/');
      dateForApi = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    this.dateForApi = dateForApi;
    this.loadReservations(dateForApi);
  }

  // Recharger les réservations quand on revient à l'onglet "reserver"
  onTabChange(tabName: string) {
    this.activeTab = tabName;
    if (tabName === 'reserver' && this.dateForApi) {
      this.loadReservations(this.dateForApi ?? undefined);
    }
  }
  // Liste des pages pour la pagination
  getUserReservationsPages(): number[] {
    const total = this.getUserReservationsTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  goToReservationPage(page: number) {
    if (page >= 1 && page <= this.getUserReservationsTotalPages()) {
      this.loadUserReservationsPage(page);
    }
  }
  // Pagination pour mes réservations
  reservationPage: number = 1;
  reservationPageSize: number = 10;
  userReservations: Reservation[] = [];
  userReservationsTotal: number = 0;

  // Charge une page des réservations de l'utilisateur depuis l'API
  loadUserReservationsPage(page: number = 1) {
    if (!this.currentUser) {
      return;
    }
    this.reservationService
      .getReservations({
        user_id: this.currentUser.id,
        page,
        page_size: this.reservationPageSize,
      })
      .subscribe(
        (res) => {
          this.userReservations = res.items;
          this.userReservationsTotal = res.total;
          this.reservationPage = page;
        },
        (err) => {
          console.error('Error loading user reservations page:', err);
          this.userReservations = [];
          this.userReservationsTotal = 0;
        }
      );
  }

  getUserReservationsTotalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.userReservationsTotal / this.reservationPageSize)
    );
  }

  nextReservationPage() {
    if (this.reservationPage < this.getUserReservationsTotalPages()) {
      this.loadUserReservationsPage(this.reservationPage + 1);
    }
  }

  prevReservationPage() {
    if (this.reservationPage > 1) {
      this.loadUserReservationsPage(this.reservationPage - 1);
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

  // Vérifie si une date (format YYYY-MM-DD) est dans le passé
  isDateInPast(dateStr?: string | null): boolean {
    if (!dateStr) return false;
    // Assure le format YYYY-MM-DD
    const parts = dateStr.includes('/')
      ? dateStr.split('/')
      : dateStr.split('-');
    let year: number, month: number, day: number;
    if (parts.length === 3) {
      if (dateStr.includes('/')) {
        // DD/MM/YYYY
        day = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        year = parseInt(parts[2], 10);
      } else {
        // YYYY-MM-DD
        year = parseInt(parts[0], 10);
        month = parseInt(parts[1], 10) - 1;
        day = parseInt(parts[2], 10);
      }
    } else {
      return false;
    }
    const given = new Date(year, month, day);
    const today = new Date();
    const todayOnly = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return given < todayOnly;
  }

  // Date stockée en interne au format YYYY-MM-DD pour l'API
  dateForApi: string | null = null;
  // Date affichée (peut être en DD/MM/YYYY avec ion-datetime)
  date: string | null = null;
  reservations: Reservation[] = [];
  users: { [id: number]: string } = {
    1: 'alice@example.com',
    2: 'bob@example.com',
  };
  currentUser: any = null;
  currentDate: string = '';
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
  // Toast control
  toastMessage: string = '';
  toastColor: 'success' | 'danger' | 'warning' | 'info' = 'info';
  showToast: boolean = false;

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {
    addIcons({ addCircle, list });
  }

  ngOnInit() {
    console.log('ReservationPage ngOnInit');
    this.loadCurrentUser();
    this.updateCurrentDate();
    // Initialiser la date avec aujourd'hui au format YYYY-MM-DD
    this.initializeDefaultDate();
    // Charger la première page des réservations de l'utilisateur
    if (this.currentUser) {
      this.loadUserReservationsPage(1);
    }
    if (this.dateForApi) {
      this.loadReservations(this.dateForApi);
    }
  }

  updateCurrentDate() {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    };
    this.currentDate = today.toLocaleDateString('fr-FR', options);
  }

  initializeDefaultDate() {
    // Définir la date par défaut à aujourd'hui au format YYYY-MM-DD
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.dateForApi = `${year}-${month}-${day}`;
    this.date = this.dateForApi; // Initialiser aussi la date affichée
    console.log('Default date set to:', this.dateForApi);
  }

  loadReservations(date?: string) {
    console.log('Loading reservations...' + (date ? ' for date ' + date : ''));
    this.reservationService.getReservations({ date }).subscribe(
      (res) => {
        console.log('Reservations loaded:', res);
        this.reservations = res.items;
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
    else
      this.currentUser = {
        id: 1,
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Dupont',
      }; // fallback démo
    console.log('Current user:', this.currentUser);
  }

  getReservationsFor(date: string, parkingId: number, slot: string) {
    const result = this.reservations.filter(
      (r) => r.date === date && r.parking_id === parkingId && r.slot === slot
    );
    return result;
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
    if (!this.dateForApi) {
      console.error('No date selected');
      return;
    }

    const dateStr = this.dateForApi;

    console.log('Reserving slot:', {
      dateStr,
      slot,
      parking: parkingId,
      user: this.currentUser.id,
    });

    // Protection côté client : empêcher les réservations pour des dates passées
    if (this.isDateInPast(this.dateForApi)) {
      this.presentToast(
        'Impossible de réserver pour une date passée.',
        'warning'
      );
      return;
    }

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
          this.loadReservations(this.dateForApi ?? undefined); // Recharge les réservations du jour
          this.loadUserReservationsPage(this.reservationPage); // Recharge la page utilisateur
          this.presentToast(
            `Réservation confirmée pour le créneau ${slot}`,
            'success'
          );
        },
        (error) => {
          console.error('Error creating reservation:', error);
          // Extraire un message d'erreur utile si possible
          const errorMessage =
            (error &&
              error.error &&
              (error.error.detail || error.error.message)) ||
            error?.message ||
            'Erreur lors de la réservation';
          this.presentToast(errorMessage, 'danger');
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
          this.loadReservations(this.dateForApi ?? undefined);
          this.loadUserReservationsPage(this.reservationPage);
          this.presentToast('Réservation annulée avec succès', 'success');
          this.showCancelModal = false;
          this.cancelTargetId = null;
        },
        (error) => {
          console.error('Error cancelling reservation:', error);
          const errorMessage =
            (error &&
              error.error &&
              (error.error.detail || error.error.message)) ||
            error?.message ||
            "Erreur lors de l'annulation de la réservation";
          this.presentToast(errorMessage, 'danger');
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

  // Convertit une date au format de display lisible (DD/MM/YYYY)
  getDateDisplay(dateStr?: string | null): string {
    if (!dateStr) return '';
    // Si format YYYY-MM-DD, convertir en DD/MM/YYYY
    if (dateStr.includes('-') && !dateStr.includes('/')) {
      const parts = dateStr.split('-');
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    // Si format DD/MM/YYYY, retourner tel quel
    return dateStr;
  }

  // Affiche un toast contrôlé par la template (<ion-toast [isOpen]="showToast" ...>)
  presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'info' = 'info'
  ) {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
    // Fermer automatiquement après 3s
    setTimeout(() => (this.showToast = false), 3000);
  }
}
