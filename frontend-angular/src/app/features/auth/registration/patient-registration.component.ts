import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="registration-container">
      <h1>👤 Patient Registration</h1>
      <mat-stepper [linear]="true" #stepper>
        <mat-step [stepControl]="basicInfoForm">
          <ng-template matStepLabel>Basic Information</ng-template>
          <form [formGroup]="basicInfoForm">
            <!-- Basic info fields -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="full_name" required>
            </mat-form-field>
            <!-- Add more fields -->
          </form>
        </mat-step>
        <!-- Add more steps -->
      </mat-stepper>
    </div>
  `,
  styles: [`
    .registration-container {
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class PatientRegistrationComponent {
  basicInfoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.basicInfoForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      // Add more fields
    });
  }
}

