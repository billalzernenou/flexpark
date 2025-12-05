import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
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
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule],
})
export class RegisterPage implements OnInit {
  // Form
  registerForm!: FormGroup;

  // State
  submitted = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Initialise le formulaire d'inscription avec les validateurs
   */
  private initializeForm(): void {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator.bind(this),
      }
    );
  }

  /**
   * Validateur personnalisé pour vérifier que les deux mots de passe correspondent
   */
  private passwordMatchValidator(
    group: AbstractControl
  ): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Getter pour accéder facilement aux contrôles du formulaire
   */
  get f(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }

  /**
   * Gère la soumission du formulaire
   */
  async onSubmit(): Promise<void> {
    this.submitted = true;

    // Valider le formulaire
    if (this.registerForm.invalid) {
      await this.presentToast(
        'Veuillez remplir tous les champs correctement',
        'danger'
      );
      return;
    }

    // Préparer l'enregistrement
    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Inscription en cours...',
      spinner: 'circular',
    });
    await loading.present();

    try {
      const { email, password, firstName, lastName } = this.registerForm.value;

      // Appeler le service d'authentification
      this.authService
        .register(email, password, firstName, lastName)
        .subscribe({
          next: async (response) => {
            await loading.dismiss();
            this.isLoading = false;

            await this.presentToast('Inscription réussie!', 'success');
            this.router.navigate(['/home']);
          },
          error: async (error) => {
            await loading.dismiss();
            this.isLoading = false;

            const message =
              error.error?.detail || "Erreur lors de l'inscription";
            await this.presentToast(message, 'danger');
          },
        });
    } catch (error) {
      await loading.dismiss();
      this.isLoading = false;
      await this.presentToast(
        "Erreur inattendue lors de l'inscription",
        'danger'
      );
    }
  }

  /**
   * Affiche un toast (notification temporaire)
   */
  private async presentToast(
    message: string,
    color: 'success' | 'danger' | 'warning' | 'info' = 'info'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
      cssClass: 'toast-custom',
    });
    await toast.present();
  }

  /**
   * Navigue vers la page de connexion
   */
  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }
}
