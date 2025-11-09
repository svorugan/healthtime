import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header class="card-header">
          <div class="brand">
            <div class="logo">🏥</div>
            <div>
              <mat-card-title>healthtime</mat-card-title>
              <mat-card-subtitle>Sign in to access your dashboard</mat-card-subtitle>
            </div>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" aria-label="Login form">
            <div class="form-field full-width" [class.invalid]="loginForm.get('email')?.invalid && (loginForm.get('email')?.dirty || loginForm.get('email')?.touched)">
              <mat-icon class="field-icon">email</mat-icon>
              <input
                type="email"
                formControlName="email"
                aria-label="Email address"
                autocomplete="email"
                placeholder="Email address"
                class="native-input"
              />
            </div>
            <div *ngIf="loginForm.get('email')?.invalid && (loginForm.get('email')?.dirty || loginForm.get('email')?.touched)" class="field-error">
              <span *ngIf="loginForm.get('email')?.hasError('required')">Email is required</span>
              <span *ngIf="loginForm.get('email')?.hasError('email')">Enter a valid email</span>
            </div>

            <div class="form-field full-width" [class.invalid]="loginForm.get('password')?.invalid && (loginForm.get('password')?.dirty || loginForm.get('password')?.touched)">
              <mat-icon class="field-icon">lock</mat-icon>
              <input
                type="password"
                formControlName="password"
                aria-label="Password"
                autocomplete="current-password"
                placeholder="Password"
                class="native-input"
              />
            </div>
            <div *ngIf="loginForm.get('password')?.invalid && (loginForm.get('password')?.dirty || loginForm.get('password')?.touched)" class="field-error">
              <span *ngIf="loginForm.get('password')?.hasError('required')">Password is required</span>
              <span *ngIf="loginForm.get('password')?.hasError('minlength')">Minimum 6 characters</span>
            </div>

            <div class="form-row">
              <a routerLink="/forgot-password" class="forgot">Forgot password?</a>
            </div>

            <div *ngIf="error" class="error-message">
              {{ error }}
            </div>

            <button mat-raised-button color="primary" type="submit" [disabled]="loading || !loginForm.valid" class="full-width action-btn">
              <span *ngIf="!loading" class="btn-content">🔐 Sign In</span>
              <span *ngIf="loading" class="btn-content">⏳ Signing In...</span>
            </button>
          </form>

          <div class="register-links">
            <p>Don't have an account? <a routerLink="/register" class="link-action">Register here</a></p>
            <p class="mt-2"><a routerLink="/login-portal" class="link-action">Choose Login Type</a></p>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #ecfeff 0%, #f0f9ff 40%, #f5f3ff 100%);
      padding: 24px;
      font-family: Inter, Roboto, "Helvetica Neue", Arial, sans-serif;
      position: relative;
      overflow: hidden;
    }

    /* soft background blobs like React version */
    .login-container::before,
    .login-container::after {
      content: '';
      position: absolute;
      width: 28rem;
      height: 28rem;
      border-radius: 9999px;
      filter: blur(60px);
      opacity: 0.18;
      z-index: 0;
    }
    .login-container::before { left: -6rem; top: -6rem; background: #7dd3fc; }
    .login-container::after { right: -6rem; bottom: -6rem; background: #86efac; }

    .login-card {
      width: 100%;
      max-width: 480px;
      border-radius: 1rem;
      box-shadow: 0 20px 40px rgba(16,24,40,0.12);
      overflow: hidden;
      position: relative;
      z-index: 10;
      background: rgba(255,255,255,0.65);
      backdrop-filter: blur(8px) saturate(140%);
      border: 1px solid rgba(255,255,255,0.6);
      padding: 18px 0;
    }

    .card-header .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      justify-content: center;
    }

    .logo {
      font-size: 36px;
      line-height: 1;
    }

    mat-card-title {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 2px;
    }

    mat-card-subtitle {
      font-size: 13px;
      color: rgba(0,0,0,0.6);
    }

    .full-width {
      width: 100%;
      margin-bottom: 14px;
    }

    /* Custom simple input wrapper (avoids dependency on mat-form-field theme) */
    .form-field {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      border: 2px solid rgba(185, 246, 253, 0.85); /* cyan-200-ish */
      border-radius: 12px; /* rounded-xl */
      background: rgba(255,255,255,0.6);
      transition: box-shadow 0.18s ease, border-color 0.18s ease, transform 0.12s ease;
      backdrop-filter: blur(6px);
    }

    .form-field:focus-within {
      box-shadow: 0 12px 24px rgba(6,182,212,0.12);
      border-color: rgba(14,165,233,0.9); /* cyan-400 */
      transform: translateY(-1px);
    }

    .form-field.invalid {
      border-color: #fca5a5;
      background: #fff5f5;
    }

    .field-icon {
      color: #0ea5e9; /* cyan-500 */
      font-size: 20px;
      flex: 0 0 auto;
    }

    .native-input {
      border: none;
      outline: none;
      font-size: 15px;
      flex: 1 1 auto;
      background: transparent;
      padding: 6px 0;
      color: #0f172a;
    }

    .native-input::placeholder { color: #9ca3af; }

    .field-error {
      color: #b91c1c;
      font-size: 13px;
      margin: 8px 0 10px 6px;
    }

    /* CTA gradient similar to React Tailwind */
    .action-btn {
      height: 54px;
      border-radius: 12px;
      font-weight: 700;
      background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%);
      color: white;
      box-shadow: 0 12px 30px rgba(59,130,246,0.14);
      transition: transform 0.18s ease, box-shadow 0.18s ease;
    }
    .action-btn:hover { transform: translateY(-3px); box-shadow: 0 18px 40px rgba(59,130,246,0.18); }

    .form-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 8px;
    }

    .forgot {
      font-size: 13px;
      color: #4f46e5;
      text-decoration: none;
    }

    .forgot:hover { text-decoration: underline; }

    .error-message {
      color: #b91c1c;
      margin-bottom: 12px;
      padding: 10px;
      background-color: #fff1f2;
      border-radius: 6px;
      font-size: 13px;
    }

    .action-btn {
      height: 44px;
      border-radius: 8px;
      font-weight: 600;
    }

    .btn-content { display: inline-flex; align-items: center; gap: 8px; }

    .register-links {
      margin-top: 18px;
      text-align: center;
      font-size: 14px;
    }

    .link-action { color: #4f46e5; font-weight: 600; text-decoration: none; }
    .link-action:hover { text-decoration: underline; }

    @media (max-width: 480px) {
      .login-card { max-width: 92%; }
      .logo { font-size: 30px; }
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.error = '';

      const { email, password } = this.loginForm.value;

      this.authService.login(email, password).subscribe({
        next: () => {
          // Navigation handled by auth service
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.detail || err.error?.message || 'Login failed. Please check your credentials.';
        }
      });
    }
  }
}

