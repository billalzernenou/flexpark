import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import {
  IonicModule,
  LoadingController,
  ToastController,
} from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  isLoading = false;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Rediriger si déjà authentifié
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/home']);
    }

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSubmit() {
    this.submitted = true;

    if (this.loginForm.invalid) {
      await this.showToast(
        'Veuillez remplir tous les champs correctement',
        'danger'
      );
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Connexion en cours...',
    });
    await loading.present();

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: async (response) => {
        await loading.dismiss();
        this.isLoading = false;
        await this.showToast('Connexion réussie!', 'success');
        this.router.navigate(['/home']);
      },
      error: async (error) => {
        await loading.dismiss();
        this.isLoading = false;
        const message = error.error?.detail || 'Identifiants invalides';
        await this.showToast(message, 'danger');
      },
    });
  }

  async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
}
