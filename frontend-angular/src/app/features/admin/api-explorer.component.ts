import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  requiresAuth: boolean;
  roles?: string[];
  body?: any;
  queryParams?: any;
  response?: any;
  contentType?: string;
}

interface ApiCategory {
  name: string;
  description: string;
  endpoints: ApiEndpoint[];
}

interface ApiDocumentation {
  version: string;
  baseUrl: string;
  categories: ApiCategory[];
}

@Component({
  selector: 'app-api-explorer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="api-explorer">
      <div class="header">
        <h1>🔌 API Explorer</h1>
        <p class="subtitle">Explore and test all backend API endpoints</p>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading API documentation...</p>
      </div>

      <div *ngIf="error" class="error-banner">
        <strong>Error:</strong> {{ error }}
      </div>

      <div *ngIf="apiDocs && !loading" class="content">
        <!-- API Info -->
        <div class="api-info">
          <div class="info-card">
            <span class="label">Version:</span>
            <span class="value">{{ apiDocs.version }}</span>
          </div>
          <div class="info-card">
            <span class="label">Base URL:</span>
            <span class="value">{{ apiDocs.baseUrl }}</span>
          </div>
          <div class="info-card">
            <span class="label">Total Endpoints:</span>
            <span class="value">{{ getTotalEndpoints() }}</span>
          </div>
        </div>

        <!-- Search -->
        <div class="search-box">
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="🔍 Search endpoints..."
            class="search-input"
          />
        </div>

        <!-- Categories -->
        <div class="categories">
          <div *ngFor="let category of getFilteredCategories()" class="category">
            <div class="category-header" (click)="toggleCategory(category.name)">
              <h2>
                <span class="toggle-icon">{{ expandedCategories[category.name] ? '▼' : '▶' }}</span>
                {{ category.name }}
              </h2>
              <p class="category-description">{{ category.description }}</p>
              <span class="endpoint-count">{{ category.endpoints.length }} endpoints</span>
            </div>

            <div *ngIf="expandedCategories[category.name]" class="endpoints">
              <div 
                *ngFor="let endpoint of category.endpoints" 
                class="endpoint-card"
                [class.expanded]="selectedEndpoint === endpoint"
              >
                <div class="endpoint-summary" (click)="selectEndpoint(endpoint)">
                  <span class="method" [class]="'method-' + endpoint.method.toLowerCase()">
                    {{ endpoint.method }}
                  </span>
                  <span class="path">{{ endpoint.path }}</span>
                  <span class="description">{{ endpoint.description }}</span>
                  <span *ngIf="endpoint.requiresAuth" class="auth-badge">🔒 Auth Required</span>
                </div>

                <div *ngIf="selectedEndpoint === endpoint" class="endpoint-details">
                  <!-- Endpoint Information -->
                  <div class="details-section">
                    <h4>Details</h4>
                    <div class="detail-row">
                      <strong>Full URL:</strong>
                      <code>{{ apiDocs.baseUrl }}{{ endpoint.path }}</code>
                    </div>
                    <div class="detail-row" *ngIf="endpoint.roles">
                      <strong>Required Roles:</strong>
                      <span class="roles">
                        <span *ngFor="let role of endpoint.roles" class="role-badge">{{ role }}</span>
                      </span>
                    </div>
                    <div class="detail-row" *ngIf="endpoint.contentType">
                      <strong>Content Type:</strong>
                      <code>{{ endpoint.contentType }}</code>
                    </div>
                  </div>

                  <!-- Request Body -->
                  <div class="details-section" *ngIf="endpoint.body">
                    <h4>Request Body</h4>
                    <pre class="code-block">{{ formatJson(endpoint.body) }}</pre>
                  </div>

                  <!-- Query Parameters -->
                  <div class="details-section" *ngIf="endpoint.queryParams">
                    <h4>Query Parameters</h4>
                    <pre class="code-block">{{ formatJson(endpoint.queryParams) }}</pre>
                  </div>

                  <!-- Response -->
                  <div class="details-section" *ngIf="endpoint.response">
                    <h4>Response Example</h4>
                    <pre class="code-block">{{ formatJson(endpoint.response) }}</pre>
                  </div>

                  <!-- Test Section -->
                  <div class="details-section test-section">
                    <h4>Test Endpoint</h4>
                    <div class="test-form">
                      <div class="form-group">
                        <label>Request Body (JSON):</label>
                        <textarea 
                          [(ngModel)]="testRequestBody" 
                          rows="8"
                          placeholder='{"key": "value"}'
                          class="test-input"
                        ></textarea>
                      </div>
                      <div class="form-group">
                        <label>Authorization Token:</label>
                        <input 
                          type="text" 
                          [(ngModel)]="authToken" 
                          placeholder="Bearer token (optional)"
                          class="test-input"
                        />
                      </div>
                      <button 
                        (click)="testEndpoint(endpoint)" 
                        class="test-button"
                        [disabled]="testing"
                      >
                        {{ testing ? '⏳ Testing...' : '🚀 Test Endpoint' }}
                      </button>
                    </div>

                    <!-- Test Result -->
                    <div *ngIf="testResult" class="test-result">
                      <div class="result-header">
                        <h5>Response:</h5>
                        <span 
                          class="status-badge" 
                          [class.success]="testResult.status >= 200 && testResult.status < 300"
                          [class.error]="testResult.status >= 400"
                        >
                          {{ testResult.status }} {{ testResult.statusText }}
                        </span>
                      </div>
                      <pre class="code-block result-body">{{ formatJson(testResult.body) }}</pre>
                    </div>
                  </div>

                  <!-- cURL Example -->
                  <div class="details-section">
                    <h4>cURL Example</h4>
                    <pre class="code-block curl-example">{{ generateCurl(endpoint) }}</pre>
                    <button (click)="copyCurl(endpoint)" class="copy-button">
                      📋 Copy cURL
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .api-explorer {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
      background: #f5f7fa;
      min-height: 100vh;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
    }

    .subtitle {
      margin: 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .loading {
      text-align: center;
      padding: 3rem;
    }

    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-banner {
      background: #fee;
      border: 1px solid #fcc;
      color: #c33;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .api-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .info-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .info-card .label {
      font-size: 0.875rem;
      color: #666;
      font-weight: 600;
      text-transform: uppercase;
    }

    .info-card .value {
      font-size: 1.25rem;
      color: #333;
      font-weight: 700;
    }

    .search-box {
      margin-bottom: 2rem;
    }

    .search-input {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      transition: border-color 0.3s;
    }

    .search-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .category {
      background: white;
      border-radius: 12px;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .category-header {
      padding: 1.5rem;
      cursor: pointer;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
      transition: background 0.2s;
    }

    .category-header:hover {
      background: #f0f0f0;
    }

    .category-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #333;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .toggle-icon {
      font-size: 0.875rem;
      color: #667eea;
    }

    .category-description {
      margin: 0 0 0.5rem 0;
      color: #666;
    }

    .endpoint-count {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .endpoints {
      padding: 1rem;
    }

    .endpoint-card {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 1rem;
      overflow: hidden;
      transition: all 0.3s;
    }

    .endpoint-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .endpoint-card.expanded {
      border-color: #667eea;
    }

    .endpoint-summary {
      padding: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .method {
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-weight: 700;
      font-size: 0.875rem;
      text-transform: uppercase;
      min-width: 70px;
      text-align: center;
    }

    .method-get { background: #61affe; color: white; }
    .method-post { background: #49cc90; color: white; }
    .method-put { background: #fca130; color: white; }
    .method-patch { background: #50e3c2; color: white; }
    .method-delete { background: #f93e3e; color: white; }

    .path {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #333;
      flex: 1;
      min-width: 200px;
    }

    .description {
      color: #666;
      flex: 2;
      min-width: 200px;
    }

    .auth-badge {
      background: #ffeaa7;
      color: #d63031;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .endpoint-details {
      padding: 1.5rem;
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    .details-section {
      margin-bottom: 1.5rem;
    }

    .details-section h4 {
      margin: 0 0 1rem 0;
      color: #667eea;
      font-size: 1.1rem;
    }

    .detail-row {
      margin-bottom: 0.75rem;
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .roles {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .role-badge {
      background: #667eea;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.875rem;
    }

    .code-block {
      background: #2d3748;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 6px;
      overflow-x: auto;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
      line-height: 1.5;
      margin: 0;
    }

    .test-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      border: 2px solid #667eea;
    }

    .test-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #333;
    }

    .test-input {
      padding: 0.75rem;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }

    .test-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .test-button {
      background: #667eea;
      color: white;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s;
    }

    .test-button:hover:not(:disabled) {
      background: #5568d3;
    }

    .test-button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .test-result {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
    }

    .result-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .result-header h5 {
      margin: 0;
      color: #333;
    }

    .status-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .status-badge.success {
      background: #d4edda;
      color: #155724;
    }

    .status-badge.error {
      background: #f8d7da;
      color: #721c24;
    }

    .result-body {
      max-height: 400px;
      overflow-y: auto;
    }

    .curl-example {
      margin-bottom: 0.5rem;
    }

    .copy-button {
      background: #48bb78;
      color: white;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s;
    }

    .copy-button:hover {
      background: #38a169;
    }

    code {
      background: #f1f3f5;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }
  `]
})
export class ApiExplorerComponent implements OnInit {
  apiDocs: ApiDocumentation | null = null;
  loading = true;
  error: string | null = null;
  searchQuery = '';
  expandedCategories: { [key: string]: boolean } = {};
  selectedEndpoint: ApiEndpoint | null = null;
  testRequestBody = '';
  authToken = '';
  testing = false;
  testResult: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Get auth token from localStorage if available
    const token = localStorage.getItem('token');
    if (token) {
      this.authToken = token;
    }
    this.loadApiDocumentation();
  }

  loadApiDocumentation() {
    const apiUrl = environment.apiUrl || 'http://localhost:8000/api';
    this.http.get<ApiDocumentation>(`${apiUrl}/docs/endpoints`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.authToken}`
      })
    }).subscribe({
      next: (data) => {
        this.apiDocs = data;
        this.loading = false;
        // Expand first category by default
        if (data.categories.length > 0) {
          this.expandedCategories[data.categories[0].name] = true;
        }
      },
      error: (err) => {
        this.error = 'Failed to load API documentation. Please ensure you are logged in as an admin.';
        this.loading = false;
        console.error('API docs error:', err);
      }
    });
  }

  getTotalEndpoints(): number {
    if (!this.apiDocs) return 0;
    return this.apiDocs.categories.reduce((sum, cat) => sum + cat.endpoints.length, 0);
  }

  getFilteredCategories(): ApiCategory[] {
    if (!this.apiDocs) return [];
    if (!this.searchQuery) return this.apiDocs.categories;

    const query = this.searchQuery.toLowerCase();
    return this.apiDocs.categories
      .map(category => ({
        ...category,
        endpoints: category.endpoints.filter(endpoint =>
          endpoint.path.toLowerCase().includes(query) ||
          endpoint.description.toLowerCase().includes(query) ||
          endpoint.method.toLowerCase().includes(query)
        )
      }))
      .filter(category => category.endpoints.length > 0);
  }

  toggleCategory(categoryName: string) {
    this.expandedCategories[categoryName] = !this.expandedCategories[categoryName];
  }

  selectEndpoint(endpoint: ApiEndpoint) {
    if (this.selectedEndpoint === endpoint) {
      this.selectedEndpoint = null;
      this.testResult = null;
    } else {
      this.selectedEndpoint = endpoint;
      this.testResult = null;
      // Pre-fill test body if example is available
      if (endpoint.body) {
        this.testRequestBody = this.formatJson(endpoint.body);
      } else {
        this.testRequestBody = '';
      }
    }
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  generateCurl(endpoint: ApiEndpoint): string {
    const baseUrl = this.apiDocs?.baseUrl || 'http://localhost:8000/api';
    let curl = `curl -X ${endpoint.method} "${baseUrl}${endpoint.path}"`;
    
    if (endpoint.requiresAuth) {
      curl += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;
    }
    
    if (endpoint.method !== 'GET' && endpoint.body) {
      curl += ` \\\n  -H "Content-Type: application/json"`;
      curl += ` \\\n  -d '${JSON.stringify(endpoint.body)}'`;
    }
    
    return curl;
  }

  copyCurl(endpoint: ApiEndpoint) {
    const curl = this.generateCurl(endpoint);
    navigator.clipboard.writeText(curl).then(() => {
      alert('cURL command copied to clipboard!');
    });
  }

  testEndpoint(endpoint: ApiEndpoint) {
    this.testing = true;
    this.testResult = null;

    const baseUrl = this.apiDocs?.baseUrl || 'http://localhost:8000/api';
    const url = `${baseUrl}${endpoint.path}`;

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.authToken) {
      headers = headers.set('Authorization', `Bearer ${this.authToken}`);
    }

    let body = null;
    if (this.testRequestBody && endpoint.method !== 'GET') {
      try {
        body = JSON.parse(this.testRequestBody);
      } catch (e) {
        this.testResult = {
          status: 400,
          statusText: 'Bad Request',
          body: { error: 'Invalid JSON in request body' }
        };
        this.testing = false;
        return;
      }
    }

    const request = this.http.request(endpoint.method, url, {
      headers,
      body,
      observe: 'response'
    });

    request.subscribe({
      next: (response) => {
        this.testResult = {
          status: response.status,
          statusText: response.statusText,
          body: response.body
        };
        this.testing = false;
      },
      error: (error) => {
        this.testResult = {
          status: error.status || 500,
          statusText: error.statusText || 'Error',
          body: error.error || { message: error.message }
        };
        this.testing = false;
      }
    });
  }
}
