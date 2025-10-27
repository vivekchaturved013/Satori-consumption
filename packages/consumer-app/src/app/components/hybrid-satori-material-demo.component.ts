import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

// ✅ Available Satori Components
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatBreadcrumbsModule, SatBreadcrumbsItem } from '@hylandsoftware/satori-ui/breadcrumbs';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';

// 🔄 Angular Material for Missing Components
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hybrid-satori-material-demo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Satori Components
    SatAppHeaderModule,
    SatAvatarModule,
    SatBreadcrumbsModule,
    SatIconModule,
    SatTagModule,
    // Material Components (styled with Satori tokens)
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule,
    MatMenuModule,
    MatIconModule
  ],
  template: `
    <!-- ✅ Satori Header -->
    <sat-app-header>
      <h1 satAppHeaderTitle>Hybrid Satori + Material Demo</h1>
      <div satAppHeaderActions>
        <sat-avatar [username]="'Vivek Chaturvedi'" [size]="'28'">VC</sat-avatar>
      </div>
    </sat-app-header>

    <div class="hybrid-demo">
      <!-- ✅ Satori Breadcrumbs -->
      <sat-breadcrumbs [items]="breadcrumbItems"></sat-breadcrumbs>

      <!-- 🔄 Material Tabs (styled with Satori) -->
      <mat-tab-group class="satori-styled-tabs">
        <mat-tab label="Forms">
          <div class="tab-content">
            
            <!-- 🔄 Material Cards with Satori Tags -->
            <mat-card class="demo-card">
              <mat-card-header>
                <mat-card-title>User Registration Form</mat-card-title>
                <mat-card-subtitle>
                  <sat-status-tag [status]="'info'">Active</sat-status-tag>
                </mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <form [formGroup]="userForm" class="form-grid">
                  
                  <!-- 🔄 Material Form Fields -->
                  <mat-form-field appearance="outline">
                    <mat-label>Full Name</mat-label>
                    <input matInput formControlName="name">
                    <mat-icon matSuffix>person</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Email</mat-label> 
                    <input matInput formControlName="email" type="email">
                    <mat-icon matSuffix>email</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Department</mat-label>
                    <mat-select formControlName="department">
                      <mat-option value="engineering">Engineering</mat-option>
                      <mat-option value="design">Design</mat-option>
                      <mat-option value="product">Product</mat-option>
                    </mat-select>
                  </mat-form-field>

                  <mat-checkbox formControlName="notifications">
                    Enable Notifications
                  </mat-checkbox>
                </form>
              </mat-card-content>
              
              <mat-card-actions>
                <button mat-raised-button color="primary">Save</button>
                <button mat-button>Cancel</button>
              </mat-card-actions>
            </mat-card>

          </div>
        </mat-tab>

        <mat-tab label="Data Table">
          <div class="tab-content">
            
            <!-- 🔄 Material Table with Satori Elements -->
            <mat-card class="demo-card">
              <mat-card-header>
                <mat-card-title>User Directory</mat-card-title>
                <mat-card-subtitle>
                          <sat-category-tag [category]="'blue'">Live Data</sat-category-tag>
                </mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content>
                <table mat-table [dataSource]="userData" class="satori-styled-table">
                  
                  <ng-container matColumnDef="avatar">
                    <th mat-header-cell *matHeaderCellDef>User</th>
                    <td mat-cell *matCellDef="let user">
                      <sat-avatar [username]="user.name" [size]="'28'" [indicator]="user.status">
                        {{ user.initials }}
                      </sat-avatar>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Name</th>
                    <td mat-cell *matCellDef="let user">{{ user.name }}</td>
                  </ng-container>

                  <ng-container matColumnDef="role">
                    <th mat-header-cell *matHeaderCellDef>Role</th>
                    <td mat-cell *matCellDef="let user">
                      <sat-category-tag [category]="user.roleCategory">
                        {{ user.role }}
                      </sat-category-tag>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="status">
                    <th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let user">
                      <sat-status-tag [status]="user.statusTag">
                        {{ user.statusText }}
                      </sat-status-tag>
                    </td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let user">
                      <button mat-icon-button [matMenuTriggerFor]="userMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      <mat-menu #userMenu="matMenu">
                        <button mat-menu-item>
                          <mat-icon>edit</mat-icon>
                          Edit
                        </button>
                        <button mat-menu-item>
                          <mat-icon>delete</mat-icon>
                          Delete
                        </button>
                      </mat-menu>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                </table>

                <mat-paginator [pageSizeOptions]="[5, 10, 20]"
                              showFirstLastButtons
                              class="satori-styled-paginator">
                </mat-paginator>
              </mat-card-content>
            </mat-card>

          </div>
        </mat-tab>

        <mat-tab label="Components">
          <div class="tab-content">
            
            <!-- Component Showcase -->
            <div class="component-showcase">
              
              <mat-card class="demo-card">
                <mat-card-header>
                  <mat-card-title>Loading States</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="spinner-demo">
                    <mat-spinner diameter="40"></mat-spinner>
                    <span>Loading...</span>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="demo-card">
                <mat-card-header>
                  <mat-card-title>Action Buttons</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="button-demo">
                    <button mat-raised-button color="primary">Primary</button>
                    <button mat-raised-button color="accent">Accent</button>
                    <button mat-raised-button color="warn">Warning</button>
                    <button mat-stroked-button>Outlined</button>
                    <button mat-flat-button>Flat</button>
                  </div>
                </mat-card-content>
              </mat-card>

            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styleUrls: ['./hybrid-satori-material-demo.component.scss']
})
export class HybridSatoriMaterialDemoComponent {
  
  breadcrumbItems: SatBreadcrumbsItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Demo', href: '/demo' },
    { label: 'Hybrid Components' }
  ];

  userForm: FormGroup;
  displayedColumns = ['avatar', 'name', 'role', 'status', 'actions'];
  
  userData = [
    {
      name: 'Vivek Chaturvedi',
      initials: 'VC',
      role: 'Senior Developer',
      roleCategory: 'primary' as const,
      status: 'online' as const,
      statusTag: 'success' as const,
      statusText: 'Active'
    },
    {
      name: 'Sarah Johnson',
      initials: 'SJ',
      role: 'Product Manager',
      roleCategory: 'secondary' as const,
      status: 'away' as const,
      statusTag: 'warning' as const,
      statusText: 'Away'
    },
    {
      name: 'Mike Davis',
      initials: 'MD',
      role: 'Designer',
      roleCategory: 'tertiary' as const,
      status: 'offline' as const,
      statusTag: 'error' as const,
      statusText: 'Offline'
    }
  ];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      name: [''],
      email: [''],
      department: [''],
      notifications: [true]
    });
  }
}