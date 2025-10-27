import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import ALL available Satori components
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatBreadcrumbsModule, SatBreadcrumbsItem } from '@hylandsoftware/satori-ui/breadcrumbs';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';
import { SatPlatformNavModule } from '@hylandsoftware/satori-ui/platform-nav';
import { SatRichTooltipModule } from '@hylandsoftware/satori-ui/rich-tooltip';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';

@Component({
  selector: 'app-comprehensive-satori-demo',
  standalone: true,
  imports: [
    CommonModule,
    SatAppHeaderModule,
    SatAvatarModule,
    SatBreadcrumbsModule,
    SatIconModule,
    SatLogoModule,
    SatPlatformNavModule,
    SatRichTooltipModule,
    SatTagModule
  ],
  template: `
    <!-- ✅ 1. APP HEADER WITH LOGO -->
    <sat-app-header>
      <sat-logo satAppHeaderLogo>
        <sat-h-mark-logo></sat-h-mark-logo>
        <sat-word-mark-logo></sat-word-mark-logo>
      </sat-logo>
      <h1 satAppHeaderTitle>Comprehensive Satori Demo</h1>
      <div satAppHeaderActions>
        <button>
          🔔 Notifications
        </button>
        <sat-avatar [username]="'Vivek Chaturvedi'" [size]="'28'" [indicator]="'active'">VC</sat-avatar>
      </div>
    </sat-app-header>

    <!-- ✅ 2. PLATFORM NAVIGATION CONTAINER -->
    <sat-platform-nav-container>
      
      <!-- ✅ 3. PLATFORM NAVIGATION SIDEBAR -->
      <sat-platform-nav>
        <sat-platform-nav-list-item>
          <div class="platform-nav-app-icon">
            📱 Apps
          </div>
        </sat-platform-nav-list-item>
        
        <sat-platform-nav-list-item>
          📁
          <span>Documents</span>
        </sat-platform-nav-list-item>
        
        <sat-platform-nav-list-item>
          ⭐
          <span>Favorites</span>
        </sat-platform-nav-list-item>
        
        <sat-platform-nav-list-item>
          🏢
          <span>Workspaces</span>
        </sat-platform-nav-list-item>

        <!-- ✅ User Section -->
        <sat-platform-nav-user>
          <sat-platform-nav-avatar>
            <sat-avatar [username]="'Vivek Chaturvedi'" [size]="'36'" [indicator]="'active'">VC</sat-avatar>
          </sat-platform-nav-avatar>
          <sat-platform-nav-user-profile>
            <span>Vivek Chaturvedi</span>
          </sat-platform-nav-user-profile>
        </sat-platform-nav-user>

        <!-- ✅ Environment Switcher -->
        <div class="platform-nav-environment-switcher">
          <div class="environment-item">Production</div>
          <div class="environment-item">Development</div>
        </div>
      </sat-platform-nav>

      <!-- ✅ 4. MAIN CONTENT AREA -->
      <sat-platform-nav-main-content>
        <div class="content-wrapper">
          
          <!-- ✅ 5. BREADCRUMBS NAVIGATION -->
          <sat-breadcrumbs [items]="breadcrumbItems"></sat-breadcrumbs>

          <!-- ✅ 6. AVATAR SHOWCASE SECTION -->
          <section class="demo-section">
            <h2>Avatar Components</h2>
            <div class="avatar-grid">
              <div class="avatar-demo">
                <sat-avatar [username]="'Sarah Miller'" [size]="'28'" [indicator]="'active'">SM</sat-avatar>
                <span>Small Online</span>
              </div>
              <div class="avatar-demo">
                <sat-avatar [username]="'Michael Davis'" [size]="'36'" [indicator]="'away'">MD</sat-avatar>
                <span>Medium Away</span>
              </div>
              <div class="avatar-demo">
                <sat-avatar [username]="'Anna Liu'" [size]="'64'" [indicator]="'offline'">AL</sat-avatar>
                <span>Large Offline</span>
              </div>
              <div class="avatar-demo">
                <sat-avatar [username]="'Bob Zhang'" [size]="'64'" [indicator]="'readonly'">BZ</sat-avatar>
                <span>Large Busy</span>
              </div>
            </div>
          </section>

          <!-- ✅ 7. TAG SYSTEM SHOWCASE -->
          <section class="demo-section">
            <h2>Tag Components</h2>
            <div class="tag-showcase">
              <h3>Category Tags</h3>
              <div class="tag-group">
                <sat-category-tag [category]="'blue'">Primary</sat-category-tag>
                <sat-category-tag [category]="'green'">Secondary</sat-category-tag>
                <sat-category-tag [category]="'purple'">Tertiary</sat-category-tag>
              </div>
              
              <h3>Status Tags</h3>
              <div class="tag-group">
                <sat-status-tag [status]="'success'">Success</sat-status-tag>
                <sat-status-tag [status]="'warning'">Warning</sat-status-tag>
                <sat-status-tag [status]="'important'">Error</sat-status-tag>
                <sat-status-tag [status]="'info'">Info</sat-status-tag>
              </div>
            </div>
          </section>

          <!-- ✅ 8. RICH TOOLTIP SHOWCASE -->
          <section class="demo-section">
            <h2>Rich Tooltip Components</h2>
            <div class="tooltip-showcase">
            <button class="demo-button">
                ❓ Basic Tooltip
            </button>              <button class="demo-button">
                ℹ️ Advanced Tooltip
              </button>
            </div>
          </section>

          <!-- ✅ 9. ICON SHOWCASE -->
          <section class="demo-section">
            <h2>Icon Components</h2>
            <div class="icon-grid">
              <div class="icon-demo" *ngFor="let icon of availableIcons">
                {{ getIconEmoji(icon) }}
                <span>{{ icon }}</span>
              </div>
            </div>
          </section>

        </div>
      </sat-platform-nav-main-content>
    </sat-platform-nav-container>

    <!-- ✅ RICH TOOLTIP TEMPLATES -->
    
    <!-- Notification Tooltip -->
    <sat-rich-tooltip #notificationTooltip>
      <sat-rich-tooltip-title>Notifications</sat-rich-tooltip-title>
      <sat-rich-tooltip-content>
        You have 3 new notifications
      </sat-rich-tooltip-content>
      <sat-rich-tooltip-actions>
        <button>View All</button>
      </sat-rich-tooltip-actions>
    </sat-rich-tooltip>

    <!-- Basic Tooltip -->
    <sat-rich-tooltip #basicTooltip>
      <sat-rich-tooltip-title>Help Information</sat-rich-tooltip-title>
      <sat-rich-tooltip-content>
        This is a basic rich tooltip with title and content.
      </sat-rich-tooltip-content>
    </sat-rich-tooltip>

    <!-- Advanced Tooltip -->
    <sat-rich-tooltip #advancedTooltip>
      <sat-rich-tooltip-title>Advanced Features</sat-rich-tooltip-title>
      <sat-rich-tooltip-content>
        <p>This tooltip includes:</p>
        <ul>
          <li>Multiple content types</li>
          <li>Rich HTML formatting</li>
          <li>Action buttons</li>
        </ul>
      </sat-rich-tooltip-content>
      <sat-rich-tooltip-actions>
        <button>Learn More</button>
        <button>Close</button>
      </sat-rich-tooltip-actions>
    </sat-rich-tooltip>
  `,
  styleUrls: ['./comprehensive-satori-demo.component.scss']
})
export class ComprehensiveSatoriDemoComponent {
  
  breadcrumbItems: SatBreadcrumbsItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Components', href: '/components' },
    { label: 'Satori Demo' }
  ];

  availableIcons = [
    'add_user', 'alarm', 'apps', 'attach_file', 'barcode',
    'bell', 'block', 'bookmark', 'box', 'folder',
    'star', 'workspace', 'document', 'file', 'home',
    'search', 'menu', 'person', 'group', 'notification',
    'settings', 'help', 'info', 'warning', 'error'
  ];

  getIconEmoji(iconName: string): string {
    const iconMap: Record<string, string> = {
      'add_user': '👤➕',
      'alarm': '⏰',
      'apps': '📱',
      'attach_file': '📎',
      'barcode': '📊',
      'bell': '🔔',
      'block': '🚫',
      'bookmark': '🔖',
      'box': '📦',
      'folder': '📁',
      'star': '⭐',
      'workspace': '🏢',
      'document': '📄',
      'file': '📁',
      'home': '🏠',
      'search': '🔍',
      'menu': '☰',
      'person': '👤',
      'group': '👥',
      'notification': '🔔',
      'settings': '⚙️',
      'help': '❓',
      'info': 'ℹ️',
      'warning': '⚠️',
      'error': '❌'
    };
    return iconMap[iconName] || '📄';
  }
}