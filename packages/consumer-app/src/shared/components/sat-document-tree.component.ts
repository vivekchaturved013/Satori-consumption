import { ChangeDetectionStrategy, Component, input, signal, computed, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTreeModule } from '@angular/material/tree';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';
import { SatButtonComponent, SatCardComponent, SatIconComponent } from '../../lib/satori-demo';

export interface DocumentNode {
  uid: string;
  name: string;
  title: string;
  type: string;
  path: string;
  lastModified: string;
  isFolder: boolean;
  children?: DocumentNode[];
  facets?: string[];
  state?: string;
}

@Component({
  selector: 'sat-document-tree',
  standalone: true,
  template: `
    <sat-card variant="elevated" class="sat-tree-container">
      <div class="tree-header">
        <div class="header-content">
          <sat-icon name="account_tree" color="primary" [size]="20"></sat-icon>
          <h3>{{ title() }}</h3>
        </div>
        @if (showRefresh()) {
          <sat-button 
            variant="ghost" 
            size="small"
            [disabled]="loading()"
            (clicked)="onRefresh()">
            @if (loading()) {
              <sat-icon name="refresh" class="spinning" [size]="16"></sat-icon>
            } @else {
              <sat-icon name="refresh" [size]="16"></sat-icon>
            }
          </sat-button>
        }
      </div>

      @if (dataSource().length > 0) {
        <mat-tree 
          #tree 
          [dataSource]="dataSource()" 
          [childrenAccessor]="childrenAccessor" 
          class="satori-document-tree">
          
          <!-- Leaf node template (documents without children) -->
          <mat-tree-node *matTreeNodeDef="let node" class="tree-node document-node">
            <div class="node-content">
              <div class="node-spacer"></div>
              <div class="node-info" (click)="onNodeClick(node)">
                <span class="node-title">{{ node.title || node.name }}</span>
              </div>
            </div>
          </mat-tree-node>

          <!-- Expandable node template (folders with children) -->
          <mat-nested-tree-node
              matTreeNodeToggle
              *matTreeNodeDef="let node; when: hasChild"
              [cdkTreeNodeTypeaheadLabel]="node.title || node.name"
              class="tree-node folder-node">
            
            <div class="node-content">
              <sat-button 
                variant="ghost" 
                size="small"
                matTreeNodeToggle 
                class="expand-button"
                [attr.aria-label]="'Toggle ' + (node.title || node.name)">
                @if (tree.isExpanded(node)) {
                  <span class="expand-arrow">▼</span>
                } @else {
                  <span class="expand-arrow">▶</span>
                }
              </sat-button>
              
              <div class="node-info" (click)="onNodeClick(node)">
                <span class="node-title">{{ node.title || node.name }}</span>
              </div>
            </div>

            <div 
              [class.tree-invisible]="!tree.isExpanded(node)" 
              role="group"
              class="node-children">
              <ng-container matTreeNodeOutlet></ng-container>
            </div>
          </mat-nested-tree-node>
        </mat-tree>
      } @else if (loading()) {
        <div class="tree-loading">
          <sat-icon name="refresh" class="spinning" [size]="24"></sat-icon>
          <p>Loading documents...</p>
        </div>
      } @else {
        <div class="tree-empty">
          <sat-icon name="folder_open" [size]="32" color="secondary"></sat-icon>
          <p>No documents found</p>
        </div>
      }
    </sat-card>
  `,
  styles: [`
    .sat-tree-container {
      max-height: 500px;
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

    .header-content {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-content h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: var(--n-10);
    }

    .satori-document-tree {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }

    .tree-node {
      min-height: 28px;
      margin-bottom: 1px;
    }

    .node-content {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 2px 6px;
      border-radius: 4px;
      transition: background-color 0.15s ease;
      cursor: pointer;
    }

    .node-content:hover {
      background-color: var(--n-96);
    }

    .document-node .node-content:hover {
      background-color: var(--p-95);
    }

    .folder-node .node-content:hover {
      background-color: var(--t-95);
    }

    .expand-button {
      width: 20px !important;
      height: 20px !important;
      min-width: 20px !important;
      padding: 0 !important;
      flex-shrink: 0;
      opacity: 0.6;
      border-radius: 2px !important;
    }

    .expand-button:hover {
      opacity: 1;
      background-color: var(--n-90) !important;
    }

    .expand-button .expand-arrow {
      font-size: 12px;
      color: var(--n-50);
      transition: color 0.2s ease;
    }

    .expand-button:hover .expand-arrow {
      color: var(--n-10);
    }

    .node-spacer {
      width: 20px;
      flex-shrink: 0;
    }

    .node-info {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
    }

    .node-title {
      font-weight: 400;
      color: var(--n-10);
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
    }

    .node-children {
      margin-left: 20px;
    }

    .tree-invisible {
      display: none;
    }

    .tree-loading,
    .tree-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      text-align: center;
    }

    .tree-loading p,
    .tree-empty p {
      margin: 12px 0 0 0;
      color: var(--n-50);
      font-size: 14px;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Material Tree overrides for Satori styling */
    .satori-document-tree .mat-tree {
      background: transparent;
    }

    .satori-document-tree .mat-tree-node,
    .satori-document-tree .mat-nested-tree-node {
      color: var(--n-10);
      font-family: 'Noto Sans', sans-serif;
    }

    .satori-document-tree .mat-tree-node:focus,
    .satori-document-tree .mat-nested-tree-node:focus {
      outline: 2px solid var(--p-40);
      outline-offset: 2px;
      border-radius: 4px;
    }

    /* Clean tree styling */
    .satori-document-tree {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  `],
  imports: [
    CommonModule,
    MatTreeModule, 
    MatButtonModule, 
    MatIconModule, 
    SatIconModule,
    SatButtonComponent,
    SatCardComponent,
    SatIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SatDocumentTreeComponent {
  // Inputs
  readonly dataSource = input<DocumentNode[]>([]);
  readonly title = input<string>('Document Tree');
  readonly loading = input<boolean>(false);
  readonly showRefresh = input<boolean>(true);

  // Outputs
  @Output() nodeClick = new EventEmitter<DocumentNode>();
  @Output() refresh = new EventEmitter<void>();

  // Tree configuration
  childrenAccessor = (node: DocumentNode) => node.children ?? [];
  hasChild = (_: number, node: DocumentNode) => {
    // Show expand button for all folders, even if children aren't loaded yet
    return node.isFolder;
  };

  // Event handlers
  onNodeClick(node: DocumentNode): void {
    this.nodeClick.emit(node);
  }

  onRefresh(): void {
    this.refresh.emit();
  }

  // Document display helpers
  getDocumentIcon(node: DocumentNode): string {
    // Use proper folder icons based on type and state
    if (node.isFolder) {
      // Special domain/workspace icons
      if (node.type === 'Domain') return 'domain';
      if (node.type === 'WorkspaceRoot') return 'workspaces';
      if (node.type === 'UserWorkspacesRoot') return 'person';
      if (node.type === 'Workspace') return 'work';
      if (node.type === 'SectionRoot') return 'folder_special';
      if (node.type === 'TemplateRoot') return 'folder_copy';
      if (node.type === 'TaskRoot') return 'task_alt';
      
      // Default folder icon
      return 'folder';
    }

    // Document type icons - keep simple
    const iconMap: { [key: string]: string } = {
      'File': 'insert_drive_file',
      'Picture': 'image',
      'Video': 'movie',
      'Audio': 'audiotrack',
      'Note': 'note',
      'Task': 'task',
      'AdministrativeStatus': 'settings'
    };

    return iconMap[node.type] || 'insert_drive_file';
  }

  getDocumentColor(node: DocumentNode): "primary" | "secondary" | "success" | "warning" | "error" | undefined {
    // Special coloring for certain types
    if (node.type === 'Domain') return 'primary';
    if (node.type === 'WorkspaceRoot' || node.type === 'Workspace') return 'primary';
    if (node.type === 'UserWorkspacesRoot') return 'secondary';
    if (node.type === 'Task' || node.type === 'TaskRoot') return 'warning';
    if (node.type === 'AdministrativeStatus') return 'error';
    
    // Default colors - more subtle
    if (node.isFolder) {
      return 'secondary';
    }

    return undefined; // Let it use default icon color
  }

  formatDate(dateString: string): string {
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
}