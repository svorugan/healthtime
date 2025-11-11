import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard">
      <div class="header">
        <h1>👨‍💼 Admin Dashboard</h1>
        <p class="subtitle">Manage your healthtime platform</p>
      </div>

      <div class="dashboard-grid">
        <div class="card" (click)="navigateTo('/admin/doctors')">
          <div class="card-icon">👨‍⚕️</div>
          <h3>Doctors</h3>
          <p>Manage doctor approvals and profiles</p>
        </div>

        <div class="card" (click)="navigateTo('/admin/patients')">
          <div class="card-icon">👤</div>
          <h3>Patients</h3>
          <p>View and manage patient records</p>
        </div>

        <div class="card" (click)="navigateTo('/admin/hospitals')">
          <div class="card-icon">🏥</div>
          <h3>Hospitals</h3>
          <p>Manage hospital partnerships</p>
        </div>

        <div class="card" (click)="navigateTo('/admin/implants')">
          <div class="card-icon">🦴</div>
          <h3>Implants</h3>
          <p>Manage implant catalog</p>
        </div>

        <div class="card" (click)="navigateTo('/admin/bookings')">
          <div class="card-icon">📅</div>
          <h3>Bookings</h3>
          <p>View all surgery bookings</p>
        </div>

        <div class="card highlight" (click)="navigateTo('/admin/api-explorer')">
          <div class="card-icon">🔌</div>
          <h3>API Explorer</h3>
          <p>Test and explore all API endpoints</p>
          <span class="badge">New</span>
        </div>

        <div class="card" (click)="navigateTo('/admin/analytics')">
          <div class="card-icon">📊</div>
          <h3>Analytics</h3>
          <p>View platform statistics</p>
        </div>

        <div class="card" (click)="navigateTo('/admin/settings')">
          <div class="card-icon">⚙️</div>
          <h3>Settings</h3>
          <p>Configure platform settings</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      margin-bottom: 2rem;
    }

    .header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      color: #333;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 1.1rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }

    .card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .card.highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .card.highlight h3,
    .card.highlight p {
      color: white;
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .card h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #333;
    }

    .card p {
      margin: 0;
      color: #666;
      font-size: 0.95rem;
    }

    .badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      background: #ffd700;
      color: #333;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
    }
  `]
})
export class AdminDashboardComponent {
  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}

