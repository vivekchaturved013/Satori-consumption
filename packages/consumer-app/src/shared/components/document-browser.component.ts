import { 
  Component, 
  OnInit, 
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

interface DocumentTreeNode {
  uid: string;
  title: string;
  type: string;
  path: string;
  lastModified: string;
  isFolder: boolean;
  level: number;
  isExpanded: boolean;
  children: DocumentTreeNode[];
  parentRef?: string;
}

@Component({
  selector: 'app-document-browser',
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
    <sat-card variant="elevated" class="document-browser">
      <div class="browser-header">
        <sat-icon name="folder" color="primary"></sat-icon>
        <h2>Document Browser</h2>
        <sat-button 
          variant="outline" 
          size="small"
          [disabled]="isLoading()"
          (clicked)="loadDocuments()">
          @if (isLoading()) {
            <sat-icon name="refresh" class="spinning"></sat-icon>
            Loading...
          } @else {
            <sat-icon name="refresh"></sat-icon>
            Refresh
          }
        </sat-button>
      </div>
      
      @if (error()) {
        <div class="error-state">
          <sat-icon name="error" color="error"></sat-icon>
          <div>
            <strong>Error Loading Documents</strong>
            <p>{{ error() }}</p>
          </div>
        </div>
      }

      @if (documentTree().length > 0 && !isLoading()) {
        <div class="document-tree">
          <div class="tree-info">
            <span class="results-count">{{ totalResults() }} documents found</span>
            <span class="page-info">Page {{ currentPage() + 1 }} of {{ totalPages() }}</span>
          </div>
          
          @for (node of documentTree(); track node.uid) {
            <div class="tree-node" [class.folder]="node.isFolder" [style.padding-left.px]="node.level * 20">
              <div class="node-content">
                @if (node.isFolder) {
                  <sat-button 
                    variant="ghost" 
                    size="small" 
                    class="expand-button"
                    (clicked)="toggleNode(node)">
                    <sat-icon [name]="node.isExpanded ? 'expand_less' : 'expand_more'"></sat-icon>
                  </sat-button>
                } @else {
                  <div class="spacer"></div>
                }
                
                <sat-icon 
                  [name]="getDocumentIcon(node.type)" 
                  [color]="getDocumentIconColor(node.type)"
                  class="doc-icon">
                </sat-icon>
                
                <div class="node-info">
                  <span class="node-title">{{ node.title }}</span>
                  <span class="node-type">{{ node.type }}</span>
                </div>
                
                <div class="node-meta">
                  <span class="last-modified">{{ formatDate(node.lastModified) }}</span>
                </div>
              </div>
            </div>
          }
          
          @if (hasMorePages()) {
            <div class="pagination">
              <sat-button 
                variant="outline" 
                size="small"
                [disabled]="!canGoToPreviousPage()"
                (clicked)="previousPage()">
                <sat-icon name="chevron_left"></sat-icon>
                Previous
              </sat-button>
              
              <span class="page-indicator">
                {{ currentPage() + 1 }} / {{ totalPages() }}
              </span>
              
              <sat-button 
                variant="outline" 
                size="small"
                [disabled]="!canGoToNextPage()"
                (clicked)="nextPage()">
                Next
                <sat-icon name="chevron_right"></sat-icon>
              </sat-button>
            </div>
          }
        </div>
      }

      @if (isLoading()) {
        <div class="loading-state">
          <sat-icon name="refresh" class="spinning large"></sat-icon>
          <p>Loading documents...</p>
        </div>
      }
    </sat-card>
  `,
  styles: [`
    .document-browser {
      max-width: 800px;
      margin: 1rem 0;
    }
    
    .browser-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--sat-border-color, #e0e0e0);
      
      h2 {
        flex: 1;
        margin: 0;
        color: var(--sat-primary-color, #1976d2);
      }
    }
    
    .document-tree {
      .tree-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        padding: 0.5rem 1rem;
        background-color: var(--sat-surface-color, #f5f5f5);
        border-radius: 4px;
        
        .results-count {
          font-weight: 500;
          color: var(--sat-text-primary, #212121);
        }
        
        .page-info {
          font-size: 0.875rem;
          color: var(--sat-text-secondary, #757575);
        }
      }
    }
    
    .tree-node {
      border-bottom: 1px solid var(--sat-border-color, #e0e0e0);
      
      &:last-child {
        border-bottom: none;
      }
      
      &.folder {
        background-color: rgba(25, 118, 210, 0.02);
      }
      
      .node-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 0;
        cursor: pointer;
        
        &:hover {
          background-color: rgba(25, 118, 210, 0.04);
        }
      }
      
      .expand-button {
        width: 24px;
        height: 24px;
        padding: 0;
        min-width: 24px;
      }
      
      .spacer {
        width: 24px;
      }
      
      .doc-icon {
        flex-shrink: 0;
      }
      
      .node-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        
        .node-title {
          font-weight: 500;
          color: var(--sat-text-primary, #212121);
        }
        
        .node-type {
          font-size: 0.75rem;
          color: var(--sat-text-secondary, #757575);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }
      
      .node-meta {
        .last-modified {
          font-size: 0.75rem;
          color: var(--sat-text-secondary, #757575);
        }
      }
    }
    
    .pagination {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--sat-border-color, #e0e0e0);
      
      .page-indicator {
        font-weight: 500;
        color: var(--sat-text-primary, #212121);
      }
    }
    
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      text-align: center;
      
      .large {
        font-size: 2rem;
      }
      
      p {
        margin-top: 1rem;
        color: var(--sat-text-secondary, #757575);
      }
    }
    
    .error-state {
      div {
        strong {
          color: var(--sat-error-color, #f44336);
        }
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
export class DocumentBrowserComponent implements OnInit {
  private readonly nuxeoService = inject(NuxeoService);
  private readonly logger = inject(LoggingService);

  // State signals
  private readonly _isLoading = signal(false);
  private readonly _error = signal<string>('');
  private readonly _rawDocuments = signal<any[]>([]);
  private readonly _currentPage = signal(0);
  private readonly _totalResults = signal(0);
  private readonly _totalPages = signal(0);

  // Public readonly signals
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly error = this._error.asReadonly();
  public readonly currentPage = this._currentPage.asReadonly();
  public readonly totalResults = this._totalResults.asReadonly();
  public readonly totalPages = this._totalPages.asReadonly();

  // Computed document tree
  public readonly documentTree = computed(() => {
    const docs = this._rawDocuments();
    return this.buildDocumentTree(docs);
  });

  public readonly hasMorePages = computed(() => this._totalPages() > 1);
  public readonly canGoToPreviousPage = computed(() => this._currentPage() > 0);
  public readonly canGoToNextPage = computed(() => this._currentPage() < this._totalPages() - 1);

  ngOnInit(): void {
    this.logger.info('DocumentBrowserComponent', 'Component initialized');
    this.loadDocuments();
  }

  public async loadDocuments(page: number = 0): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set('');

      this.logger.info('DocumentBrowserComponent', `Loading documents page ${page}`);
      
      // Use the same search call as the test
      const query = "SELECT * FROM Document WHERE ecm:isTrashed = 0 ORDER BY dc:modified DESC";
      const searchUrl = `http://localhost:8080/nuxeo/api/v1/search/execute?currentPageIndex=${page}&pageSize=15&query=${encodeURIComponent(query)}`;
      
      const credentials = btoa('Administrator:Administrator');
      const headers = { 'Authorization': `Basic ${credentials}`, 'Content-Type': 'application/json' };
      
      const response: any = await this.nuxeoService['http'].get(searchUrl, { headers }).toPromise();
      
      this._rawDocuments.set(response.entries || []);
      this._currentPage.set(response.currentPageIndex || 0);
      this._totalResults.set(response.resultsCount || 0);
      this._totalPages.set(response.numberOfPages || 0);
      
      this.logger.info('DocumentBrowserComponent', `Loaded ${response.entries?.length || 0} documents`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load documents';
      this._error.set(errorMessage);
      this.logger.error('DocumentBrowserComponent', 'Failed to load documents', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  public async previousPage(): Promise<void> {
    if (this.canGoToPreviousPage()) {
      await this.loadDocuments(this._currentPage() - 1);
    }
  }

  public async nextPage(): Promise<void> {
    if (this.canGoToNextPage()) {
      await this.loadDocuments(this._currentPage() + 1);
    }
  }

  public toggleNode(node: DocumentTreeNode): void {
    node.isExpanded = !node.isExpanded;
    this.logger.info('DocumentBrowserComponent', `Toggled node: ${node.title}`);
  }

  public getDocumentIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Domain': 'domain',
      'Workspace': 'workspaces',
      'WorkspaceRoot': 'workspaces',
      'Folder': 'folder',
      'Collection': 'collections',
      'Collections': 'collections',
      'Picture': 'image',
      'File': 'description',
      'UserProfile': 'person',
      'Favorites': 'favorite',
      'TemplateRoot': 'template',
      'SectionRoot': 'folder_special',
      'TaskRoot': 'task',
      'AdministrativeStatus': 'settings',
      'UserWorkspacesRoot': 'group'
    };
    return iconMap[type] || 'description';
  }

  public getDocumentIconColor(type: string): "primary" | "secondary" | "success" | "warning" | "error" | undefined {
    const folderTypes = ['Domain', 'Workspace', 'WorkspaceRoot', 'Folder', 'TemplateRoot', 'SectionRoot', 'TaskRoot', 'UserWorkspacesRoot'];
    return folderTypes.includes(type) ? 'primary' : 'secondary';
  }

  public formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private buildDocumentTree(documents: any[]): DocumentTreeNode[] {
    const nodes: DocumentTreeNode[] = documents.map(doc => ({
      uid: doc.uid,
      title: doc.title,
      type: doc.type,
      path: doc.path,
      lastModified: doc.lastModified,
      isFolder: this.isFolder(doc),
      level: this.calculateLevel(doc.path),
      isExpanded: false,
      children: [],
      parentRef: doc.parentRef
    }));

    // Sort by path to create hierarchy
    return nodes.sort((a, b) => {
      if (a.level !== b.level) return a.level - b.level;
      return a.path.localeCompare(b.path);
    });
  }

  private isFolder(doc: any): boolean {
    const folderTypes = ['Domain', 'Workspace', 'WorkspaceRoot', 'Folder', 'TemplateRoot', 'SectionRoot', 'TaskRoot', 'UserWorkspacesRoot'];
    return folderTypes.includes(doc.type) || (doc.facets && doc.facets.includes('Folderish'));
  }

  private calculateLevel(path: string): number {
    return path.split('/').filter(segment => segment !== '').length - 1;
  }
}