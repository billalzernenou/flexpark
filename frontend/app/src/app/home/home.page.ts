import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonButtons,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonIcon,
    CommonModule,
  ],
})
export class HomePage implements OnInit {
  currentUser$ = this.authService.currentUser$;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Si non authentifié, rediriger vers login
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login']);
    }
  }

  logout() {
    this.authService.logout();
  }

  goToReservation() {
    this.router.navigate(['/reservation']);
  }
}
