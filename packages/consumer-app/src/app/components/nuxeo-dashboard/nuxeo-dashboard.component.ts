import { 
  Component, 
  OnInit, 
  inject, 
  signal,
  ChangeDetectionStrategy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SatButtonComponent, SatIconComponent } from '../../../lib/satori-demo';

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
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    SatButtonComponent,
    SatIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nuxeo-dashboard.component.html',
  styleUrls: ['./nuxeo-dashboard.component.scss']
})
export class NuxeoDashboardComponent implements OnInit {
  private nuxeoService = inject(NuxeoService);
  private logger = inject(LoggingService);

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

  async ngOnInit() {
    await this.loadDashboardData();
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
    // TODO: Implement document navigation
  }

  /**
   * Transform Nuxeo API entries to dashboard document format
   */
  private transformNuxeoEntriesToDashboardDocuments(entries: any[]): DashboardDocument[] {
    return entries.map(entry => ({
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
    }));
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