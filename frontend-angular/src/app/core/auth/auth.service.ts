import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ApiService } from '../services/api.service';
import { User, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenSubject = new BehaviorSubject<string | null>(null);
  public token$ = this.tokenSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private apiService: ApiService
  ) {
    // Load user from localStorage on init
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.tokenSubject.next(token);
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiService.getUrl('/auth/login'), {
      email,
      password
    }).pipe(
      tap(response => {
        this.setAuth(response);
        this.redirectByRole(response.user_role);
      })
    );
  }

  register(role: string, data: any): Observable<any> {
    const endpoint = `/auth/register/${role}`;
    if (role === 'doctor' || role === 'patient') {
      return this.http.post(this.apiService.getUrl(`${endpoint}/enhanced`), data);
    }
    return this.http.post(this.apiService.getUrl(endpoint), data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.tokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSubject.value || localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  private setAuth(response: AuthResponse): void {
    const user: User = {
      id: response.user_id,
      email: response.email,
      role: response.user_role as User['role'],
      is_active: true,
      email_verified: false
    };

    localStorage.setItem('token', response.access_token);
    localStorage.setItem('user', JSON.stringify(user));
    this.tokenSubject.next(response.access_token);
    this.currentUserSubject.next(user);
  }

  private redirectByRole(role: string): void {
    const roleRoutes: { [key: string]: string } = {
      'admin': '/admin',
      'doctor': '/doctor',
      'patient': '/patient',
      'hospital': '/hospital',
      'implant': '/implant'
    };

    const route = roleRoutes[role] || '/login';
    this.router.navigate([route]);
  }
}

