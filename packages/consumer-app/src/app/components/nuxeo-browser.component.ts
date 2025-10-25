import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// Import demo components for components not yet available in real packages
import { 
  SatButtonComponent, 
  SatCardComponent, 
  SatIconComponent
} from '../../lib/satori-demo';
import { NuxeoService } from '../../core/services/nuxeo.service';
import { NuxeoDocument } from '../../core/interfaces/nuxeo.interface';

@Component({
  selector: 'app-nuxeo-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, SatButtonComponent, SatCardComponent, SatIconComponent],
  template: `
    <div class="browser-container">
      <!-- Navigation Header -->
      <sat-card class="nav-header">
        <div class="breadcrumb">
          <sat-icon name="folder"></sat-icon>
          <span>{{ nuxeoService.currentFolderPath }}</span>
        </div>
        
        <div class="actions">
          <sat-button variant="outline" (clicked)="refreshDocuments()">
            <sat-icon name="refresh"></sat-icon>
            Refresh
          </sat-button>
          
          <sat-button variant="primary" (clicked)="showCreateDialog = true">
            <sat-icon name="add"></sat-icon>
            New Document
          </sat-button>
        </div>
      </sat-card>

      <!-- Search -->
      <sat-card class="search-section">
        <div class="search-input">
          <sat-icon name="search"></sat-icon>
          <input 
            type="text" 
            placeholder="Search documents..."
            [(ngModel)]="searchQuery"
            (keyup.enter)="search()">
          <sat-button variant="ghost" (clicked)="search()" [disabled]="!searchQuery">
            Search
          </sat-button>
        </div>
      </sat-card>

      <!-- Loading State -->
      @if (nuxeoService.isLoading()) {
        <sat-card class="loading">
          <sat-icon name="refresh" class="spinning"></sat-icon>
          <span>Loading documents...</span>
        </sat-card>
      }

      <!-- Document List -->
      <sat-card class="document-list" *ngIf="!nuxeoService.isLoading">
        <div class="list-header">
          <h3>Documents ({{ documents().length }})</h3>
        </div>
        
        @if (documents().length === 0) {
          <div class="empty-state">
            <sat-icon name="folder_open" [size]="32"></sat-icon>
            <p>No documents found</p>
          </div>
        } @else {
          <div class="document-grid">
            @for (doc of documents(); track doc.uid) {
              <div class="document-item" (click)="selectDocument(doc)">
                <div class="doc-icon">
                  <sat-icon [name]="getDocumentIcon(doc.type)"></sat-icon>
                </div>
                
                <div class="doc-info">
                  <h4>{{ doc.title || doc.path.split('/').pop() }}</h4>
                  <p class="doc-type">{{ doc.type }}</p>
                  <p class="doc-meta">
                    Modified: {{ formatDate(doc.modified) }} by {{ doc.author }}
                  </p>
                </div>
                
                <div class="doc-actions">
                  @if (doc.type === 'Folder') {
                    <sat-button variant="ghost" size="small" (clicked)="navigateToFolder(doc, $event)">
                      <sat-icon name="folder_open"></sat-icon>
                    </sat-button>
                  }
                  
                  <sat-button variant="ghost" size="small" (clicked)="editDocument(doc, $event)">
                    <sat-icon name="edit"></sat-icon>
                  </sat-button>
                  
                  <sat-button variant="ghost" size="small" (clicked)="deleteDocument(doc, $event)">
                    <sat-icon name="delete" color="error"></sat-icon>
                  </sat-button>
                </div>
              </div>
            }
          </div>
        }
      </sat-card>

      <!-- Create Document Dialog -->
      @if (showCreateDialog) {
        <div class="dialog-overlay" (click)="showCreateDialog = false">
          <sat-card class="create-dialog" (click)="$event.stopPropagation()">
            <h3>Create New Document</h3>
            
            <form (ngSubmit)="createDocument()">
              <div class="form-group">
                <label>Document Type:</label>
                <select [(ngModel)]="newDoc.type" name="type">
                  <option value="File">File</option>
                  <option value="Folder">Folder</option>
                  <option value="Note">Note</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Title:</label>
                <input type="text" [(ngModel)]="newDoc.title" name="title" required>
              </div>
              
              <div class="form-group">
                <label>Description:</label>
                <textarea [(ngModel)]="newDoc.description" name="description"></textarea>
              </div>
              
              <div class="dialog-actions">
                <sat-button type="button" variant="outline" (clicked)="showCreateDialog = false">
                  Cancel
                </sat-button>
                <sat-button type="submit" variant="primary">
                  Create
                </sat-button>
              </div>
            </form>
          </sat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .browser-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }
    
    .nav-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      
      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
      }
      
      .actions {
        display: flex;
        gap: 0.5rem;
      }
    }
    
    .search-section {
      padding: 1rem;
      
      .search-input {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        
        input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid var(--sat-border-color, #e0e0e0);
          border-radius: 4px;
        }
      }
    }
    
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
    }
    
    .document-list {
      padding: 1rem;
      
      .list-header {
        margin-bottom: 1rem;
        
        h3 {
          margin: 0;
          color: var(--sat-text-primary, #212121);
        }
      }
    }
    
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--sat-text-secondary, #757575);
    }
    
    .document-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }
    
    .document-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--sat-border-color, #e0e0e0);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      
      &:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        border-color: var(--sat-primary-color, #1976d2);
      }
      
      .doc-icon {
        flex-shrink: 0;
      }
      
      .doc-info {
        flex: 1;
        min-width: 0;
        
        h4 {
          margin: 0 0 0.25rem 0;
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .doc-type {
          margin: 0;
          font-size: 0.875rem;
          color: var(--sat-primary-color, #1976d2);
          font-weight: 500;
        }
        
        .doc-meta {
          margin: 0.25rem 0 0 0;
          font-size: 0.75rem;
          color: var(--sat-text-secondary, #757575);
        }
      }
      
      .doc-actions {
        display: flex;
        gap: 0.25rem;
        opacity: 0.7;
        
        &:hover {
          opacity: 1;
        }
      }
    }
    
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .create-dialog {
      width: 90%;
      max-width: 500px;
      padding: 2rem;
      
      h3 {
        margin: 0 0 1.5rem 0;
      }
      
      .form-group {
        margin-bottom: 1rem;
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        input, select, textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid var(--sat-border-color, #e0e0e0);
          border-radius: 4px;
        }
        
        textarea {
          min-height: 80px;
          resize: vertical;
        }
      }
      
      .dialog-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
        margin-top: 2rem;
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
export class NuxeoBrowserComponent implements OnInit {
  nuxeoService = inject(NuxeoService);
  
  documents = signal<NuxeoDocument[]>([]);
  searchQuery = '';
  showCreateDialog = false;
  
  newDoc = {
    type: 'File',
    title: '',
    description: ''
  };

  ngOnInit() {
    this.loadDocuments();
  }

  async loadDocuments() {
    const docs = await this.nuxeoService.getChildren();
    this.documents.set(docs);
  }

  async refreshDocuments() {
    await this.loadDocuments();
  }

  async search() {
    if (!this.searchQuery.trim()) return;
    
    const results = await this.nuxeoService.search(this.searchQuery);
    this.documents.set(results);
  }

  async navigateToFolder(doc: NuxeoDocument, event: Event) {
    event.stopPropagation();
    const docs = await this.nuxeoService.getChildren(doc.path);
    this.documents.set(docs);
  }

  selectDocument(doc: NuxeoDocument) {
    console.log('Selected document:', doc);
    // Implement document selection logic
  }

  editDocument(doc: NuxeoDocument, event: Event) {
    event.stopPropagation();
    console.log('Edit document:', doc);
    // Implement edit functionality
  }

  async deleteDocument(doc: NuxeoDocument, event: Event) {
    event.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      await this.nuxeoService.deleteDocument(doc.uid);
    }
  }

  async createDocument() {
    if (!this.newDoc.title.trim()) return;
    
    await this.nuxeoService.createDocument(
      this.nuxeoService.currentFolderPath, 
      this.newDoc
    );
    
    // Reset form
    this.newDoc = { type: 'File', title: '', description: '' };
    this.showCreateDialog = false;
  }

  getDocumentIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'Folder': 'folder',
      'File': 'description',
      'Note': 'note',
      'Picture': 'image',
      'Video': 'videocam',
      'Audio': 'audiotrack',
      'Domain': 'domain',
      'Workspace': 'work'
    };
    
    return iconMap[type] || 'description';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}