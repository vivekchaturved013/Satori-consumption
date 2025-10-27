import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import available Satori components
import { SatBreadcrumbsModule, SatBreadcrumbsItem } from '@hylandsoftware/satori-ui/breadcrumbs';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { SatRichTooltipModule } from '@hylandsoftware/satori-ui/rich-tooltip';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';

// Import our custom UI components
import { UiButtonComponent } from '../../lib/ui-components/button/ui-button.component';
import { UiCardComponent } from '../../lib/ui-components/card/ui-card.component';
import { UiTableComponent, type TableColumn } from '../../lib/ui-components/table/ui-table.component';
import { SatAutocompleteComponent, type SatAutocompleteOption } from '../../lib/ui-components/autocomplete/sat-autocomplete.component';

@Component({
  selector: 'app-enhanced-dashboard-example',
  standalone: true,
  imports: [
    CommonModule,
    SatBreadcrumbsModule,
    SatAvatarModule,
    SatTagModule,
    SatRichTooltipModule,
    SatIconModule,
    // Custom UI Components
    UiButtonComponent,
    UiCardComponent,
    UiTableComponent,
    SatAutocompleteComponent
  ],
  template: `
    <div class="enhanced-dashboard">
      <!-- Breadcrumbs Navigation -->
      <sat-breadcrumbs [items]="breadcrumbItems"></sat-breadcrumbs>
      
      <!-- User Info Section -->
      <ui-card 
        title="Welcome back, {{ userName }}!" 
        subtitle="Dashboard Overview"
        icon="person"
        variant="elevated"
        [hoverable]="true">
        
        <div class="user-info-content">
          <sat-avatar 
            [username]="userName"
            [size]="'80'" 
            [category]="'blue'"
            [indicator]="'active'">
            {{ userInitials }}
          </sat-avatar>
          <div class="user-details">
            <sat-status-tag [status]="'success'">Active</sat-status-tag>
            <p>Last login: Today at 9:24 AM</p>
          </div>
        </div>
      </ui-card>

      <!-- Document Stats with Custom Cards -->
      <div class="stats-grid">
        <ui-card 
          title="{{ totalDocuments }}" 
          subtitle="Total Documents"
          icon="folder"
          variant="outlined"
          [hoverable]="true">
          <sat-category-tag [category]="'blue'">Updated</sat-category-tag>
          <div slot="footer">
            <ui-button size="small" variant="ghost" iconRight="arrow_forward">
              View All
            </ui-button>
          </div>
        </ui-card>
        
        <ui-card 
          title="{{ favoriteDocuments }}" 
          subtitle="Favorites"
          icon="star"
          variant="outlined"
          [hoverable]="true">
          <sat-category-tag [category]="'green'">Personal</sat-category-tag>
          <div slot="footer">
            <ui-button size="small" variant="ghost" iconRight="arrow_forward">
              View All
            </ui-button>
          </div>
        </ui-card>
        
        <ui-card 
          title="{{ recentDocuments }}" 
          subtitle="Recent Items"
          icon="schedule"
          variant="outlined"
          [hoverable]="true">
          <sat-status-tag [status]="'warning'">Pending Review</sat-status-tag>
          <div slot="footer">
            <ui-button size="small" variant="ghost" iconRight="arrow_forward">
              View All
            </ui-button>
          </div>
        </ui-card>
      </div>

      <!-- Document List with Custom Table -->
      <ui-card 
        title="Recent Documents" 
        subtitle="Your latest document activity"
        icon="description"
        [headerActions]="true">
        
        <div slot="header-actions">
          <sat-autocomplete
            [dropdownOptions]="filterOptions"
            placeholder="Filter by type..."
            (optionSelected)="onFilterSelected($event)">
          </sat-autocomplete>
        </div>

        <ui-table
          [columns]="documentColumns"
          [data]="documents"
          [searchable]="true"
          [pagination]="true"
          [pageSize]="5"
          [rowClickable]="true"
          (rowClick)="openDocument($event)">
        </ui-table>

        <div slot="footer">
          <ui-button variant="outline" size="small" iconLeft="add">
            Upload Document
          </ui-button>
          <ui-button variant="primary" size="small" iconRight="folder_open">
            Browse All
          </ui-button>
        </div>
      </ui-card>

      <!-- Team Members Section -->
      <ui-card 
        title="Team Members" 
        subtitle="Your active team collaboration"
        icon="group"
        [headerActions]="true">
        
        <div slot="header-actions">
          <ui-button size="small" variant="outline" iconLeft="person_add">
            Add Member
          </ui-button>
        </div>

        <div class="team-avatars">
          <div class="team-member" *ngFor="let member of teamMembers">
            <sat-avatar 
              [username]="member.name"
              [size]="'36'" 
              [category]="'teal'"
              [indicator]="getAvatarIndicator(member.status)">
              {{ member.initials }}
            </sat-avatar>
            <span class="member-name">{{ member.name }}</span>
            <sat-status-tag [status]="getStatusTag(member.status)">
              {{ getStatusText(member.status) }}
            </sat-status-tag>
          </div>
          

        </div>

        <div slot="footer">
          <ui-button variant="primary" size="small" iconRight="arrow_forward">
            View All Team Members
          </ui-button>
        </div>
      </ui-card>
    </div>
  `,
  styleUrls: ['./enhanced-dashboard-example.component.scss']
})
export class EnhancedDashboardExampleComponent {
  userName = 'Vivek Chaturvedi';
  userInitials = 'VC';
  
  breadcrumbItems: SatBreadcrumbsItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Nuxeo ECM', href: '/nuxeo' },
    { label: 'Dashboard' }
  ];

  totalDocuments = 1247;
  favoriteDocuments = 23;
  recentDocuments = 8;

  // Filter options for autocomplete
  filterOptions: SatAutocompleteOption[] = [
    { name: 'All Documents' },
    { name: 'Word Documents' },
    { name: 'PDF Files' },
    { name: 'Spreadsheets' },
    { name: 'Presentations' }
  ];

  // Table configuration for documents
  documentColumns: TableColumn[] = [
    { key: 'icon', label: '', width: '40px', type: 'custom' },
    { key: 'name', label: 'Document Name', sortable: true },
    { key: 'author', label: 'Author', sortable: true },
    { key: 'lastModified', label: 'Modified', type: 'date', sortable: true },
    { key: 'size', label: 'Size', sortable: true, align: 'right' },
    { key: 'statusText', label: 'Status', sortable: true }
  ];

  documents = [
    {
      name: 'Project Requirements.docx',
      type: 'Word Document',
      size: '2.3 MB',
      author: 'John Smith',
      authorInitials: 'JS',
      lastModified: new Date('2025-10-24'),
      icon: 'document',
      status: 'success' as const,
      statusText: 'Approved'
    },
    {
      name: 'Architecture Diagram.pdf',
      type: 'PDF Document', 
      size: '5.1 MB',
      author: 'Sarah Johnson',
      authorInitials: 'SJ',
      lastModified: new Date('2025-10-23'),
      icon: 'file',
      status: 'warning' as const,
      statusText: 'Under Review'
    },
    {
      name: 'Meeting Notes.txt',
      type: 'Text File',
      size: '15 KB',
      author: 'Mike Davis',
      authorInitials: 'MD',
      lastModified: new Date('2025-10-22'),
      icon: 'note',
      status: 'error' as const,
      statusText: 'Needs Update'
    }
  ];

  teamMembers = [
    { initials: 'JS', name: 'John Smith', status: 'online' as const },
    { initials: 'SJ', name: 'Sarah Johnson', status: 'away' as const },
    { initials: 'MD', name: 'Mike Davis', status: 'offline' as const },
    { initials: 'KL', name: 'Katie Lee', status: 'busy' as const },
    { initials: 'RT', name: 'Robert Taylor', status: 'online' as const }
  ];

  openDocument(doc: any) {
    console.log('Opening document:', doc.name);
  }

  shareDocument(doc: any) {
    console.log('Sharing document:', doc.name);
  }

  onFilterSelected(option: SatAutocompleteOption) {
    console.log('Filter selected:', option.name);
    // Implement filtering logic here
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'online': 'Online',
      'away': 'Away',
      'offline': 'Offline',
      'busy': 'Busy',
      'approved': 'Approved',
      'draft': 'Draft',
      'review': 'Under Review'
    };
    return statusMap[status] || status;
  }

  getStatusTag(status: string): 'success' | 'warning' | 'info' | 'neutral' {
    const statusTagMap: Record<string, 'success' | 'warning' | 'info' | 'neutral'> = {
      'online': 'success',
      'away': 'warning',
      'offline': 'neutral',
      'busy': 'warning',
      'approved': 'success',
      'draft': 'info',
      'review': 'warning'
    };
    return statusTagMap[status] || 'info';
  }

  getAvatarIndicator(status: string): 'active' | 'away' | 'offline' | 'readonly' {
    const indicatorMap: Record<string, 'active' | 'away' | 'offline' | 'readonly'> = {
      'online': 'active',
      'away': 'away',
      'offline': 'offline',
      'busy': 'readonly'
    };
    return indicatorMap[status] || 'offline';
  }
}