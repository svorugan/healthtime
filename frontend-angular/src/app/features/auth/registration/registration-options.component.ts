import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { RegistrationOption } from '../../../core/models/user.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-registration-options',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  template: `
    <div class="registration-container">
      <h1>🏥 healthtime Registration</h1>
      <p class="subtitle">Choose your registration type</p>
      
      <div class="options-grid">
        <mat-card *ngFor="let option of options" class="option-card" (click)="selectOption(option)">
          <mat-card-header>
            <div class="icon">{{ option.icon }}</div>
            <mat-card-title>{{ option.title }}</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>{{ option.description }}</p>
            <span *ngIf="option.requires_approval" class="approval-badge">Requires Approval</span>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="selectOption(option); $event.stopPropagation()">
              Register
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .registration-container {
      min-height: 100vh;
      padding: 40px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    h1 {
      text-align: center;
      color: white;
      margin-bottom: 8px;
    }

    .subtitle {
      text-align: center;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 40px;
    }

    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .option-card {
      cursor: pointer;
      transition: transform 0.2s;
    }

    .option-card:hover {
      transform: translateY(-4px);
    }

    .icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 16px;
    }

    .approval-badge {
      display: inline-block;
      background: #ff9800;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-top: 8px;
    }
  `]
})
export class RegistrationOptionsComponent implements OnInit {
  options: RegistrationOption[] = [];

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOptions();
  }

  loadOptions(): void {
    this.http.get<{ options: RegistrationOption[] }>(this.apiService.getUrl('/auth/registration-options'))
      .subscribe({
        next: (response) => {
          this.options = response.options;
        },
        error: (err) => {
          console.error('Failed to load registration options:', err);
          // Fallback options
          this.options = [
            {
              role: 'patient',
              title: 'Register as Patient',
              description: 'Book surgeries and manage your health journey',
              icon: '👤',
              endpoint: '/api/auth/register/patient/enhanced',
              requires_approval: false
            },
            {
              role: 'doctor',
              title: 'Register as Surgeon/Doctor',
              description: 'Join our network of medical professionals',
              icon: '👨‍⚕️',
              endpoint: '/api/auth/register/doctor/enhanced',
              requires_approval: true
            },
            {
              role: 'hospital',
              title: 'Register Hospital',
              description: 'Partner with us to provide quality healthcare',
              icon: '🏥',
              endpoint: '/api/auth/register/hospital',
              requires_approval: true
            },
            {
              role: 'implant',
              title: 'Register Implant Manufacturer',
              description: 'Manage your implant catalog and partnerships',
              icon: '🦴',
              endpoint: '/api/auth/register/implant',
              requires_approval: true
            }
          ];
        }
      });
  }

  selectOption(option: RegistrationOption): void {
    this.router.navigate(['/register', option.role]);
  }
}

