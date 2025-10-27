import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  OnInit, 
  inject, 
  signal,
  computed,
  ChangeDetectionStrategy 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
import { DashboardDocument } from '../nuxeo-dashboard/nuxeo-dashboard.component';

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
}

@Component({
  selector: 'app-document-browser',
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
    SatBreadcrumbsModule,
    SatAvatarModule,
    SatTagModule,
    SatIconModule,
    UiButtonComponent,
    UiCardComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './document-browser.component.html',
  styleUrls: ['./document-browser.component.scss']
})
export class DocumentBrowserComponent implements OnInit {
  @Input() document!: DashboardDocument;
  @Input() isVisible = false;
  @Output() closeRequested = new EventEmitter<void>();

  private nuxeoService = inject(NuxeoService);
  private logger = inject(LoggingService);

  // Component state
  public readonly isLoading = signal<boolean>(false);
  public readonly documentDetails = signal<DocumentDetails | null>(null);
  public readonly treeNodes = signal<TreeNode[]>([]);
  public readonly selectedTab = signal<number>(0);
  public readonly comment = signal<string>('');

  // Breadcrumb navigation
  public readonly breadcrumbItems = computed<SatBreadcrumbsItem[]>(() => {
    const details = this.documentDetails();
    if (!details) {
      return [
        { label: 'Home', href: '/' },
        { label: 'Browse' }
      ];
    }

    const pathParts = details.path.split('/').filter(part => part);
    const items: SatBreadcrumbsItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Browse', href: '/browse' }
    ];

    pathParts.forEach((part, index) => {
      const path = '/' + pathParts.slice(0, index + 1).join('/');
      items.push({ 
        label: part.charAt(0).toUpperCase() + part.slice(1), 
        href: `/browse${path}` 
      });
    });

    return items;
  });

  ngOnInit(): void {
    this.initializeTreeData();
    this.loadDocumentDetails();
  }

  private initializeTreeData(): void {
    // Initialize the tree structure like Nuxeo's interface
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
                children: []
              }
            ]
          }
        ]
      }
    ];

    this.treeNodes.set(treeData);
  }

  private async loadDocumentDetails(): Promise<void> {
    if (!this.document) return;

    try {
      this.isLoading.set(true);
      this.logger.info('DocumentBrowser', 'Loading document details', { 
        uid: this.document.uid,
        path: this.document.path 
      });

      const details = await this.nuxeoService.getDocumentByPath(this.document.path);
      
      if (details) {
        const documentDetails: DocumentDetails = {
          uid: details.uid || this.document.uid,
          title: details.title || this.document.title,
          path: details.path || this.document.path,
          type: details.type || this.document.type,
          state: details.state || this.document.state,
          creator: details.properties?.['dc:creator'] || 'Unknown',
          created: details.properties?.['dc:created'] || 'Unknown',
          lastModified: details.properties?.['dc:modified'] || this.document.lastModified,
          lastContributor: details.properties?.['dc:lastContributor'] || this.document.lastContributor,
          description: details.properties?.['dc:description'] || '',
          tags: details.contextParameters?.tags || [],
          collections: details.contextParameters?.collections || [],
          versionLabel: details.versionLabel || '0.0',
          size: details.properties?.['file:content']?.length,
          mimeType: details.properties?.['file:content']?.['mime-type'],
          previewUrl: details.contextParameters?.preview?.url
        };

        this.documentDetails.set(documentDetails);
        this.logger.info('DocumentBrowser', 'Document details loaded successfully');
      }
    } catch (error) {
      this.logger.error('DocumentBrowser', 'Failed to load document details', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  public onTabChanged(index: number): void {
    this.selectedTab.set(index);
    this.logger.info('DocumentBrowser', 'Tab changed', { tabIndex: index });
  }

  public onTreeNodeClick(node: TreeNode): void {
    this.logger.info('DocumentBrowser', 'Tree node clicked', { node: node.name, path: node.path });
    // Toggle expanded state for folders
    if (node.type === 'folder') {
      node.expanded = !node.expanded;
    }
  }

  public onAddComment(): void {
    const commentText = this.comment();
    if (commentText.trim()) {
      this.logger.info('DocumentBrowser', 'Adding comment', { comment: commentText });
      // TODO: Implement comment addition via API
      this.comment.set('');
    }
  }

  public onClose(): void {
    this.closeRequested.emit();
  }

  public onDownload(): void {
    const details = this.documentDetails();
    if (details) {
      this.logger.info('DocumentBrowser', 'Download requested', { uid: details.uid });
      // TODO: Implement download functionality
    }
  }

  public onEdit(): void {
    const details = this.documentDetails();
    if (details) {
      this.logger.info('DocumentBrowser', 'Edit requested', { uid: details.uid });
      // TODO: Implement edit functionality
    }
  }

  public onShare(): void {
    const details = this.documentDetails();
    if (details) {
      this.logger.info('DocumentBrowser', 'Share requested', { uid: details.uid });
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
}