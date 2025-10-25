# How to Consume Satori Design System

This guide explains how to properly consume the Satori Design System in your Angular application.

## Prerequisites

1. **Node.js and npm** (or yarn/pnpm)
2. **Angular 19+** application
3. **GitHub Package Registry access** with proper authentication

## Setup Instructions

### 1. Configure npm Registry

Create a `.npmrc` file in your project root:

```properties
@hylandsoftware:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${SATORI_GH_READONLY_TOKEN}
```

**Note:** You need to set the `SATORI_GH_READONLY_TOKEN` environment variable with your GitHub Personal Access Token that has package read access.

### 2. Install Dependencies

Add Satori packages to your `package.json`:

```bash
npm install @hylandsoftware/satori-ui @hylandsoftware/satori-icons @hylandsoftware/satori-tokens @hylandsoftware/satori-fonts
```

You'll also need these peer dependencies:
```bash
npm install @angular/animations @angular/cdk @angular/material @ngx-translate/core sass
```

### 3. Configure Angular Application

#### App Configuration (app.config.ts)
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideAndConfigureSatoriUITranslations } from '@hylandsoftware/satori-ui/translations';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... your other providers
    provideAnimationsAsync(),
    provideHttpClient(),
    provideAndConfigureSatoriUITranslations()
  ]
};
```

#### Global Styles (styles.scss)
```scss
// Import Satori theme and fonts
@use '@hylandsoftware/satori-ui/theme' as satori;
@import '@hylandsoftware/satori-fonts';

// Apply the theme
@include satori.theme();
```

### 4. Import and Use Components

#### Modern Import Syntax (Recommended)
Use specific imports for better tree-shaking:

```typescript
import { Component } from '@angular/core';
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';

@Component({
  selector: 'app-root',
  imports: [SatAppHeaderModule, SatIconModule, SatTagModule],
  template: `
    <sat-app-header>
      <div sat-app-header-title>My Application</div>
    </sat-app-header>
    
    <sat-tag color="primary">Status Tag</sat-tag>
    
    <sat-icon>home</sat-icon>
  `
})
export class AppComponent {}
```

#### Legacy Import (Deprecated)
```typescript
// This works but is deprecated for performance reasons
import { SatAppHeaderModule, SatIconModule } from '@hylandsoftware/satori-ui';
```

## Available Packages

- **@hylandsoftware/satori-ui** - Angular UI components
- **@hylandsoftware/satori-icons** - Icon library
- **@hylandsoftware/satori-tokens** - Design tokens (CSS custom properties)
- **@hylandsoftware/satori-fonts** - Typography system

## Available Components

### Core Components
- `SatAppHeaderModule` - Application header with logo, title, and actions
- `SatIconModule` - Icon component with Satori icon library
- `SatTagModule` - Tag/label component with various styles
- `SatLogoModule` - Satori logo component
- `SatBreadcrumbsModule` - Navigation breadcrumbs
- `SatRichTooltipModule` - Enhanced tooltip component
- `SatAvatarModule` - User avatar component
- `SatPlatformNavModule` - Platform navigation component

### Component Import Paths
```typescript
// Use these modern import paths for better performance
import { SatAppHeaderModule } from '@hylandsoftware/satori-ui/app-header';
import { SatIconModule } from '@hylandsoftware/satori-ui/icons';
import { SatTagModule } from '@hylandsoftware/satori-ui/tag';
import { SatLogoModule } from '@hylandsoftware/satori-ui/logo';
import { SatBreadcrumbsModule } from '@hylandsoftware/satori-ui/breadcrumbs';
import { SatRichTooltipModule } from '@hylandsoftware/satori-ui/rich-tooltip';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatPlatformNavModule } from '@hylandsoftware/satori-ui/platform-nav';
```

## Example Usage

### App Header
```html
<sat-app-header>
  <div sat-app-header-logo>
    <sat-logo></sat-logo>
  </div>
  <div sat-app-header-title>
    <h1>My Application</h1>
  </div>
  <div sat-app-header-actions>
    <button>Login</button>
  </div>
</sat-app-header>
```

### Tags
```html
<sat-tag color="primary">Primary</sat-tag>
<sat-tag color="success">Success</sat-tag>
<sat-tag color="warning">Warning</sat-tag>
<sat-tag color="error">Error</sat-tag>
```

### Icons
```html
<sat-icon>home</sat-icon>
<sat-icon>settings</sat-icon>
<sat-icon size="24">user</sat-icon>
```

## Troubleshooting

### Authentication Issues
- Ensure your GitHub token has `read:packages` permission
- Verify the token is correctly set in your environment
- Check that the `.npmrc` file is in the correct location

### Module Not Found Errors
- Run `npm install` after adding dependencies
- Ensure all peer dependencies are installed
- Check that your import paths match the available exports

### Build Issues
- Make sure you have Sass installed (`npm install sass`)
- Verify Angular and TypeScript versions are compatible
- Check for conflicting CSS frameworks

## Migration Notes

If migrating from legacy imports:
1. Replace barrel imports with specific component imports
2. Update theme imports from `@import` to `@use` syntax
3. Update translation provider names (old `provideSatoriUITranslations` → new `provideAndConfigureSatoriUITranslations`)

## Support

For issues and questions:
- Check the [Satori Storybook](your-storybook-url) for component documentation
- Review the component source code in the packages
- Contact the Satori team for specific integration help