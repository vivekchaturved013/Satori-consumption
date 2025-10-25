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

import { TreeService, TreeNode } from '../../core/services/tree.service';
import { NuxeoService } from '../../core/services/nuxeo.service';

@Component({
  selector: 'app-enhanced-document-tree',
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
    <sat-card variant="elevated" class="enhanced-tree-browser">
      <div class="tree-header">
        <div class="header-left">
          <sat-icon name="account_tree" color="primary" [size]="24"></sat-icon>
          <h2>Enhanced Document Tree</h2>
        </div>
        
        <div class="header-actions">
          <div class="search-box">
            <sat-icon name="search" [size]="16"></sat-icon>
            <input 
              type="text" 
              placeholder="Search documents..." 
              [value]="searchQuery()"
              (input)="onSearchInput($event)"
              class="search-input">
            @if (searchQuery()) {
              <sat-button 
                variant="ghost" 
                size="small"
                (clicked)="clearSearch()"
                class="clear-search">
                <sat-icon name="close" [size]="14"></sat-icon>
              </sat-button>
            }
          </div>
          
          <sat-button 
            variant="outline" 
            size="small"
            [disabled]="treeService.isLoading()"
            (clicked)="refreshTree()">
            @if (treeService.isLoading()) {
              <sat-icon name="refresh" class="spinning" [size]="16"></sat-icon>
            } @else {
              <sat-icon name="refresh" [size]="16"></sat-icon>
            }
            Refresh
          </sat-button>
        </div>
      </div>

      <!-- Breadcrumb Navigation -->
      @if (selectedNode()) {
        <div class="breadcrumb-nav">
          <sat-icon name="folder_open" [size]="16"></sat-icon>
          @for (node of getNodePath(selectedNode()!); track node.id; let isLast = $last) {
            <span class="breadcrumb-item" [class.active]="isLast">
              @if (!isLast) {
                <sat-button 
                  variant="ghost" 
                  size="small"
                  (clicked)="selectNode(node)">
                  {{ node.title }}
                </sat-button>
                <sat-icon name="chevron_right" [size]="12"></sat-icon>
              } @else {
                <span class="current-node">{{ node.title }}</span>
              }
            </span>
          }
        </div>
      }
      
      @if (treeService.error()) {
        <div class="error-state">
          <sat-icon name="error" color="error" [size]="24"></sat-icon>
          <div class="error-content">
            <strong>Error Loading Tree</strong>
            <p>{{ treeService.error() }}</p>
            <sat-button 
              variant="outline" 
              size="small"
              (clicked)="refreshTree()">
              <sat-icon name="refresh" [size]="16"></sat-icon>
              Try Again
            </sat-button>
          </div>
        </div>
      }

      @if (displayNodes().length > 0) {
        <div class="tree-container">
          <div class="tree-info">
            <span class="node-count">
              @if (searchQuery()) {
                {{ displayNodes().length }} of {{ treeService.visibleNodes().length }} documents
              } @else {
                {{ displayNodes().length }} documents
              }
            </span>
          </div>
          
          <div class="tree-nodes" role="tree">
            @for (node of displayNodes(); track node.id) {
              <div 
                class="tree-node" 
                [class.folder]="node.isFolder"
                [class.selected]="selectedNode()?.id === node.id"
                [class.loading]="node.isLoading"
                [style.padding-left.px]="getNodeIndentation(node)"
                role="treeitem"
                [attr.aria-expanded]="node.isFolder ? node.isExpanded : null"
                [attr.aria-level]="node.level + 1"
                tabindex="0"
                (click)="onNodeClick(node)"
                (keydown)="onNodeKeydown($event, node)">
                
                <div class="node-content">
                  <!-- Expand/Collapse Button -->
                  @if (node.isFolder) {
                    <sat-button 
                      variant="ghost" 
                      size="small" 
                      class="expand-button"
                      [disabled]="node.isLoading"
                      (clicked)="toggleNode(node)">
                      @if (node.isLoading) {
                        <sat-icon name="refresh" class="spinning" [size]="14"></sat-icon>
                      } @else if (node.isExpanded) {
                        <sat-icon name="expand_less" [size]="16"></sat-icon>
                      } @else {
                        <sat-icon name="expand_more" [size]="16"></sat-icon>
                      }
                    </sat-button>
                  } @else {
                    <div class="node-spacer"></div>
                  }
                  
                  <!-- Document Icon -->
                  <sat-icon 
                    [name]="getDocumentIcon(node)" 
                    [color]="getDocumentIconColor(node)"
                    class="doc-icon"
                    [size]="18">
                  </sat-icon>
                  
                  <!-- Node Info -->
                  <div class="node-info">
                    <span class="node-title" [title]="node.title">{{ node.title }}</span>
                    <span class="node-type">{{ node.type }}</span>
                  </div>
                  
                  <!-- Node Actions -->
                  <div class="node-actions">
                    @if (node.isFolder) {
                      <span class="child-count">
                        @if (node.hasChildren && !node.isExpanded) {
                          <sat-icon name="folder" [size]="12"></sat-icon>
                        } @else if (node.children.length > 0) {
                          {{ node.children.length }}
                        }
                      </span>
                    }
                    
                    <span class="last-modified" [title]="formatDate(node.lastModified)">
                      {{ formatDateShort(node.lastModified) }}
                    </span>
                    
                    <!-- Context Menu Button -->
                    <sat-button 
                      variant="ghost" 
                      size="small"
                      class="context-menu-button"
                      (clicked)="showContextMenu($event, node)">
                      <sat-icon name="more_vert" [size]="14"></sat-icon>
                    </sat-button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (treeService.isLoading() && displayNodes().length === 0) {
        <div class="loading-state">
          <sat-icon name="refresh" class="spinning large" [size]="32"></sat-icon>
          <p>Loading document tree...</p>
        </div>
      }

      @if (!treeService.isLoading() && displayNodes().length === 0 && !treeService.error()) {
        <div class="empty-state">
          <sat-icon name="folder_open" [size]="48" color="secondary"></sat-icon>
          <h3>No Documents Found</h3>
          @if (searchQuery()) {
            <p>No documents match your search criteria.</p>
            <sat-button variant="outline" (clicked)="clearSearch()">
              <sat-icon name="clear" [size]="16"></sat-icon>
              Clear Search
            </sat-button>
          } @else {
            <p>This folder appears to be empty.</p>
          }
        </div>
      }
    </sat-card>
  `,
  styles: [`
    .enhanced-tree-browser {
      max-height: 600px;
      display: flex;
      flex-direction: column;
    }

    .tree-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--n-90);
      flex-shrink: 0;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-left h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: var(--n-10);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .search-box {
      position: relative;
      display: flex;
      align-items: center;
      background: var(--n-98);
      border: 1px solid var(--n-80);
      border-radius: 8px;
      padding: 6px 8px;
      min-width: 200px;
    }

    .search-input {
      border: none;
      background: transparent;
      outline: none;
      margin-left: 6px;
      flex: 1;
      font-size: 14px;
      color: var(--n-10);
    }

    .search-input::placeholder {
      color: var(--n-60);
    }

    .clear-search {
      margin-left: 4px;
    }

    .breadcrumb-nav {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      background: var(--n-96);
      border-bottom: 1px solid var(--n-90);
      font-size: 14px;
      flex-shrink: 0;
    }

    .breadcrumb-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .current-node {
      font-weight: 500;
      color: var(--n-10);
    }

    .tree-container {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .tree-info {
      padding: 8px 16px;
      background: var(--n-98);
      border-bottom: 1px solid var(--n-95);
      font-size: 12px;
      color: var(--n-40);
      flex-shrink: 0;
    }

    .tree-nodes {
      flex: 1;
      overflow-y: auto;
      padding: 4px 0;
    }

    .tree-node {
      position: relative;
      cursor: pointer;
      transition: background-color 0.15s ease;
      border-left: 3px solid transparent;
    }

    .tree-node:hover {
      background-color: var(--n-96);
    }

    .tree-node.selected {
      background-color: var(--p-95);
      border-left-color: var(--p-40);
    }

    .tree-node.loading {
      opacity: 0.7;
    }

    .tree-node:focus {
      outline: 2px solid var(--p-40);
      outline-offset: -2px;
    }

    .node-content {
      display: flex;
      align-items: center;
      padding: 4px 8px;
      gap: 6px;
      min-height: 32px;
    }

    .expand-button {
      width: 24px !important;
      height: 24px !important;
      min-width: 24px !important;
      padding: 0 !important;
      flex-shrink: 0;
    }

    .node-spacer {
      width: 24px;
      flex-shrink: 0;
    }

    .doc-icon {
      flex-shrink: 0;
    }

    .node-info {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .node-title {
      font-weight: 500;
      color: var(--n-10);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
    }

    .node-type {
      font-size: 11px;
      color: var(--n-50);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .node-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .child-count {
      font-size: 11px;
      color: var(--n-50);
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .last-modified {
      font-size: 11px;
      color: var(--n-60);
      white-space: nowrap;
    }

    .context-menu-button {
      opacity: 0;
      transition: opacity 0.15s ease;
    }

    .tree-node:hover .context-menu-button {
      opacity: 1;
    }

    .error-state,
    .loading-state,
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

    .empty-state h3 {
      margin: 16px 0 8px 0;
      color: var(--n-30);
    }

    .empty-state p {
      color: var(--n-50);
      margin: 0 0 16px 0;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    .large {
      width: 32px;
      height: 32px;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .search-box {
        min-width: 150px;
      }
      
      .header-actions {
        gap: 8px;
      }
      
      .node-actions {
        gap: 4px;
      }
      
      .last-modified {
        display: none;
      }
    }
  `]
})
export class EnhancedDocumentTreeComponent implements OnInit {
  public readonly treeService = inject(TreeService);
  private readonly nuxeoService = inject(NuxeoService);

  // Local component state
  private readonly _searchQuery = signal('');
  
  // Public signals
  public readonly searchQuery = this._searchQuery.asReadonly();
  public readonly selectedNode = this.treeService.selectedNode;

  // Computed properties
  public readonly displayNodes = computed(() => {
    const query = this.searchQuery();
    return query ? this.treeService.filteredNodes() : this.treeService.visibleNodes();
  });

  async ngOnInit() {
    // Initialize the tree with root documents
    await this.treeService.initializeTree('/');
  }

  // Search functionality
  public onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this._searchQuery.set(target.value);
    this.treeService.searchTree(target.value);
  }

  public clearSearch(): void {
    this._searchQuery.set('');
    this.treeService.searchTree('');
  }

  // Tree navigation
  public async toggleNode(node: TreeNode): Promise<void> {
    await this.treeService.toggleNode(node);
  }

  public selectNode(node: TreeNode): void {
    this.treeService.selectNode(node);
  }

  public onNodeClick(node: TreeNode): void {
    this.selectNode(node);
  }

  public onNodeKeydown(event: KeyboardEvent, node: TreeNode): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectNode(node);
        break;
      case 'ArrowRight':
        if (node.isFolder && !node.isExpanded) {
          event.preventDefault();
          this.toggleNode(node);
        }
        break;
      case 'ArrowLeft':
        if (node.isFolder && node.isExpanded) {
          event.preventDefault();
          this.toggleNode(node);
        }
        break;
    }
  }

  public async refreshTree(): Promise<void> {
    await this.treeService.refreshTree();
  }

  public getNodePath(node: TreeNode): TreeNode[] {
    return this.treeService.getNodePath(node);
  }

  public getNodeIndentation(node: TreeNode): number {
    return node.level * 24 + 8;
  }

  // Document display helpers
  public getDocumentIcon(node: TreeNode): string {
    if (node.isFolder) {
      if (node.isExpanded) {
        return 'folder_open';
      }
      return 'folder';
    }

    // Document type icons
    const iconMap: { [key: string]: string } = {
      'File': 'description',
      'Picture': 'image',
      'Video': 'videocam',
      'Audio': 'audiotrack',
      'Note': 'note',
      'Task': 'task',
      'Comment': 'comment',
      'Domain': 'domain',
      'Workspace': 'work',
      'WorkspaceRoot': 'workspaces'
    };

    return iconMap[node.type] || 'description';
  }

  public getDocumentIconColor(node: TreeNode): "primary" | "secondary" | "success" | "warning" | "error" | undefined {
    if (node.isFolder) {
      return 'primary';
    }

    // Color coding by document type
    const colorMap: { [key: string]: "primary" | "secondary" | "success" | "warning" | "error" } = {
      'Picture': 'success',
      'Video': 'warning',
      'Audio': 'warning',
      'Task': 'error'
    };

    return colorMap[node.type] || 'secondary';
  }

  public formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  public formatDateShort(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 30) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  public showContextMenu(event: Event, node: TreeNode): void {
    event.stopPropagation();
    // TODO: Implement context menu
    console.log('Context menu for node:', node.title);
  }
}