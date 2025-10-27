import { Component, Input, Output, EventEmitter, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  type?: 'text' | 'number' | 'date' | 'custom';
}

export interface TableRow {
  [key: string]: any;
}

export type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule, SatIconModule],
  template: `
    <div class="ui-table-container">
      @if (title || searchable) {
        <div class="ui-table-header">
          @if (title) {
            <h3 class="ui-table-title">{{ title }}</h3>
          }
          @if (searchable) {
            <div class="ui-table-search">
              <input
                type="text"
                placeholder="Search..."
                [value]="searchTerm()"
                (input)="onSearch($event)"
                class="ui-table-search-input"
              />
              <span class="ui-table-search-icon">🔍</span>
            </div>
          }
        </div>
      }
      
      <div class="ui-table-wrapper" [class.ui-table-loading]="loading">
        @if (loading) {
          <div class="ui-table-loading-overlay">
            <div class="ui-table-spinner"></div>
            <span>Loading...</span>
          </div>
        }
        
        <table class="ui-table">
          <thead>
            <tr>
              @for (column of columns; track column.key) {
                <th 
                  [class]="getHeaderClasses(column)"
                  [style.width]="column.width"
                  (click)="onSort(column)">
                  <div class="ui-table-header-content">
                    <span>{{ column.label }}</span>
                    @if (column.sortable) {
                      <span class="ui-table-sort-icon">
                        {{ getSortIcon(column.key) }}
                      </span>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @if (filteredData().length === 0) {
              <tr>
                <td [colSpan]="columns.length" class="ui-table-empty">
                  {{ emptyMessage }}
                </td>
              </tr>
            } @else {
              @for (row of paginatedData(); track trackByFn($index, row)) {
                <tr 
                  class="ui-table-row"
                  [class.ui-table-row--clickable]="rowClickable"
                  (click)="onRowClick(row)">
                  @for (column of columns; track column.key) {
                    <td [class]="getCellClasses(column)">
                      @if (column.type === 'custom') {
                        <ng-content 
                          [select]="'[slot=cell-' + column.key + ']'"
                          [ngTemplateOutlet]="cellTemplate"
                          [ngTemplateOutletContext]="{ $implicit: row, column: column }">
                        </ng-content>
                      } @else {
                        {{ getCellValue(row, column) }}
                      }
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
      
      @if (pagination && totalPages() > 1) {
        <div class="ui-table-pagination">
          <div class="ui-table-pagination-info">
            {{ getPaginationInfo() }}
          </div>
          <div class="ui-table-pagination-controls">
            <button 
              class="ui-table-pagination-btn"
              [disabled]="currentPage() === 1"
              (click)="goToPage(1)">
              <span>⏮</span>
            </button>
            <button 
              class="ui-table-pagination-btn"
              [disabled]="currentPage() === 1"
              (click)="goToPage(currentPage() - 1)">
              <span>‹</span>
            </button>
            
            @for (page of getVisiblePages(); track page) {
              <button 
                class="ui-table-pagination-btn"
                [class.ui-table-pagination-btn--active]="page === currentPage()"
                (click)="goToPage(page)">
                {{ page }}
              </button>
            }
            
            <button 
              class="ui-table-pagination-btn"
              [disabled]="currentPage() === totalPages()"
              (click)="goToPage(currentPage() + 1)">
              <span>›</span>
            </button>
            <button 
              class="ui-table-pagination-btn"
              [disabled]="currentPage() === totalPages()"
              (click)="goToPage(totalPages())">
              <span>⏭</span>
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./ui-table.component.scss']
})
export class UiTableComponent {
  @Input() title: string = '';
  @Input() columns: TableColumn[] = [];
  @Input() data: TableRow[] = [];
  @Input() loading: boolean = false;
  @Input() searchable: boolean = false;
  @Input() pagination: boolean = false;
  @Input() pageSize: number = 10;
  @Input() emptyMessage: string = 'No data available';
  @Input() rowClickable: boolean = false;
  
  @Output() rowClick = new EventEmitter<TableRow>();
  @Output() sort = new EventEmitter<{ column: string; direction: SortDirection }>();
  
  // Internal state
  searchTerm = signal('');
  currentPage = signal(1);
  sortColumn = signal<string>('');
  sortDirection = signal<SortDirection>(null);
  
  // Computed values
  filteredData = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.data;
    
    return this.data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(term)
      )
    );
  });
  
  sortedData = computed(() => {
    const data = this.filteredData();
    const column = this.sortColumn();
    const direction = this.sortDirection();
    
    if (!column || !direction) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  });
  
  totalPages = computed(() => {
    if (!this.pagination) return 1;
    return Math.ceil(this.filteredData().length / this.pageSize);
  });
  
  paginatedData = computed(() => {
    const data = this.sortedData();
    if (!this.pagination) return data;
    
    const start = (this.currentPage() - 1) * this.pageSize;
    return data.slice(start, start + this.pageSize);
  });
  
  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm.set(target.value);
    this.currentPage.set(1); // Reset to first page
  }
  
  onSort(column: TableColumn): void {
    if (!column.sortable) return;
    
    const currentColumn = this.sortColumn();
    const currentDirection = this.sortDirection();
    
    if (currentColumn === column.key) {
      // Toggle direction
      if (currentDirection === 'asc') {
        this.sortDirection.set('desc');
      } else if (currentDirection === 'desc') {
        this.sortDirection.set(null);
        this.sortColumn.set('');
      } else {
        this.sortDirection.set('asc');
      }
    } else {
      // New column
      this.sortColumn.set(column.key);
      this.sortDirection.set('asc');
    }
    
    this.sort.emit({
      column: this.sortColumn(),
      direction: this.sortDirection()
    });
  }
  
  onRowClick(row: TableRow): void {
    if (this.rowClickable) {
      this.rowClick.emit(row);
    }
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }
  
  getHeaderClasses(column: TableColumn): string {
    return [
      'ui-table-header-cell',
      `ui-table-align--${column.align || 'left'}`,
      column.sortable ? 'ui-table-header-cell--sortable' : '',
      this.sortColumn() === column.key ? 'ui-table-header-cell--sorted' : ''
    ].filter(Boolean).join(' ');
  }
  
  getCellClasses(column: TableColumn): string {
    return [
      'ui-table-cell',
      `ui-table-align--${column.align || 'left'}`
    ].filter(Boolean).join(' ');
  }
  
  getSortIcon(columnKey: string): string {
    if (this.sortColumn() !== columnKey) return '↕';
    
    const direction = this.sortDirection();
    if (direction === 'asc') return '↑';
    if (direction === 'desc') return '↓';
    return '↕';
  }
  
  getCellValue(row: TableRow, column: TableColumn): string {
    const value = row[column.key];
    
    switch (column.type) {
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '';
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : String(value);
      default:
        return String(value || '');
    }
  }
  
  getPaginationInfo(): string {
    const start = (this.currentPage() - 1) * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, this.filteredData().length);
    const total = this.filteredData().length;
    
    return `${start}-${end} of ${total} items`;
  }
  
  getVisiblePages(): number[] {
    const current = this.currentPage();
    const total = this.totalPages();
    const pages: number[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (current >= total - 3) {
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        for (let i = current - 2; i <= current + 2; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  }
  
  trackByFn(index: number, item: TableRow): any {
    return item['id'] || index;
  }
}