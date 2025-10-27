import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Satori Components
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';
import { SatBreadcrumbsModule, SatBreadcrumbsItem } from '@hylandsoftware/satori-ui/breadcrumbs';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';

// Our Custom UI Components
import { UiButtonComponent } from '../../lib/ui-components/button/ui-button.component';
import { UiCardComponent } from '../../lib/ui-components/card/ui-card.component';
import { UiInputComponent } from '../../lib/ui-components/input/ui-input.component';
import { UiTableComponent, type TableColumn } from '../../lib/ui-components/table/ui-table.component';
import { SatAutocompleteComponent, type SatAutocompleteOption } from '../../lib/ui-components/autocomplete/sat-autocomplete.component';

@Component({
  selector: 'app-ui-library-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Satori Components
    SatAppHeaderModule,
    SatLogoModule,
    SatBreadcrumbsModule,
    SatTagModule,
    // Our Custom Components
    UiButtonComponent,
    UiCardComponent,
    UiInputComponent,
    UiTableComponent,
    SatAutocompleteComponent
  ],
  template: `
    <!-- Satori Header -->
    <sat-app-header>
      <sat-logo satAppHeaderLogo>
        <sat-h-mark-logo></sat-h-mark-logo>
        <sat-word-mark-logo></sat-word-mark-logo>
      </sat-logo>
      <h1 satAppHeaderTitle>UI Component Library Demo</h1>
    </sat-app-header>

    <div class="demo-container">
      <!-- Breadcrumbs -->
      <sat-breadcrumbs [items]="breadcrumbItems"></sat-breadcrumbs>

      <!-- Button Components -->
      <ui-card 
        title="Button Components" 
        subtitle="Custom button component with multiple variants and states"
        icon="smart_button"
        [headerActions]="true">
        
        <div slot="header-actions">
                              <sat-category-tag [category]="'blue'">New</sat-category-tag>
        </div>

        <div class="component-demo">
          <h4>Variants</h4>
          <div class="button-group">
            <ui-button variant="primary">Primary</ui-button>
            <ui-button variant="secondary">Secondary</ui-button>
            <ui-button variant="outline">Outline</ui-button>
            <ui-button variant="ghost">Ghost</ui-button>
            <ui-button variant="danger">Danger</ui-button>
          </div>

          <h4>Sizes</h4>
          <div class="button-group">
            <ui-button size="small">Small</ui-button>
            <ui-button size="medium">Medium</ui-button>
            <ui-button size="large">Large</ui-button>
          </div>

          <h4>With Icons</h4>
          <div class="button-group">
            <ui-button iconLeft="add">Add Item</ui-button>
            <ui-button iconRight="arrow_forward">Continue</ui-button>
            <ui-button [loading]="loadingDemo()">
              {{ loadingDemo() ? 'Loading...' : 'Load Data' }}
            </ui-button>
          </div>
        </div>

        <div slot="footer">
          <ui-button 
            size="small" 
            variant="outline" 
            (buttonClick)="toggleLoading()">
            Toggle Loading Demo
          </ui-button>
        </div>
      </ui-card>

      <!-- Input Components -->
      <ui-card 
        title="Input Components" 
        subtitle="Form input components with validation and icons"
        icon="input">

        <form [formGroup]="demoForm" class="form-demo">
          <div class="form-row">
            <ui-input
              label="Full Name"
              placeholder="Enter your full name"
              prefixIcon="person"
              formControlName="name"
              [required]="true"
              helperText="Your display name">
            </ui-input>

            <ui-input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              prefixIcon="email"
              formControlName="email"
              [clearable]="true"
              [errorMessage]="getFieldError('email')">
            </ui-input>
          </div>

          <div class="form-row">
            <ui-input
              label="Phone Number"
              type="tel"
              placeholder="(555) 123-4567"
              prefixIcon="phone"
              formControlName="phone"
              size="large">
            </ui-input>

            <sat-autocomplete
              [dropdownOptions]="autocompleteOptions"
              placeholder="Select department..."
              (optionSelected)="onDepartmentSelected($event)">
            </sat-autocomplete>
          </div>
        </form>
      </ui-card>

      <!-- Table Component -->
      <ui-card 
        title="Data Table Component" 
        subtitle="Feature-rich table with sorting, search, and pagination"
        icon="table_chart">

        <ui-table
          [columns]="tableColumns"
          [data]="tableData"
          [searchable]="true"
          [pagination]="true"
          [pageSize]="5"
          [rowClickable]="true"
          [loading]="tableLoading()"
          (rowClick)="onTableRowClick($event)"
          (sort)="onTableSort($event)">
        </ui-table>

        <div slot="footer">
          <ui-button 
            size="small" 
            variant="outline" 
            (buttonClick)="toggleTableLoading()">
            Toggle Loading
          </ui-button>
          <ui-button 
            size="small" 
            variant="outline" 
            (buttonClick)="addTableRow()">
            Add Row
          </ui-button>
        </div>
      </ui-card>

      <!-- Usage Examples -->
      <ui-card 
        title="Usage Examples" 
        subtitle="Code snippets showing how to use these components"
        icon="code">

        <div class="code-examples">
          <h4>Button Usage</h4>
          <pre><code>{{ buttonUsageExample }}</code></pre>

          <h4>Input Usage</h4>
          <pre><code>{{ inputUsageExample }}</code></pre>

          <h4>Table Usage</h4>
          <pre><code>{{ tableUsageExample }}</code></pre>
        </div>
      </ui-card>
    </div>
  `,
  styleUrls: ['./ui-library-demo.component.scss']
})
export class UiLibraryDemoComponent {
  
  breadcrumbItems: SatBreadcrumbsItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'UI Library Demo' }
  ];

  // Form
  demoForm: FormGroup;
  
  // State
  loadingDemo = signal(false);
  tableLoading = signal(false);
  selectedDepartment = signal<string>('');

  // Autocomplete options
  autocompleteOptions: SatAutocompleteOption[] = [
    { name: 'Engineering' },
    { name: 'Design' },
    { name: 'Product Management' },
    { name: 'Marketing' },
    { name: 'Sales' },
    { name: 'Human Resources' }
  ];

  // Table configuration
  tableColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'joinDate', label: 'Join Date', type: 'date', sortable: true },
    { key: 'salary', label: 'Salary', type: 'number', sortable: true, align: 'right' }
  ];

  tableData = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@company.com',
      department: 'Engineering',
      joinDate: '2023-01-15',
      salary: 75000
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@company.com',
      department: 'Design',
      joinDate: '2023-03-20',
      salary: 68000
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike.davis@company.com',
      department: 'Product Management',
      joinDate: '2022-11-10',
      salary: 85000
    },
    {
      id: 4,
      name: 'Emily Brown',
      email: 'emily.brown@company.com',
      department: 'Marketing',
      joinDate: '2023-05-05',
      salary: 62000
    },
    {
      id: 5,
      name: 'Chris Wilson',
      email: 'chris.wilson@company.com',
      department: 'Engineering',
      joinDate: '2023-02-28',
      salary: 78000
    },
    {
      id: 6,
      name: 'Anna Martinez',
      email: 'anna.martinez@company.com',
      department: 'Sales',
      joinDate: '2023-04-12',
      salary: 72000
    }
  ];

  // Code examples
  buttonUsageExample = `<ui-button 
  variant="primary" 
  size="medium"
  iconLeft="add"
  (buttonClick)="onButtonClick()">
  Create New
</ui-button>`;

  inputUsageExample = `<ui-input
  label="Email Address"
  type="email"
  placeholder="Enter your email"
  prefixIcon="email"
  [clearable]="true"
  formControlName="email">
</ui-input>`;

  tableUsageExample = `<ui-table
  [columns]="tableColumns"
  [data]="tableData"
  [searchable]="true"
  [pagination]="true"
  [rowClickable]="true"
  (rowClick)="onRowClick($event)">
</ui-table>`;

  constructor(private fb: FormBuilder) {
    this.demoForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['']
    });
  }

  toggleLoading(): void {
    this.loadingDemo.update(loading => !loading);
    
    if (this.loadingDemo()) {
      setTimeout(() => this.loadingDemo.set(false), 3000);
    }
  }

  toggleTableLoading(): void {
    this.tableLoading.update(loading => !loading);
    
    if (this.tableLoading()) {
      setTimeout(() => this.tableLoading.set(false), 2000);
    }
  }

  onDepartmentSelected(option: SatAutocompleteOption): void {
    console.log('Department selected:', option);
    this.selectedDepartment.set(option.name);
  }

  onTableRowClick(row: any): void {
    console.log('Table row clicked:', row);
  }

  onTableSort(event: any): void {
    console.log('Table sort:', event);
  }

  addTableRow(): void {
    const newRow = {
      id: this.tableData.length + 1,
      name: `New User ${this.tableData.length + 1}`,
      email: `user${this.tableData.length + 1}@company.com`,
      department: 'Engineering',
      joinDate: new Date().toISOString().split('T')[0],
      salary: 70000
    };
    
    this.tableData = [...this.tableData, newRow];
  }

  getFieldError(fieldName: string): string {
    const field = this.demoForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
    }
    return '';
  }
}