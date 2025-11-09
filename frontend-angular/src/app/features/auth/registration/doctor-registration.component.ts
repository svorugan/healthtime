import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/auth/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-doctor-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <div class="registration-container">
      <h1>👨‍⚕️ Doctor Registration</h1>
      <p>Register as a surgeon/doctor. You will need to select your surgery types.</p>
      <!-- Registration form with surgery type selection -->
    </div>
  `,
  styles: []
})
export class DoctorRegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  surgeries: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private apiService: ApiService,
    private router: Router
  ) {
    this.registrationForm = this.fb.group({
      full_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      surgery_types: this.fb.array([], Validators.required)
    });
  }

  ngOnInit(): void {
    this.loadSurgeries();
  }

  loadSurgeries(): void {
    this.http.get<any[]>(this.apiService.getUrl('/surgeries'))
      .subscribe({
        next: (surgeries) => {
          this.surgeries = surgeries;
        },
        error: (err) => {
          console.error('Failed to load surgeries:', err);
        }
      });
  }

  get surgeryTypesFormArray(): FormArray {
    return this.registrationForm.get('surgery_types') as FormArray;
  }

  toggleSurgery(surgeryId: string): void {
    const formArray = this.surgeryTypesFormArray;
    const index = formArray.value.indexOf(surgeryId);
    
    if (index > -1) {
      formArray.removeAt(index);
    } else {
      formArray.push(this.fb.control(surgeryId));
    }
  }
}

