import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl || 'http://localhost:8000/api';

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }
}

