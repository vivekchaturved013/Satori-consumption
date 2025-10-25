# Nuxeo Satori Integration Setup

This document provides instructions for setting up the consumer app with real Satori packages for Nuxeo services integration.

## Prerequisites

1. **GitHub Token**: You need a GitHub Personal Access Token with `read:packages` permission
2. **Environment Variable**: Set `SATORI_GH_READONLY_TOKEN` environment variable
3. **Nuxeo Platform**: Access to a Nuxeo Platform instance with OIDC configured

## Installation Steps

### 1. Configure Authentication

Set your GitHub token in your environment:

```bash
# Windows PowerShell
$env:SATORI_GH_READONLY_TOKEN="your_github_token_here"

# Windows Command Prompt  
set SATORI_GH_READONLY_TOKEN=your_github_token_here

# Linux/macOS
export SATORI_GH_READONLY_TOKEN=your_github_token_here
```

### 2. Install Satori Packages

From the consumer-app directory:

```bash
cd C:\Repos\satori-workspace\packages\consumer-app
npm install
```

This will install all the Satori packages from GitHub Package Registry:
- `@hylandsoftware/satori-ui` - Core UI components
- `@hylandsoftware/satori-devkit` - Development utilities and auth
- `@hylandsoftware/satori-cic` - Content management components  
- `@hylandsoftware/satori-tokens` - Design tokens
- `@hylandsoftware/satori-fonts` - Typography assets
- `@hylandsoftware/satori-icons` - Icon library

### 3. Configure Nuxeo Connection

Update `app.config.ts` with your Nuxeo server details:

```typescript
provideApplicationCore({
  auth: [{
    key: 'nuxeo-auth',
    config: {
      authority: 'https://your-nuxeo-server.com/oauth2',
      clientId: 'your-nuxeo-client-id',
      // ... other config
    }
  }],
  api: {
    baseUrl: 'https://your-nuxeo-server.com/nuxeo/api/v1'
  }
})
```

### 4. Run the Application

```bash
npm start
```

## Features Enabled

After successful installation, your application will have:

✅ **Real Satori Components** - All UI components from `@hylandsoftware/satori-ui`  
✅ **Nuxeo Authentication** - OIDC integration via Satori DevKit  
✅ **Document Management** - Browse and manage Nuxeo content  
✅ **Platform Navigation** - Integrated Nuxeo platform navigation  
✅ **Design System** - Complete Satori design tokens and theming  
✅ **Content Integration** - CIC components for enterprise content management

## Troubleshooting

### Authentication Issues
- Ensure `SATORI_GH_READONLY_TOKEN` is set correctly
- Verify your GitHub token has `read:packages` permission
- Check that your token hasn't expired

### Nuxeo Connection Issues  
- Verify your Nuxeo server URL and OIDC configuration
- Ensure CORS is configured properly on the Nuxeo server
- Check that your client ID is registered in Nuxeo

### Build Issues
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for version conflicts in package.json

## Development

For local development with the Satori workspace:

```bash  
# From the workspace root
npm run link:local
```

This will link the local Satori packages for development.