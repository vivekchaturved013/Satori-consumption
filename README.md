# Satori Workspace

This workspace contains the Satori design system and consumer applications that demonstrate how to use it.

## 🏗️ Workspace Structure

```
satori-workspace/
├── packages/
│   ├── satori/              # Satori design system (moved from original location)
│   └── consumer-app/        # Example consumer application
├── package.json             # Workspace configuration
└── README.md               # This file
```

## 🚀 Getting Started

### Install Dependencies

```bash
# Install workspace dependencies
npm install

# Install dependencies for all packages
cd packages/satori && npm install
cd ../consumer-app && npm install
```

### Development

```bash
# Start Satori Storybook (Component showcase)
npm run start:storybook

# Start Satori main app
npm run start:satori

# Start consumer application
npm run start:consumer

# Run both Satori and consumer app in parallel
npm run dev:parallel
```

### Build

```bash
# Build everything
npm run build:all

# Build just Satori
npm run build:satori

# Build just consumer app
npm run build:consumer
```

### Testing

```bash
# Test everything
npm run test:all

# Test just Satori
npm run test:satori

# Test just consumer app
npm run test:consumer
```

### Local Development Linking

For local development where the consumer app uses the local Satori packages:

```bash
# Link local Satori packages to consumer app
npm run link:local
```

## 📁 Projects

### Satori Design System (`packages/satori/`)

The complete Satori design system including:
- UI Components (`@hylandsoftware/satori-ui`)
- Development Kit (`@hylandsoftware/satori-devkit`)
- CIC Components (`@hylandsoftware/satori-cic`)
- Design Tokens (`@hylandsoftware/satori-tokens`)

### Consumer App (`packages/consumer-app/`)

An example Angular application demonstrating:
- How to consume Satori components
- How to use Satori design tokens
- Modern Angular 19+ patterns with signals
- Integration with Satori theming system

## 🔧 Development Tips

1. **Always build Satori first** when making changes to design system components
2. **Use local linking** for development to test changes immediately
3. **Run parallel development** to see changes in both projects simultaneously
4. **Follow Angular best practices** as demonstrated in both projects

## 📚 Documentation

- [Satori UI Documentation](packages/satori/packages/satori-ui/README.md)
- [Consumer App Setup](packages/consumer-app/README.md)
- [Design Tokens Usage Guide](docs/design-tokens.md)