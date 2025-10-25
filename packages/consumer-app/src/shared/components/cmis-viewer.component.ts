import { 
  Component, 
  OnInit, 
  OnDestroy, 
  inject, 
  signal,
  computed,
  ChangeDetectionStrategy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  SatButtonComponent, 
  SatCardComponent, 
  SatIconComponent
} from '../../lib/satori-demo';

import { NuxeoService } from '../../core/services/nuxeo.service';
import { LoggingService } from '../../core/services/logging.service';
import { ICmisResponse, INuxeoServiceConfig } from '../../core/interfaces/nuxeo.interface';

@Component({
  selector: 'app-cmis-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SatButtonComponent,
    SatCardComponent,
    SatIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sat-card variant="elevated" class="cmis-viewer">
      <div class="viewer-header">
        <sat-icon name="security" color="primary"></sat-icon>
        <h2>CMIS Permissions Viewer</h2>
      </div>
      
      @if (!nuxeoService.isAuthenticated) {
        <div class="auth-required">
          <sat-icon name="lock" color="warning"></sat-icon>
          <p>Please authenticate first to view CMIS permissions.</p>
        </div>
      } @else {
        <div class="viewer-content">
          <div class="actions">
            <sat-button 
              variant="primary"
              [disabled]="isLoading()"
              (click)="loadCmisPermissions()">
              @if (isLoading()) {
                <sat-icon name="refresh" class="spinning"></sat-icon>
                Loading...
              } @else {
                <sat-icon name="refresh"></sat-icon>
                Load CMIS Permissions
              }
            </sat-button>
          </div>

          @if (error()) {
            <div class="error-state">
              <sat-icon name="error" color="error"></sat-icon>
              <div>
                <strong>Error Loading Permissions</strong>
                <p>{{ error() }}</p>
              </div>
            </div>
          }

          @if (cmisData() && !isLoading()) {
            <div class="permissions-display">
              <h3>CMIS Repository Permissions</h3>
              
              @if (cmisData()?.permissions && cmisData()!.permissions!.length > 0) {
                <div class="permissions-list">
                  @for (permission of cmisData()!.permissions!; track permission.key) {
                    <div class="permission-item">
                      <div class="permission-key">
                        <sat-icon name="key"></sat-icon>
                        <strong>{{ permission.key }}</strong>
                      </div>
                      <div class="permission-values">
                        @for (perm of permission.permission; track perm) {
                          <span class="permission-badge">{{ perm }}</span>
                        }
                      </div>
                    </div>
                  }
                </div>
              } @else {
                <div class="no-permissions">
                  <sat-icon name="info"></sat-icon>
                  <p>No permissions data available or permissions array is empty.</p>
                </div>
              }

              @if (hasOtherData()) {
                <div class="other-data">
                  <h4>Additional CMIS Data</h4>
                  <pre class="json-data">{{ getOtherDataJson() }}</pre>
                </div>
              }
            </div>
          }
        </div>
      }
    </sat-card>
  `,
  styles: [`
    .cmis-viewer {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
    }
    
    .viewer-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      
      h2 {
        margin: 0;
        color: var(--sat-primary-color, #1976d2);
      }
    }

    .auth-required {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
      color: var(--sat-text-secondary, #757575);
    }

    .viewer-content {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    .error-state {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-radius: 8px;
      background-color: rgba(244, 67, 54, 0.1);
      border: 1px solid var(--sat-error-color, #f44336);
      
      div {
        strong {
          display: block;
          color: var(--sat-error-color, #f44336);
          margin-bottom: 0.25rem;
        }
        
        p {
          margin: 0;
          color: var(--sat-text-secondary, #757575);
        }
      }
    }

    .permissions-display {
      h3 {
        margin: 0 0 1rem 0;
        color: var(--sat-text-primary, #212121);
      }
    }

    .permissions-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .permission-item {
      padding: 1rem;
      border: 1px solid var(--sat-border-color, #e0e0e0);
      border-radius: 8px;
      background-color: var(--sat-surface-variant, #f5f5f5);

      .permission-key {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        
        strong {
          color: var(--sat-text-primary, #212121);
          font-family: monospace;
        }
      }

      .permission-values {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }

      .permission-badge {
        background-color: var(--sat-primary-color, #1976d2);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        font-family: monospace;
      }
    }

    .no-permissions {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 2rem;
      text-align: center;
      color: var(--sat-text-secondary, #757575);
    }

    .other-data {
      margin-top: 1.5rem;
      
      h4 {
        margin: 0 0 0.5rem 0;
        color: var(--sat-text-primary, #212121);
      }
    }

    .json-data {
      background-color: var(--sat-surface-variant, #f5f5f5);
      border: 1px solid var(--sat-border-color, #e0e0e0);
      border-radius: 4px;
      padding: 1rem;
      font-family: monospace;
      font-size: 0.875rem;
      overflow-x: auto;
      max-height: 300px;
      overflow-y: auto;
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
export class CmisViewerComponent implements OnInit, OnDestroy {
  // Service injection
  public readonly nuxeoService = inject(NuxeoService);
  private readonly logger = inject(LoggingService);

  // Component state with signals
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _cmisData = signal<ICmisResponse | null>(null);

  // Public computed signals
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly cmisData = this._cmisData.asReadonly();

  // Computed properties
  public readonly hasOtherData = computed(() => {
    const data = this._cmisData();
    if (!data) return false;
    
    // Check if there are properties other than 'permissions'
    const keys = Object.keys(data).filter(key => key !== 'permissions');
    return keys.length > 0;
  });

  ngOnInit(): void {
    this.logger.info('CmisViewerComponent', 'Component initialized');
  }

  ngOnDestroy(): void {
    this.logger.info('CmisViewerComponent', 'Component destroyed');
  }

  /**
   * Load CMIS permissions from Nuxeo server
   */
  public async loadCmisPermissions(): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set(null);

      this.logger.info('CmisViewerComponent', 'Loading CMIS permissions');
      
      const cmisResponse = await this.nuxeoService.getCmisPermissions();
      
      this._cmisData.set(cmisResponse);
      this.logger.info('CmisViewerComponent', 'CMIS permissions loaded successfully', { 
        permissionCount: cmisResponse.permissions?.length || 0 
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load CMIS permissions';
      this._error.set(errorMessage);
      this.logger.error('CmisViewerComponent', 'Failed to load CMIS permissions', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Get JSON representation of non-permissions data
   */
  public getOtherDataJson(): string {
    const data = this._cmisData();
    if (!data) return '';
    
    // Create a copy without the permissions property
    const { permissions, ...otherData } = data;
    return JSON.stringify(otherData, null, 2);
  }
}