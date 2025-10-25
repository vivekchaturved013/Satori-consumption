import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Import demo components for components not yet available in real packages
import { 
  SatButtonComponent, 
  SatCardComponent, 
  SatIconComponent
} from '../../lib/satori-demo';
import { NuxeoService } from '../../core/services/nuxeo.service';
import { INuxeoServiceConfig } from '../../core/interfaces/nuxeo.interface';

@Component({
  selector: 'app-connection-tester',
  standalone: true,
  imports: [CommonModule, FormsModule, SatButtonComponent, SatCardComponent, SatIconComponent],
  template: `
    <sat-card variant="elevated" class="connection-tester">
      <div class="tester-header">
        <sat-icon name="wifi" color="primary"></sat-icon>
        <h2>Nuxeo Connection Tester</h2>
      </div>
      
      <form (ngSubmit)="testConnection()" class="config-form">
        <div class="form-group">
          <label for="baseUrl">Base URL:</label>
          <input 
            id="baseUrl"
            type="url" 
            [(ngModel)]="testConfig.baseUrl" 
            name="baseUrl"
            placeholder="http://localhost:8080/nuxeo"
            required>
          <small>Enter your Nuxeo server URL</small>
        </div>
        
        <div class="form-group">
          <label for="apiPath">API Path:</label>
          <input 
            id="apiPath"
            type="text" 
            [(ngModel)]="testConfig.apiPath" 
            name="apiPath"
            placeholder="/api/v1">
          <small>Nuxeo REST API path (usually /api/v1)</small>
        </div>
        
        <div class="form-actions">
          <sat-button 
            type="submit" 
            variant="primary"
            [disabled]="isTesting || !testConfig.baseUrl">
            @if (isTesting) {
              <sat-icon name="refresh" class="spinning"></sat-icon>
              Testing Connection...
            } @else {
              <sat-icon name="wifi_find"></sat-icon>
              Test Connection
            }
          </sat-button>
          
          <sat-button 
            type="button"
            variant="outline" 
            (clicked)="updateConfig()"
              [disabled]="isTesting || connectionStatus === 'disconnected'">
            <sat-icon name="save"></sat-icon>
            Use This Config
          </sat-button>
        </div>
      </form>
      
      <!-- Connection Status -->
      <div class="status-section">
        <h3>Connection Status</h3>
        
  @switch (connectionStatus) {
          @case ('connected') {
            <div class="status-item status-success">
              <sat-icon name="check_circle" color="success"></sat-icon>
              <div>
                <strong>Connected</strong>
                <p>Successfully connected to Nuxeo server</p>
              </div>
            </div>
          }
          @case ('testing') {
            <div class="status-item status-testing">
              <sat-icon name="refresh" class="spinning"></sat-icon>
              <div>
                <strong>Testing Connection</strong>
                <p>Checking server availability...</p>
              </div>
            </div>
          }
          @case ('disconnected') {
            <div class="status-item status-error">
              <sat-icon name="error" color="error"></sat-icon>
              <div>
                <strong>Disconnected</strong>
                <p>Cannot reach Nuxeo server</p>
              </div>
            </div>
          }
        }
      </div>
      
      <!-- Current Configuration -->
      <div class="current-config">
        <h3>Current Configuration</h3>
        <div class="config-display">
          <div class="config-item">
            <label>Base URL:</label>
            <span>{{ nuxeoService.currentConfig.baseUrl }}</span>
          </div>
          <div class="config-item">
            <label>API Path:</label>
            <span>{{ nuxeoService.currentConfig.apiPath }}</span>
          </div>
        </div>
      </div>
      
      @if (testResult()) {
        <div class="test-result" [ngClass]="testResult()?.success ? 'success' : 'error'">
          <sat-icon [name]="testResult()?.success ? 'check' : 'error'"></sat-icon>
          {{ testResult()?.message }}
        </div>
      }
    </sat-card>
  `,
  styles: [`
    .connection-tester {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
    }
    
    .tester-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      
      h2 {
        margin: 0;
        color: var(--sat-primary-color, #1976d2);
      }
    }
    
    .config-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      
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
      
      small {
        color: var(--sat-text-secondary, #757575);
        font-size: 0.875rem;
      }
    }
    
    .form-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
    
    .status-section {
      margin-bottom: 2rem;
      
      h3 {
        margin: 0 0 1rem 0;
        color: var(--sat-text-primary, #212121);
      }
    }
    
    .status-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      border: 1px solid;
      
      &.status-success {
        border-color: var(--sat-success-color, #4caf50);
        background-color: rgba(76, 175, 80, 0.1);
      }
      
      &.status-testing {
        border-color: var(--sat-warning-color, #ff9800);
        background-color: rgba(255, 152, 0, 0.1);
      }
      
      &.status-error {
        border-color: var(--sat-error-color, #f44336);
        background-color: rgba(244, 67, 54, 0.1);
      }
      
      div {
        strong {
          display: block;
          margin-bottom: 0.25rem;
        }
        
        p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--sat-text-secondary, #757575);
        }
      }
    }
    
    .current-config {
      h3 {
        margin: 0 0 1rem 0;
        color: var(--sat-text-primary, #212121);
      }
    }
    
    .config-display {
      background-color: var(--sat-surface-variant, #f5f5f5);
      padding: 1rem;
      border-radius: 8px;
      
      .config-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        label {
          font-weight: 500;
        }
        
        span {
          font-family: monospace;
          color: var(--sat-text-secondary, #757575);
        }
      }
    }
    
    .test-result {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: 8px;
      margin-top: 1rem;
      
      &.success {
        background-color: rgba(76, 175, 80, 0.1);
        color: var(--sat-success-color, #4caf50);
      }
      
      &.error {
        background-color: rgba(244, 67, 54, 0.1);
        color: var(--sat-error-color, #f44336);
      }
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
export class ConnectionTesterComponent {
  nuxeoService = inject(NuxeoService);
  
  // Form configuration for testing
  testConfig: INuxeoServiceConfig = {
    baseUrl: 'http://localhost:8080/nuxeo',
    apiPath: '/api/v1',
    timeout: 30000
  };
  
  testResult = signal<{ success: boolean; message: string } | null>(null);

  // Get current connection status
  get connectionStatus() {
  return this.nuxeoService.getConnectionStatus();
  }

  get isTesting() {
  return this.connectionStatus === 'testing';
  }

  async testConnection() {
    this.testResult.set(null);
    console.log('Starting connection test with config:', this.testConfig);
    try {
      const isConnected = await this.nuxeoService.testConnection(this.testConfig);
      
      this.testResult.set({
        success: isConnected,
        message: isConnected 
          ? `Successfully connected to ${this.testConfig.baseUrl}`
          : `Failed to connect to ${this.testConfig.baseUrl}. Please check the URL and server status.`
      });
    } catch (error) {
      this.testResult.set({
        success: false,
        message: `Connection test failed: ${error}`
      });
    }
  }

  updateConfig() {
    if (this.connectionStatus === 'connected') {
      this.nuxeoService.updateConfig(this.testConfig);
      this.testResult.set({
        success: true,
        message: 'Configuration updated successfully!'
      });
    }
  }
}