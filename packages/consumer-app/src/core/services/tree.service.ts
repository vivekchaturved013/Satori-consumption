import { Injectable, signal, computed, inject } from '@angular/core';
import { NuxeoService } from './nuxeo.service';
import { LoggingService } from './logging.service';

export interface TreeNode {
  id: string;
  title: string;
  type: string;
  path: string;
  lastModified: string;
  isFolder: boolean;
  level: number;
  isExpanded: boolean;
  isLoading: boolean;
  hasChildren: boolean;
  children: TreeNode[];
  parent?: TreeNode;
  uid: string;
  facets?: string[];
  state?: string;
}

export interface TreeState {
  rootNodes: TreeNode[];
  expandedNodes: Set<string>;
  selectedNode?: TreeNode;
  searchQuery: string;
  isLoading: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  private nuxeoService = inject(NuxeoService);
  private logger = inject(LoggingService);

  // Internal state signals
  private _treeState = signal<TreeState>({
    rootNodes: [],
    expandedNodes: new Set<string>(),
    searchQuery: '',
    isLoading: false
  });

  // Public readonly signals
  public readonly treeState = this._treeState.asReadonly();
  public readonly rootNodes = computed(() => this._treeState().rootNodes);
  public readonly expandedNodes = computed(() => this._treeState().expandedNodes);
  public readonly selectedNode = computed(() => this._treeState().selectedNode);
  public readonly isLoading = computed(() => this._treeState().isLoading);
  public readonly error = computed(() => this._treeState().error);

  // Computed visible nodes (flattened tree for display)
  public readonly visibleNodes = computed(() => {
    return this.flattenVisibleNodes(this.rootNodes());
  });

  // Computed filtered nodes (for search)
  public readonly filteredNodes = computed(() => {
    const query = this._treeState().searchQuery.toLowerCase();
    if (!query) return this.visibleNodes();
    
    return this.visibleNodes().filter(node => 
      node.title.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query)
    );
  });

  /**
   * Initialize the tree with root documents
   */
  public async initializeTree(rootPath: string = '/'): Promise<void> {
    try {
      this._treeState.update(state => ({ ...state, isLoading: true, error: undefined }));
      
      this.logger.info('TreeService', 'Initializing tree', { rootPath });
      
      // Get root documents from Nuxeo
      const documents = await this.nuxeoService.getChildren(rootPath);
      
      // Convert to tree nodes
      const rootNodes = documents.map((doc: any) => this.documentToTreeNode(doc, null, 0));
      
      // Determine which nodes have children
      await this.checkForChildren(rootNodes);
      
      this._treeState.update(state => ({
        ...state,
        rootNodes,
        isLoading: false
      }));
      
      this.logger.info('TreeService', 'Tree initialized', { nodeCount: rootNodes.length });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize tree';
      this._treeState.update(state => ({
        ...state,
        isLoading: false,
        error: errorMessage
      }));
      this.logger.error('TreeService', 'Tree initialization failed', error);
    }
  }

  /**
   * Toggle a node's expanded state
   */
  public async toggleNode(node: TreeNode): Promise<void> {
    if (!node.isFolder) return;

    const isCurrentlyExpanded = this._treeState().expandedNodes.has(node.id);

    if (isCurrentlyExpanded) {
      // Collapse the node
      this.collapseNode(node);
    } else {
      // Expand the node (lazy load children if needed)
      await this.expandNode(node);
    }
  }

  /**
   * Expand a node and load its children if needed
   */
  public async expandNode(node: TreeNode): Promise<void> {
    try {
      // Mark node as loading
      this.updateNodeInTree(node.id, { isLoading: true });

      // Add to expanded set
      this._treeState.update(state => ({
        ...state,
        expandedNodes: new Set([...state.expandedNodes, node.id])
      }));

      // Load children if not already loaded
      if (node.children.length === 0 && node.hasChildren) {
        await this.loadNodeChildren(node);
      }

      // Update expanded state
      this.updateNodeInTree(node.id, { 
        isExpanded: true, 
        isLoading: false 
      });

      this.logger.info('TreeService', 'Node expanded', { nodeId: node.id, childCount: node.children.length });

    } catch (error) {
      this.updateNodeInTree(node.id, { isLoading: false });
      this.logger.error('TreeService', 'Failed to expand node', { nodeId: node.id, error });
    }
  }

  /**
   * Collapse a node
   */
  public collapseNode(node: TreeNode): void {
    // Remove from expanded set
    const expandedNodes = new Set(this._treeState().expandedNodes);
    expandedNodes.delete(node.id);

    this._treeState.update(state => ({
      ...state,
      expandedNodes
    }));

    // Update node state
    this.updateNodeInTree(node.id, { isExpanded: false });

    // Also collapse all descendant nodes
    this.collapseDescendants(node);

    this.logger.info('TreeService', 'Node collapsed', { nodeId: node.id });
  }

  /**
   * Select a node
   */
  public selectNode(node: TreeNode): void {
    this._treeState.update(state => ({
      ...state,
      selectedNode: node
    }));

    this.logger.info('TreeService', 'Node selected', { nodeId: node.id, title: node.title });
  }

  /**
   * Search within the tree
   */
  public searchTree(query: string): void {
    this._treeState.update(state => ({
      ...state,
      searchQuery: query
    }));

    this.logger.info('TreeService', 'Tree search', { query, resultCount: this.filteredNodes().length });
  }

  /**
   * Refresh the entire tree
   */
  public async refreshTree(): Promise<void> {
    // Clear current state
    this._treeState.update(state => ({
      ...state,
      rootNodes: [],
      expandedNodes: new Set(),
      selectedNode: undefined
    }));

    // Reinitialize
    await this.initializeTree();
  }

  /**
   * Get the path to a node (breadcrumb)
   */
  public getNodePath(node: TreeNode): TreeNode[] {
    const path: TreeNode[] = [];
    let current: TreeNode | undefined = node;

    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  }

  // Private helper methods

  private documentToTreeNode(doc: any, parent: TreeNode | null, level: number): TreeNode {
    const isFolder = doc.facets?.includes('Folderish') || 
                    ['Domain', 'Workspace', 'Folder', 'WorkspaceRoot'].includes(doc.type);

    return {
      id: doc.uid,
      uid: doc.uid,
      title: doc.title || doc.name || 'Untitled',
      type: doc.type,
      path: doc.path,
      lastModified: doc.lastModified || doc.modified || new Date().toISOString(),
      isFolder,
      level,
      isExpanded: false,
      isLoading: false,
      hasChildren: isFolder, // We'll check this properly later
      children: [],
      parent: parent || undefined,
      facets: doc.facets,
      state: doc.state
    };
  }

  private async checkForChildren(nodes: TreeNode[]): Promise<void> {
    for (const node of nodes) {
      if (node.isFolder) {
        try {
          const children = await this.nuxeoService.getChildren(node.path);
          node.hasChildren = children.length > 0;
        } catch (error) {
          node.hasChildren = false;
          this.logger.warn('TreeService', 'Could not check children', { nodeId: node.id, error });
        }
      }
    }
  }

  private async loadNodeChildren(node: TreeNode): Promise<void> {
    try {
      const documents = await this.nuxeoService.getChildren(node.path);
      const children = documents.map((doc: any) => this.documentToTreeNode(doc, node, node.level + 1));
      
      // Check if children have their own children
      await this.checkForChildren(children);
      
      // Update the node with its children
      this.updateNodeInTree(node.id, { children });

    } catch (error) {
      this.logger.error('TreeService', 'Failed to load node children', { nodeId: node.id, error });
      throw error;
    }
  }

  private updateNodeInTree(nodeId: string, updates: Partial<TreeNode>): void {
    this._treeState.update(state => ({
      ...state,
      rootNodes: this.updateNodeInNodes(state.rootNodes, nodeId, updates)
    }));
  }

  private updateNodeInNodes(nodes: TreeNode[], nodeId: string, updates: Partial<TreeNode>): TreeNode[] {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      if (node.children.length > 0) {
        return {
          ...node,
          children: this.updateNodeInNodes(node.children, nodeId, updates)
        };
      }
      return node;
    });
  }

  private flattenVisibleNodes(nodes: TreeNode[]): TreeNode[] {
    const result: TreeNode[] = [];

    for (const node of nodes) {
      result.push(node);
      
      if (node.isExpanded && node.children.length > 0) {
        result.push(...this.flattenVisibleNodes(node.children));
      }
    }

    return result;
  }

  private collapseDescendants(node: TreeNode): void {
    const expandedNodes = new Set(this._treeState().expandedNodes);

    const collapseRecursive = (n: TreeNode) => {
      expandedNodes.delete(n.id);
      this.updateNodeInTree(n.id, { isExpanded: false });
      
      for (const child of n.children) {
        collapseRecursive(child);
      }
    };

    for (const child of node.children) {
      collapseRecursive(child);
    }

    this._treeState.update(state => ({
      ...state,
      expandedNodes
    }));
  }
}