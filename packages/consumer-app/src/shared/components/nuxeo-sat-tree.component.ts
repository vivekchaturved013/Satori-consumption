import { 
  Component, 
  OnInit, 
  inject, 
  signal,
  computed,
  ChangeDetectionStrategy 
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { SatDocumentTreeComponent, DocumentNode } from './sat-document-tree.component';
import { NuxeoService } from '../../core/services/nuxeo.service';
import { LoggingService } from '../../core/services/logging.service';

@Component({
  selector: 'app-nuxeo-sat-tree',
  standalone: true,
  imports: [
    CommonModule,
    SatDocumentTreeComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sat-document-tree
      [dataSource]="treeData()"
      [title]="'Nuxeo Documents (sat-tree)'"
      [loading]="isLoading()"
      [showRefresh]="true"
      (nodeClick)="onNodeClick($event)"
      (refresh)="loadDocuments()">
    </sat-document-tree>
    
    @if (selectedNode()) {
      <div class="selected-node-info">
        <h4>Selected: {{ selectedNode()!.title || selectedNode()!.name }}</h4>
        <p><strong>Type:</strong> {{ selectedNode()!.type }}</p>
        <p><strong>Path:</strong> {{ selectedNode()!.path }}</p>
        <p><strong>UID:</strong> {{ selectedNode()!.uid }}</p>
        @if (selectedNode()!.lastModified) {
          <p><strong>Modified:</strong> {{ formatFullDate(selectedNode()!.lastModified) }}</p>
        }
      </div>
    }
  `,
  styles: [`
    .selected-node-info {
      margin-top: 16px;
      padding: 16px;
      background: var(--n-96);
      border-radius: 8px;
      border-left: 4px solid var(--p-40);
    }

    .selected-node-info h4 {
      margin: 0 0 12px 0;
      color: var(--p-40);
      font-size: 16px;
      font-weight: 500;
    }

    .selected-node-info p {
      margin: 4px 0;
      font-size: 14px;
      color: var(--n-30);
    }

    .selected-node-info strong {
      color: var(--n-10);
    }
  `]
})
export class NuxeoSatTreeComponent implements OnInit {
  private nuxeoService = inject(NuxeoService);
  private logger = inject(LoggingService);

  // Component state
  private readonly _treeData = signal<DocumentNode[]>([]);
  private readonly _isLoading = signal<boolean>(false);
  private readonly _selectedNode = signal<DocumentNode | null>(null);
  private readonly _error = signal<string>('');

  // Public readonly signals
  public readonly treeData = this._treeData.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly selectedNode = this._selectedNode.asReadonly();
  public readonly error = this._error.asReadonly();

  async ngOnInit() {
    await this.loadDocuments();
  }

  public async loadDocuments(): Promise<void> {
    try {
      this._isLoading.set(true);
      this._error.set('');

      this.logger.info('NuxeoSatTreeComponent', 'Loading documents for sat-tree');

      // Get documents from the search API (which returns hierarchical data)
      const result = await this.nuxeoService.testSimpleSearchCall();
      
      if (result && result.entries) {
        const treeNodes = this.convertToTreeNodes(result.entries);
        this._treeData.set(treeNodes);
        
        this.logger.info('NuxeoSatTreeComponent', 'Documents loaded successfully', { 
          count: result.entries.length,
          treeNodes: treeNodes.length 
        });
      } else {
        this._treeData.set([]);
        this.logger.warn('NuxeoSatTreeComponent', 'No documents found in response');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load documents';
      this._error.set(errorMessage);
      this._treeData.set([]);
      this.logger.error('NuxeoSatTreeComponent', 'Failed to load documents', error);
    } finally {
      this._isLoading.set(false);
    }
  }

  public onNodeClick(node: DocumentNode): void {
    this._selectedNode.set(node);
    this.logger.info('NuxeoSatTreeComponent', 'Node selected', { 
      uid: node.uid, 
      title: node.title || node.name,
      type: node.type 
    });
  }

  private convertToTreeNodes(documents: any[]): DocumentNode[] {
    // Group documents by their parent path to build hierarchy
    const nodeMap = new Map<string, DocumentNode>();
    const rootNodes: DocumentNode[] = [];

    // First pass: Create all nodes
    documents.forEach(doc => {
      const node: DocumentNode = {
        uid: doc.uid,
        name: doc.title || doc.name || 'Untitled',
        title: doc.title || doc.name || 'Untitled',
        type: doc.type,
        path: doc.path,
        lastModified: doc.lastModified || doc.modified || new Date().toISOString(),
        isFolder: this.isFolder(doc),
        children: [],
        facets: doc.facets,
        state: doc.state
      };
      nodeMap.set(doc.path, node);
    });

    // Second pass: Build hierarchy
    documents.forEach(doc => {
      const node = nodeMap.get(doc.path);
      if (!node) return;

      // Find parent by path
      const parentPath = this.getParentPath(doc.path);
      const parent = nodeMap.get(parentPath);

      if (parent && parent !== node) {
        // Add to parent's children
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        // This is a root node
        rootNodes.push(node);
      }
    });

    // Sort nodes by type (folders first) and then by name
    this.sortNodes(rootNodes);

    return rootNodes;
  }

  private isFolder(doc: any): boolean {
    const folderTypes = ['Domain', 'Workspace', 'WorkspaceRoot', 'Folder', 'TemplateRoot', 'SectionRoot', 'TaskRoot', 'UserWorkspacesRoot'];
    return doc.facets?.includes('Folderish') || folderTypes.includes(doc.type);
  }

  private getParentPath(path: string): string {
    const segments = path.split('/').filter(segment => segment.length > 0);
    if (segments.length <= 1) return '/';
    return '/' + segments.slice(0, -1).join('/');
  }

  private sortNodes(nodes: DocumentNode[]): void {
    nodes.sort((a, b) => {
      // Folders first
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      
      // Then alphabetically by name
      return (a.title || a.name).localeCompare(b.title || b.name);
    });

    // Recursively sort children
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        this.sortNodes(node.children);
      }
    });
  }

  public formatFullDate(dateString: string): string {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}