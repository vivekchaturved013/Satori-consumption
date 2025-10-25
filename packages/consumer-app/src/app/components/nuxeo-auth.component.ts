import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
// Import demo components for components not yet available in real packages
import { 
  SatButtonComponent, 
  SatCardComponent, 
  SatIconComponent
} from '../../lib/satori-demo';
import { NuxeoService } from '../../core/services/nuxeo.service';

@Component({
  selector: 'app-nuxeo-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, SatButtonComponent, SatCardComponent, SatIconComponent],
  template: `
    <sat-card variant="elevated" class="auth-card">
      <div class="auth-header">
        <sat-icon name="lock" color="primary"></sat-icon>
        <h2>Connect to Nuxeo</h2>
      </div>
      
      @if (!nuxeoService.isAuthenticated) {
        <form class="auth-form">
          <div class="form-group">
            <label for="username">Username:</label>
            <input 
              id="username"
              type="text" 
              [(ngModel)]="username" 
              name="username"
              placeholder="Enter your username"
              required>
          </div>
          
          <div class="form-group">
            <label for="password">Password:</label>
            <input 
              id="password"
              type="password" 
              [(ngModel)]="password" 
              name="password"
              placeholder="Enter your password"
              required>
          </div>
          
          <div class="form-actions">
            <sat-button 
              variant="primary"
              [disabled]="nuxeoService.isLoading() || !username || !password"
              (clicked)="login()">
              @if (nuxeoService.isLoading()) {
                <sat-icon name="refresh" class="spinning"></sat-icon>
                Connecting...
              } @else {
                <sat-icon name="login"></sat-icon>
                Connect to Nuxeo
              }
            </sat-button>
          </div>
          
          @if (errorMessage()) {
            <div class="error-message">
              <sat-icon name="error" color="error"></sat-icon>
              {{ errorMessage() }}
            </div>
          }
        </form>
      } @else {
        <div class="auth-success">
          <sat-icon name="check_circle" color="success"></sat-icon>
          <h3>Connected to Nuxeo</h3>
          <p>Welcome, {{ nuxeoService.user?.id || 'User' }}!</p>
          
          <sat-button variant="outline" (clicked)="logout()">
            <sat-icon name="logout"></sat-icon>
            Disconnect
          </sat-button>
        </div>
      }
    </sat-card>
  `,
  styles: [`
    .auth-card {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
    }
    
    .auth-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      
      h2 {
        margin: 0;
        color: var(--sat-primary-color, #1976d2);
      }
    }
    
    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      label {
        font-weight: 500;
        color: var(--sat-text-primary, #212121);
      }
      
      input {
        padding: 0.75rem;
        border: 1px solid var(--sat-border-color, #e0e0e0);
        border-radius: 4px;
        font-size: 1rem;
        
        &:focus {
          outline: none;
          border-color: var(--sat-primary-color, #1976d2);
        }
      }
    }
    
    .form-actions {
      margin-top: 1rem;
    }
    
    .auth-success {
      text-align: center;
      
      h3 {
        color: var(--sat-success-color, #4caf50);
        margin: 1rem 0 0.5rem 0;
      }
      
      p {
        margin-bottom: 1.5rem;
        color: var(--sat-text-secondary, #757575);
      }
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--sat-error-color, #f44336);
      font-size: 0.875rem;
      margin-top: 1rem;
    }
    
    .spinning {
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class NuxeoAuthComponent {
  nuxeoService = inject(NuxeoService);
  
  username = 'Administrator';
  password = 'Administrator';
  errorMessage = signal<string>('');

  async login() {
    if (!this.username || !this.password) {
      this.errorMessage.set('Please enter both username and password');
      return;
    }

    this.errorMessage.set('');
    
    const success = await this.nuxeoService.authenticate(this.username, this.password);
    
    if (!success) {
      this.errorMessage.set('Authentication failed. Please check your credentials.');
    } else {
      // Clear form
      this.username = '';
      this.password = '';
    }
  }

  logout() {
    this.nuxeoService.logout();
  }
}