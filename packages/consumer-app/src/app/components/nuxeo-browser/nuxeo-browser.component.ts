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
import { Router, ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTreeModule } from '@angular/material/tree';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatMenuModule } from '@angular/material/menu';

// Import Satori UI components
import { SatBreadcrumbsModule, SatBreadcrumbsItem } from '@hylandsoftware/satori-ui/breadcrumbs';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';

// Import our custom UI components
import { UiButtonComponent } from '../../../lib/ui-components/button/ui-button.component';
import { UiCardComponent } from '../../../lib/ui-components/card/ui-card.component';

import { NuxeoService } from '../../../core/services/nuxeo.service';
import { LoggingService } from '../../../core/services/logging.service';

export interface TreeNode {
  name: string;
  path: string;
  type: 'folder' | 'document';
  children?: TreeNode[];
  expanded?: boolean;
  icon?: string;
}

export interface DocumentDetails {
  uid: string;
  title: string;
  path: string;
  type: string;
  state: string;
  creator: string;
  created: string;
  lastModified: string;
  lastContributor: string;
  description?: string;
  tags?: string[];
  collections?: string[];
  permissions?: any[];
  versionLabel?: string;
  size?: number;
  mimeType?: string;
  previewUrl?: string;
  properties?: any;
}

@Component({
  selector: 'app-nuxeo-browser',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatTreeModule,
    MatListModule,
    MatExpansionModule,
    MatDividerModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatSidenavModule,
    MatMenuModule,
    SatBreadcrumbsModule,
    SatAvatarModule,
    SatTagModule,
    SatIconModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './nuxeo-browser-enhanced.component.html',
  styleUrls: ['./nuxeo-browser-enhanced.component.scss']
})
export class NuxeoBrowserComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private nuxeoService = inject(NuxeoService);
  private logger = inject(LoggingService);

  // Component state
  public readonly isLoading = signal<boolean>(false);
  public readonly currentPath = signal<string>('/default-domain');
  public readonly documentDetails = signal<DocumentDetails | null>(null);
  public readonly treeNodes = signal<TreeNode[]>([]);
  public readonly selectedTab = signal<number>(0);
  public readonly comment = signal<string>('');
  public readonly documents = signal<any[]>([]);
  public readonly allDocuments = signal<any[]>([]); // All documents for search
  public readonly recentlyViewedDocuments = signal<any[]>([]); // Recently viewed (limited to 3)
  public readonly selectedViewTab = signal<number>(0);
  public readonly searchQuery = signal<string>('');
  public readonly selectedDocumentForPreview = signal<any | null>(null);
  public readonly showDetails = signal<boolean>(false);
  public readonly currentView = signal<'recently-viewed' | 'search-results'>('recently-viewed');

  // Breadcrumb navigation
  public readonly breadcrumbItems = computed<SatBreadcrumbsItem[]>(() => {
    const path = this.currentPath();
    const pathParts = path.split('/').filter(part => part);
    const items: SatBreadcrumbsItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Browse', href: '/browse' }
    ];

    pathParts.forEach((part, index) => {
      const breadcrumbPath = '/' + pathParts.slice(0, index + 1).join('/');
      items.push({ 
        label: part.charAt(0).toUpperCase() + part.slice(1).replace('-', ' '), 
        href: `/browse${breadcrumbPath}` 
      });
    });

    return items;
  });

  // Filtered documents based on search - searches ALL documents
  public readonly filteredDocuments = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    
    if (!query) {
      this.currentView.set('recently-viewed');
      return this.recentlyViewedDocuments();
    }
    
    this.currentView.set('search-results');
    return this.allDocuments().filter(doc => 
      doc.title?.toLowerCase().includes(query) ||
      doc.type?.toLowerCase().includes(query) ||
      doc.properties?.['dc:creator']?.toLowerCase().includes(query) ||
      doc.properties?.['dc:description']?.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const pathParam = params.get('path');
      if (pathParam) {
        this.currentPath.set('/' + pathParam);
      }
      this.initializeTreeData();
      this.loadDocuments();
    });
  }

  private initializeTreeData(): void {
    const treeData: TreeNode[] = [
      {
        name: 'Root',
        path: '/',
        type: 'folder',
        icon: 'folder',
        expanded: true,
        children: [
          {
            name: 'Domain',
            path: '/default-domain',
            type: 'folder',
            icon: 'domain',
            expanded: true,
            children: [
              {
                name: 'Sections',
                path: '/default-domain/sections',
                type: 'folder',
                icon: 'folder'
              },
              {
                name: 'Templates',
                path: '/default-domain/templates',
                type: 'folder',
                icon: 'folder'
              },
              {
                name: 'Workspaces',
                path: '/default-domain/workspaces',
                type: 'folder',
                icon: 'folder',
                expanded: true,
                children: [
                  {
                    name: 't',
                    path: '/default-domain/workspaces/t',
                    type: 'folder',
                    icon: 'folder'
                  }
                ]
              }
            ]
          }
        ]
      }
    ];

    this.treeNodes.set(treeData);
  }

  private async loadDocuments(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.logger.info('NuxeoBrowser', 'Loading documents for path', { path: this.currentPath() });

      // Load recently viewed documents and get more for search
      const recentResponse = await this.nuxeoService.getRecentlyEditedDocuments();
      
      // Try to get domain documents for comprehensive search, fallback to recent if needed
      let allResponse;
      try {
        allResponse = await this.nuxeoService.getDomainDocuments();
      } catch (error) {
        this.logger.warn('NuxeoBrowser', 'Could not load domain documents, using recent documents for search');
        allResponse = recentResponse;
      }
      
      if (recentResponse?.entries) {
        // Limit recently viewed to only 3 documents
        const recentlyViewed = recentResponse.entries.slice(0, 3);
        this.recentlyViewedDocuments.set(recentlyViewed);
        this.documents.set(recentlyViewed); // For backward compatibility
        
        // Load all documents for search (simulate with more recent documents if getAllDocuments doesn't exist)
        const allDocs = allResponse?.entries || recentResponse.entries || [];
        this.allDocuments.set(allDocs);
        
        // If we have documents and none selected, select the first one
        if (recentlyViewed.length > 0 && !this.documentDetails()) {
          await this.selectDocument(recentlyViewed[0]);
        }
      }
    } catch (error) {
      this.logger.error('NuxeoBrowser', 'Failed to load documents', error);
      
      // Fallback: load recently edited and use them for both
      try {
        const fallbackResponse = await this.nuxeoService.getRecentlyEditedDocuments();
        if (fallbackResponse?.entries) {
          const recentlyViewed = fallbackResponse.entries.slice(0, 3);
          this.recentlyViewedDocuments.set(recentlyViewed);
          this.documents.set(recentlyViewed);
          this.allDocuments.set(fallbackResponse.entries); // Use all for search
        } else {
          // Set empty arrays if no data
          this.recentlyViewedDocuments.set([]); 
          this.documents.set([]);
          this.allDocuments.set([]);
        }
      } catch (fallbackError) {
        this.logger.error('NuxeoBrowser', 'Fallback document loading failed', fallbackError);
        // Set empty arrays on complete failure
        this.recentlyViewedDocuments.set([]);
        this.documents.set([]);
        this.allDocuments.set([]);
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  private async selectDocument(doc: any): Promise<void> {
    try {
      this.logger.info('NuxeoBrowser', 'Selecting document', { uid: doc.uid, path: doc.path });

      const documentDetails: DocumentDetails = {
        uid: doc.uid,
        title: doc.title || doc.properties?.['dc:title'] || 'Untitled',
        path: doc.path,
        type: doc.type,
        state: doc.state || 'project',
        creator: doc.properties?.['dc:creator'] || 'Unknown',
        created: doc.properties?.['dc:created'] || new Date().toISOString(),
        lastModified: doc.properties?.['dc:modified'] || new Date().toISOString(),
        lastContributor: doc.properties?.['dc:lastContributor'] || 'Unknown',
        description: doc.properties?.['dc:description'] || '',
        tags: doc.contextParameters?.tags || [],
        collections: doc.contextParameters?.collections || [],
        versionLabel: doc.versionLabel || '1.0',
        size: doc.properties?.['file:content']?.length,
        mimeType: doc.properties?.['file:content']?.['mime-type'],
        properties: doc.properties
      };

      this.documentDetails.set(documentDetails);
    } catch (error) {
      this.logger.error('NuxeoBrowser', 'Failed to select document', error);
    }
  }

  public onTabChanged(index: number): void {
    this.selectedTab.set(index);
    this.logger.info('NuxeoBrowser', 'Tab changed', { tabIndex: index });
  }

  public onTreeNodeClick(node: TreeNode): void {
    this.logger.info('NuxeoBrowser', 'Tree node clicked', { node: node.name, path: node.path });
    
    // Toggle expanded state for folders
    if (node.type === 'folder') {
      node.expanded = !node.expanded;
    }
    
    // Navigate to the path
    this.router.navigate(['/browse', node.path.substring(1)]);
  }

  public onDocumentClick(doc: any): void {
    this.selectDocument(doc);
  }

  public onAddComment(): void {
    const commentText = this.comment();
    if (commentText.trim()) {
      this.logger.info('NuxeoBrowser', 'Adding comment', { comment: commentText });
      // TODO: Implement comment addition via API
      this.comment.set('');
    }
  }

  public onDownload(): void {
    const details = this.documentDetails();
    if (details) {
      this.logger.info('NuxeoBrowser', 'Download requested', { uid: details.uid });
      // TODO: Implement download functionality
    }
  }

  public onEdit(): void {
    const details = this.documentDetails();
    if (details) {
      this.logger.info('NuxeoBrowser', 'Edit requested', { uid: details.uid });
      // TODO: Implement edit functionality
    }
  }

  public onShare(): void {
    const details = this.documentDetails();
    if (details) {
      this.logger.info('NuxeoBrowser', 'Share requested', { uid: details.uid });
      // TODO: Implement share functionality
    }
  }

  public formatFileSize(bytes: number | undefined): string {
    if (!bytes) return 'Unknown';
    
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  public formatDate(dateString: string): string {
    if (!dateString || dateString === 'Invalid Date') return 'Unknown';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Unknown';
    }
  }

  public getDocumentIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Picture': 'image',
      'File': 'description',
      'Folder': 'folder',
      'Workspace': 'work',
      'Domain': 'domain',
      'Collection': 'collections'
    };
    
    return iconMap[type] || 'description';
  }

  public getCreatorInitials(name: string): string {
    if (!name || name === 'Unknown') return 'UN';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    
    return name.substring(0, 2).toUpperCase();
  }

  public onSearchInput(query: string): void {
    this.searchQuery.set(query);
  }

  public selectDocumentForPreview(document: any): void {
    this.selectedDocumentForPreview.set(document);
    this.logger.info('NuxeoBrowser', 'Document selected for preview', { 
      uid: document.uid, 
      title: document.title 
    });
  }

  public toggleDetails(): void {
    this.showDetails.update(current => !current);
  }

  public getTreeNodeIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'root': 'account_tree',
      'domain': 'domain',
      'folder': 'folder',
      'workspace': 'work',
      'section': 'content_copy',
      'template': 'description'
    };
    return iconMap[type] || 'folder';
  }

  public getDocumentThumbnail(document: any): string {
    // Return a placeholder or actual thumbnail URL
    if (document.type === 'Picture' && document.properties?.['file:content']) {
      // In a real implementation, this would be the actual thumbnail URL
      return `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#f0f0f0"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#666">IMG</text></svg>')}`;
    }
    return '';
  }
}