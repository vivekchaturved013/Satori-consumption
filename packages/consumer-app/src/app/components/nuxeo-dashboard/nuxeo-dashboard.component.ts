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
import { Router, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Import Satori UI components
import { SatBreadcrumbsModule, SatBreadcrumbsItem } from '@hylandsoftware/satori-ui/breadcrumbs';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';

// Import our custom UI components
import { UiButtonComponent } from '../../../lib/ui-components/button/ui-button.component';
import { UiCardComponent } from '../../../lib/ui-components/card/ui-card.component';

// Import document browser
import { DocumentBrowserComponent } from '../document-browser/document-browser.component';

import { NuxeoService } from '../../../core/services/nuxeo.service';
import { LoggingService } from '../../../core/services/logging.service';

export interface DashboardDocument {
  uid: string;
  title: string;
  type: string;
  lastModified: string;
  lastViewed?: string;
  lastContributor: string;
  contributorEmail: string;
  path: string;
  state: string;
  icon: string;
}

@Component({
  selector: 'app-nuxeo-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    SatBreadcrumbsModule,
    SatAvatarModule,
    SatTagModule,
    SatIconModule,
    UiButtonComponent,
    UiCardComponent,
    DocumentBrowserComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nuxeo-dashboard.component.html',
  styleUrls: ['./nuxeo-dashboard.component.scss']
})
export class NuxeoDashboardComponent implements OnInit, OnDestroy {
  private nuxeoService = inject(NuxeoService);
  private logger = inject(LoggingService);
  public router = inject(Router); // Make public for template access
  
  private destroy$ = new Subject<void>();

  // Breadcrumb navigation
  breadcrumbItems: SatBreadcrumbsItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Nuxeo ECM', href: '/nuxeo' },
    { label: 'Dashboard' }
  ];

  // Search functionality
  private readonly _recentlyEditedSearch = signal<string>('');
  private readonly _recentlyViewedSearch = signal<string>('');
  private readonly _favoritesSearch = signal<string>('');

  // Document browser state
  private readonly _selectedDocument = signal<DashboardDocument | null>(null);
  private readonly _isDocumentBrowserOpen = signal<boolean>(false);

  // Component state signals
  private readonly _recentlyEdited = signal<DashboardDocument[]>([]);
  private readonly _recentlyViewed = signal<DashboardDocument[]>([]);
  private readonly _favoriteItems = signal<DashboardDocument[]>([]);
  
  private readonly _isLoadingRecent = signal<boolean>(false);
  private readonly _isLoadingViewed = signal<boolean>(false);
  private readonly _isLoadingFavorites = signal<boolean>(false);

  // Public readonly signals
  public readonly recentlyEdited = this._recentlyEdited.asReadonly();
  public readonly recentlyViewed = this._recentlyViewed.asReadonly();
  public readonly favoriteItems = this._favoriteItems.asReadonly();
  
  public readonly isLoadingRecent = this._isLoadingRecent.asReadonly();
  public readonly isLoadingViewed = this._isLoadingViewed.asReadonly();
  public readonly isLoadingFavorites = this._isLoadingFavorites.asReadonly();

  // Public search signals for template access
  public readonly recentlyEditedSearch = this._recentlyEditedSearch.asReadonly();
  public readonly recentlyViewedSearch = this._recentlyViewedSearch.asReadonly();
  public readonly favoritesSearch = this._favoritesSearch.asReadonly();
  
  // Document browser signals
  public readonly selectedDocument = this._selectedDocument.asReadonly();
  public readonly isDocumentBrowserOpen = this._isDocumentBrowserOpen.asReadonly();

  // Filtered data based on search
  public readonly filteredRecentlyEdited = computed(() => {
    const searchTerm = this._recentlyEditedSearch().toLowerCase().trim();
    if (!searchTerm) return this.recentlyEdited();
    
    return this.recentlyEdited().filter(doc => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.lastContributor.toLowerCase().includes(searchTerm) ||
      doc.contributorEmail.toLowerCase().includes(searchTerm) ||
      doc.type.toLowerCase().includes(searchTerm)
    );
  });

  public readonly filteredRecentlyViewed = computed(() => {
    const searchTerm = this._recentlyViewedSearch().toLowerCase().trim();
    if (!searchTerm) return this.recentlyViewed();
    
    return this.recentlyViewed().filter(doc => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.type.toLowerCase().includes(searchTerm) ||
      doc.lastContributor.toLowerCase().includes(searchTerm)
    );
  });

  public readonly filteredFavoriteItems = computed(() => {
    const searchTerm = this._favoritesSearch().toLowerCase().trim();
    if (!searchTerm) return this.favoriteItems();
    
    return this.favoriteItems().filter(doc => 
      doc.title.toLowerCase().includes(searchTerm) ||
      doc.lastContributor.toLowerCase().includes(searchTerm) ||
      doc.contributorEmail.toLowerCase().includes(searchTerm) ||
      doc.type.toLowerCase().includes(searchTerm)
    );
  });

  async ngOnInit() {
    await this.loadDashboardData();
    
    // Close document browser modal when navigating to other routes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        if (event.url.startsWith('/browse')) {
          this.onDocumentBrowserClose();
        }
      });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check if any section is currently loading
   */
  public isAnyLoading(): boolean {
    return this.isLoadingRecent() || this.isLoadingViewed() || this.isLoadingFavorites();
  }

  /**
   * Refresh all dashboard data
   */
  public async refreshAllData(): Promise<void> {
    this.logger.info('NuxeoDashboardComponent', 'Refreshing all dashboard data');
    await this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    // Load all dashboard sections in parallel
    await Promise.all([
      this.loadRecentlyEdited(),
      this.loadRecentlyViewed(),
      this.loadFavoriteItems()
    ]);
  }

  private async loadRecentlyEdited(): Promise<void> {
    try {
      this._isLoadingRecent.set(true);
      
      this.logger.info('NuxeoDashboardComponent', 'Loading recently edited documents from API');

      const response = await this.nuxeoService.getRecentlyEditedDocuments();
      
      if (response && response.entries) {
        const documents = this.transformNuxeoEntriesToDashboardDocuments(response.entries);
        this._recentlyEdited.set(documents);
        this.logger.info('NuxeoDashboardComponent', 'Recently edited documents loaded', { 
          count: documents.length 
        });
      } else {
        this._recentlyEdited.set([]);
        this.logger.warn('NuxeoDashboardComponent', 'No recently edited documents found');
      }
      
    } catch (error) {
      this.logger.error('NuxeoDashboardComponent', 'Failed to load recently edited documents', error);
      this._recentlyEdited.set([]);
    } finally {
      this._isLoadingRecent.set(false);
    }
  }

  private async loadRecentlyViewed(): Promise<void> {
    try {
      this._isLoadingViewed.set(true);
      
      this.logger.info('NuxeoDashboardComponent', 'Loading recently viewed documents from API');

      const response = await this.nuxeoService.getRecentlyViewedDocuments();
      
      if (response && response.entries) {
        const documents = this.transformNuxeoEntriesToDashboardDocuments(response.entries);
        this._recentlyViewed.set(documents);
        this.logger.info('NuxeoDashboardComponent', 'Recently viewed documents loaded', { 
          count: documents.length 
        });
      } else {
        this._recentlyViewed.set([]);
        this.logger.warn('NuxeoDashboardComponent', 'No recently viewed documents found');
      }
      
    } catch (error) {
      this.logger.error('NuxeoDashboardComponent', 'Failed to load recently viewed documents', error);
      this._recentlyViewed.set([]);
    } finally {
      this._isLoadingViewed.set(false);
    }
  }

  private async loadFavoriteItems(): Promise<void> {
    try {
      this._isLoadingFavorites.set(true);
      
      this.logger.info('NuxeoDashboardComponent', 'Loading favorite documents from API');

      const response = await this.nuxeoService.getFavoriteDocuments();
      
      if (response && response.entries) {
        const documents = this.transformNuxeoEntriesToDashboardDocuments(response.entries);
        this._favoriteItems.set(documents);
        this.logger.info('NuxeoDashboardComponent', 'Favorite documents loaded', { 
          count: documents.length 
        });
      } else {
        this._favoriteItems.set([]);
        this.logger.info('NuxeoDashboardComponent', 'No favorite documents found');
      }
      
    } catch (error) {
      this.logger.error('NuxeoDashboardComponent', 'Failed to load favorite items', error);
      this._favoriteItems.set([]);
    } finally {
      this._isLoadingFavorites.set(false);
    }
  }

  public onDocumentClick(document: DashboardDocument): void {
    this.logger.info('NuxeoDashboardComponent', 'Document clicked', { 
      uid: document.uid, 
      title: document.title 
    });
    
    // Set the selected document and open the browser
    this._selectedDocument.set(document);
    this._isDocumentBrowserOpen.set(true);
  }

  public onDocumentBrowserClose(): void {
    this.logger.info('NuxeoDashboardComponent', 'Document browser closed');
    this._isDocumentBrowserOpen.set(false);
    this._selectedDocument.set(null);
  }

  // Search functionality methods
  public onRecentlyEditedSearch(searchTerm: string): void {
    this._recentlyEditedSearch.set(searchTerm);
  }

  public onRecentlyViewedSearch(searchTerm: string): void {
    this._recentlyViewedSearch.set(searchTerm);
  }

  public onFavoritesSearch(searchTerm: string): void {
    this._favoritesSearch.set(searchTerm);
  }

  public clearRecentlyEditedSearch(): void {
    this._recentlyEditedSearch.set('');
  }

  public clearRecentlyViewedSearch(): void {
    this._recentlyViewedSearch.set('');
  }

  public clearFavoritesSearch(): void {
    this._favoritesSearch.set('');
  }

  /**
   * Transform Nuxeo API entries to dashboard document format with deduplication
   */
  private transformNuxeoEntriesToDashboardDocuments(entries: any[]): DashboardDocument[] {
    const documentMap = new Map<string, DashboardDocument>();
    
    entries.forEach(entry => {
      const document: DashboardDocument = {
        uid: entry.uid,
        title: entry.title || entry.properties?.['dc:title'] || 'Untitled',
        type: entry.type,
        lastModified: entry.lastModified || entry.properties?.['dc:modified'] || new Date().toISOString(),
        lastViewed: entry.lastViewed || entry.properties?.['dc:modified'],
        lastContributor: entry.properties?.['dc:lastContributor']?.properties?.username || 
                         entry.properties?.['dc:lastContributor']?.id || 
                         entry.properties?.['dc:lastContributor'] ||
                         'Administrator',
        contributorEmail: entry.properties?.['dc:lastContributor']?.properties?.email || 
                          this.getEmailFromUsername(entry.properties?.['dc:lastContributor']?.properties?.username || 
                                                   entry.properties?.['dc:lastContributor']?.id ||
                                                   entry.properties?.['dc:lastContributor'] || 
                                                   'Administrator'),
        path: entry.path,
        state: entry.state || 'project',
        icon: this.getDocumentIcon(entry.type)
      };
      
      // Use UID as unique key to prevent duplicates
      if (!documentMap.has(document.uid)) {
        documentMap.set(document.uid, document);
      }
    });
    
    return Array.from(documentMap.values());
  }

  /**
   * Generate email from username (fallback)
   */
  private getEmailFromUsername(username: string): string {
    if (!username) return 'unknown@nuxeo.com';
    
    // Common username patterns
    if (username.toLowerCase() === 'administrator' || username.toLowerCase() === 'admin') {
      return 'admin@nuxeo.com';
    }
    
    if (username.toLowerCase() === 'devnull') {
      return 'devnull@nuxeo.com';
    }
    
    // Generate email from username
    return `${username.toLowerCase()}@nuxeo.com`;
  }

  public getDocumentIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Collection': 'bookmark',
      'Picture': 'image',
      'Video': 'video',
      'Audio': 'audio',
      'File': 'file',
      'Favorites': 'star',
      'Folder': 'folder',
      'Workspace': 'workspace',
      'Domain': 'domain',
      'workspaceroot': 'business',
      'templateroot': 'template'
    };
    return iconMap[type] || 'file';
  }

  public getDocumentEmoji(type: string): string {
    const emojiMap: { [key: string]: string } = {
      'Collection': '📚',
      'Picture': '🖼️',
      'Video': '🎥',
      'Audio': '🎵',
      'File': '📄',
      'Favorites': '⭐',
      'Folder': '📁',
      'Workspace': '🏢',
      'Domain': '🌐',
      'workspaceroot': '💼',
      'templateroot': '📋'
    };
    return emojiMap[type] || '📄';
  }

  public formatTimeAgo(dateString: string): string {
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
      return 'a day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
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
      return parts[0].substring(0, 1).toUpperCase();
    }
    return parts.map(part => part.charAt(0)).join('').substring(0, 2).toUpperCase();
  }
}