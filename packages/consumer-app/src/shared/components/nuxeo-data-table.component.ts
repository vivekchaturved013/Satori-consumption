import { 
  Component, 
  OnInit, 
  inject, 
  signal,
  computed,
  ChangeDetectionStrategy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SatButtonComponent, SatCardComponent, SatIconComponent } from '../../lib/satori-demo';

import { NuxeoService } from '../../core/services/nuxeo.service';
import { LoggingService } from '../../core/services/logging.service';

export interface NuxeoTableDocument {
  uid: string;
  title: string;
  type: string;
  lastModified: string;
  lastContributor: string;
  contributorEmail: string;
  path: string;
  state: string;
  thumbnailUrl?: string;
  icon?: string;
}

@Component({
  selector: 'app-nuxeo-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    SatButtonComponent,
    SatCardComponent,
    SatIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sat-card variant="elevated" class="data-table-container">
      <div class="table-header">
        <div class="header-content">
          <sat-icon name="table_view" color="primary" [size]="20"></sat-icon>
          <h3>Recently Edited</h3>
        </div>
        <sat-button 
          variant="ghost" 
          size="small"
          [disabled]="isLoading()"
          (clicked)="loadDocuments()">
          @if (isLoading()) {
            <sat-icon name="refresh" class="spinning" [size]="16"></sat-icon>
          } @else {
            <sat-icon name="refresh" [size]="16"></sat-icon>
          }
          Refresh
        </sat-button>
      </div>

      @if (isLoading() && documents().length === 0) {
        <div class="loading-state">
          <mat-spinner diameter="32"></mat-spinner>
          <p>Loading documents...</p>
        </div>
      } @else if (error()) {
        <div class="error-state">
          <sat-icon name="error" color="error" [size]="24"></sat-icon>
          <div class="error-content">
            <strong>Error Loading Documents</strong>
            <p>{{ error() }}</p>
            <sat-button 
              variant="outline" 
              size="small"
              (clicked)="loadDocuments()">
              <sat-icon name="refresh" [size]="16"></sat-icon>
              Try Again
            </sat-button>
          </div>
        </div>
      } @else if (documents().length > 0) {
        <div class="table-wrapper">
          <table mat-table [dataSource]="documents()" class="nuxeo-table">
            
            <!-- Icon Column -->
            <ng-container matColumnDef="icon">
              <th mat-header-cell *matHeaderCellDef class="icon-column"></th>
              <td mat-cell *matCellDef="let document" class="icon-column">
                <div class="document-icon">
                  @if (document.thumbnailUrl) {
                    <img [src]="document.thumbnailUrl" [alt]="document.title" class="thumbnail">
                  } @else {
                    <mat-icon [svgIcon]="getDocumentMatIcon(document.type)" class="type-icon"></mat-icon>
                  }
                </div>
              </td>
            </ng-container>

            <!-- Title Column -->
            <ng-container matColumnDef="title">
              <th mat-header-cell *matHeaderCellDef>Title</th>
              <td mat-cell *matCellDef="let document" class="title-cell">
                <div class="title-content">
                  <span class="document-title">{{ document.title }}</span>
                  <span class="document-path">{{ getShortPath(document.path) }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Modified Column -->
            <ng-container matColumnDef="modified">
              <th mat-header-cell *matHeaderCellDef>Modified</th>
              <td mat-cell *matCellDef="let document" class="modified-cell">
                {{ formatDate(document.lastModified) }}
              </td>
            </ng-container>

            <!-- Last Contributor Column -->
            <ng-container matColumnDef="contributor">
              <th mat-header-cell *matHeaderCellDef>Last Contributor</th>
              <td mat-cell *matCellDef="let document" class="contributor-cell">
                <div class="contributor-info">
                  <div class="contributor-avatar">
                    {{ getContributorInitials(document.lastContributor) }}
                  </div>
                  <div class="contributor-details">
                    <span class="contributor-name">{{ document.lastContributor }}</span>
                    <span class="contributor-email">{{ document.contributorEmail }}</span>
                  </div>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;" 
                class="document-row"
                (click)="onDocumentClick(row)"></tr>
          </table>
        </div>

        <div class="table-footer">
          <span class="results-info">
            Showing {{ documents().length }} of {{ totalResults() }} documents
          </span>
        </div>
      } @else {
        <div class="empty-state">
          <sat-icon name="folder_open" [size]="48" color="secondary"></sat-icon>
          <h4>No Documents Found</h4>
          <p>No recently edited documents to display.</p>
        </div>
      }
    </sat-card>
  `,
  styles: [`
    .data-table-container {
      margin: 16px 0;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--n-90);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-content h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--n-10);
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .nuxeo-table {
      width: 100%;
      background: white;
    }

    .nuxeo-table th {
      background-color: var(--n-98);
      color: var(--n-30);
      font-weight: 500;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 16px;
      border-bottom: 2px solid var(--n-90);
    }

    .nuxeo-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--n-95);
    }

    .icon-column {
      width: 60px;
      text-align: center;
    }

    .document-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
    }

    .thumbnail {
      width: 32px;
      height: 32px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid var(--n-90);
    }

    .type-icon {
      color: var(--n-50);
      width: 24px;
      height: 24px;
    }

    .title-cell {
      min-width: 200px;
    }

    .title-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .document-title {
      font-weight: 500;
      color: var(--n-10);
      font-size: 14px;
    }

    .document-path {
      font-size: 12px;
      color: var(--n-50);
      opacity: 0.8;
    }

    .modified-cell {
      min-width: 120px;
      font-size: 13px;
      color: var(--n-30);
    }

    .contributor-cell {
      min-width: 200px;
    }

    .contributor-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .contributor-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: var(--p-40);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 500;
      flex-shrink: 0;
    }

    .contributor-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .contributor-name {
      font-size: 13px;
      font-weight: 500;
      color: var(--n-10);
    }

    .contributor-email {
      font-size: 11px;
      color: var(--n-50);
    }

    .document-row {
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .document-row:hover {
      background-color: var(--n-98);
    }

    .table-footer {
      padding: 12px 16px;
      background-color: var(--n-98);
      border-top: 1px solid var(--n-90);
      font-size: 12px;
      color: var(--n-50);
    }

    .loading-state,
    .error-state,
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .error-content {
      margin-top: 12px;
    }

    .error-content strong {
      color: var(--e-40);
    }

    .error-content p {
      color: var(--n-40);
      margin: 8px 0 16px 0;
    }

    .empty-state h4 {
      margin: 16px 0 8px 0;
      color: var(--n-30);
    }

    .empty-state p {
      color: var(--n-50);
      margin: 0;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .document-path {
        display: none;
      }
      
      .contributor-email {
        display: none;
      }
      
      .modified-cell {
        font-size: 12px;
      }
    }
  `]
})
export class NuxeoDataTableComponent implements OnInit {
  private nuxeoService = inject(NuxeoService);
  private logger = inject(LoggingService);

  // Component state
  private readonly _documents = signal<NuxeoTableDocument[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _error = signal<string>('');
  private readonly _totalResults = signal<number>(0);

  // Public readonly signals
  public readonly documents = this._documents.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly totalResults = this._totalResults.asReadonly();

  // Table configuration
  displayedColumns: string[] = ['icon', 'title', 'modified', 'contributor'];

  async ngOnInit() {
    await this.loadDocuments();
  }

  public async loadDocuments(): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set('');

      this.logger.info('NuxeoDataTableComponent', 'Loading domain documents');

      const response = await this.nuxeoService.getDomainDocuments();
      
      if (response && response.entries) {
        const tableDocuments = this.transformToTableDocuments(response.entries);
        this._documents.set(tableDocuments);
        this._totalResults.set(response.totalSize || response.resultsCount || tableDocuments.length);
        
        this.logger.info('NuxeoDataTableComponent', 'Documents loaded successfully', { 
          count: tableDocuments.length,
          total: this.totalResults()
        });
      } else {
        this._documents.set([]);
        this._totalResults.set(0);
        this.logger.warn('NuxeoDataTableComponent', 'No documents found in response');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load documents';
      this._error.set(errorMessage);
      this._documents.set([]);
      this._totalResults.set(0);
      this.logger.error('NuxeoDataTableComponent', 'Failed to load documents', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  private transformToTableDocuments(entries: any[]): NuxeoTableDocument[] {
    return entries.map(entry => ({
      uid: entry.uid,
      title: entry.title || entry.properties?.['dc:title'] || 'Untitled',
      type: entry.type,
      lastModified: entry.lastModified || entry.properties?.['dc:modified'],
      lastContributor: entry.properties?.['dc:lastContributor']?.properties?.username || 
                       entry.properties?.['dc:lastContributor']?.id || 
                       'Unknown',
      contributorEmail: entry.properties?.['dc:lastContributor']?.properties?.email || '',
      path: entry.path,
      state: entry.state,
      thumbnailUrl: entry.contextParameters?.thumbnail?.url,
      icon: entry.properties?.['common:icon']
    }));
  }

  public onDocumentClick(document: NuxeoTableDocument): void {
    this.logger.info('NuxeoDataTableComponent', 'Document clicked', { 
      uid: document.uid, 
      title: document.title 
    });
    // TODO: Implement document navigation or preview
  }

  public getDocumentMatIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Collection': 'collections_bookmark',
      'Picture': 'image',
      'Video': 'movie',
      'Audio': 'audiotrack',
      'File': 'insert_drive_file',
      'Favorites': 'star',
      'Folder': 'folder',
      'Workspace': 'work',
      'Domain': 'domain'
    };
    return iconMap[type] || 'description';
  }

  public getShortPath(path: string): string {
    const parts = path.split('/').filter(part => part.length > 0);
    if (parts.length <= 3) {
      return path;
    }
    return `.../${parts.slice(-2).join('/')}`;
  }

  public formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  }

  public getContributorInitials(name: string): string {
    if (!name) return 'U';
    
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return parts.map(part => part.charAt(0)).join('').substring(0, 2).toUpperCase();
  }
}