---
name: electron-build-config
description: Multi-platform Electron build configuration - esbuild bundling, electron-builder setup, and distribution
---

# Electron Build Configuration Skill

Configure the build pipeline for cross-platform Electron distribution with proper bundling, native module handling, and code signing.

## Build Pipeline Overview

```
Source Files → esbuild → electron-builder → Distribution
     ↓             ↓            ↓               ↓
TypeScript    Bundle JS    Package App      DMG/EXE/AppImage
  + React    + Externals   + Rebuild       + Code Signing
```

## esbuild Configuration

### Server Bundle (Main Process)

```bash
# Build server code for Electron main process
esbuild src/server/index.ts \
  --bundle \
  --platform=node \
  --format=cjs \
  --outfile=dist/server/index.cjs \
  --external:better-sqlite3 \
  --external:sharp \
  --external:keytar \
  --external:electron \
  --define:process.env.NODE_ENV=\"production\"
```

### Electron Main Process Bundle

```bash
# Build Electron main/preload scripts
esbuild electron/main.ts electron/preload.ts \
  --bundle \
  --platform=node \
  --format=cjs \
  --outdir=electron-dist \
  --out-extension:.js=.cjs \
  --external:electron \
  --external:keytar \
  --external:better-sqlite3 \
  --external:sharp
```

### package.json Scripts

```json
{
  "scripts": {
    "build": "vite build",
    "build:server": "esbuild src/server/index.ts --bundle --platform=node --format=cjs --outfile=dist/server/index.cjs --external:better-sqlite3 --external:sharp --external:keytar",
    "electron:build": "esbuild electron/*.ts --bundle --platform=node --format=cjs --outdir=electron-dist --out-extension:.js=.cjs --external:electron --external:keytar --external:better-sqlite3 --external:sharp",
    "build:electron": "npm run build && npm run build:server && npm run electron:build",
    "electron:dev": "NODE_ENV=development electron electron-dist/main.cjs",
    "dev:electron": "concurrently \"npm run dev:client\" \"wait-on http://localhost:3000 && npm run electron:dev\"",
    "dist": "npm run build:electron && electron-builder",
    "dist:mac": "npm run build:electron && electron-builder --mac",
    "dist:win": "npm run build:electron && electron-builder --win",
    "dist:linux": "npm run build:electron && electron-builder --linux"
  }
}
```

## electron-builder Configuration

### Complete Configuration File

```javascript
// electron-builder.config.cjs
module.exports = {
  appId: 'com.yourcompany.yourapp',
  productName: 'Your App Name',

  // Directories
  directories: {
    output: 'release',
    buildResources: 'build-resources',
  },

  // Files to include in the app
  files: [
    // Built output
    'dist/**/*',
    'electron-dist/**/*',
    'public/**/*',
    'package.json',

    // Native modules with their binaries
    'node_modules/better-sqlite3/**/*',
    'node_modules/keytar/**/*',
    'node_modules/sharp/**/*',

    // Native module dependencies
    'node_modules/bindings/**/*',
    'node_modules/file-uri-to-path/**/*',
    'node_modules/prebuild-install/**/*',

    // Exclude dev files
    '!**/*.ts',
    '!**/*.tsx',
    '!**/*.map',
    '!**/node_modules/**/*.md',
    '!**/node_modules/**/test/**',
    '!**/node_modules/**/tests/**',
    '!**/node_modules/**/*.d.ts',
  ],

  // CRITICAL: Rebuild native modules for Electron
  npmRebuild: true,

  // Disable asar for simpler native module handling
  asar: false,

  // macOS Configuration
  mac: {
    category: 'public.app-category.developer-tools',
    icon: 'build-resources/icon.icns',
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] },
      { target: 'zip', arch: ['x64', 'arm64'] },
    ],
    // Required for keytar and hardened runtime
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build-resources/entitlements.mac.plist',
    entitlementsInherit: 'build-resources/entitlements.mac.plist',
  },

  // DMG Configuration
  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: 'link', path: '/Applications' },
    ],
    window: {
      width: 540,
      height: 380,
    },
  },

  // Windows Configuration
  win: {
    icon: 'build-resources/icon.ico',
    target: [
      { target: 'nsis', arch: ['x64'] },
    ],
    // Sign Windows builds (requires certificate)
    // certificateFile: 'path/to/cert.pfx',
    // certificatePassword: process.env.WIN_CERT_PASSWORD,
  },

  // NSIS Installer Configuration
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
  },

  // Linux Configuration
  linux: {
    icon: 'build-resources/icons',
    target: [
      { target: 'AppImage', arch: ['x64'] },
      { target: 'deb', arch: ['x64'] },
    ],
    category: 'Development',
    maintainer: 'Your Name <your@email.com>',
  },

  // Publish configuration (for auto-updater)
  publish: {
    provider: 'github',
    owner: 'your-org',
    repo: 'your-repo',
    releaseType: 'release',
  },
};
```

## macOS Entitlements

```xml
<!-- build-resources/entitlements.mac.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <!-- Allow JIT compilation (for V8/Node.js) -->
  <key>com.apple.security.cs.allow-jit</key>
  <true/>

  <!-- Allow unsigned executable memory -->
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>

  <!-- Allow DYLD environment variables -->
  <key>com.apple.security.cs.allow-dyld-environment-variables</key>
  <true/>

  <!-- Keychain access for keytar -->
  <key>com.apple.security.keychain-access-groups</key>
  <array>
    <string>$(AppIdentifierPrefix)com.yourcompany.yourapp</string>
  </array>
</dict>
</plist>
```

## TypeScript Configuration for Electron

```json
// tsconfig.electron.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "outDir": "electron-dist",
    "rootDir": "electron",
    "declaration": false,
    "sourceMap": false
  },
  "include": ["electron/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Build Resources Directory

Create this structure:

```
build-resources/
├── icon.icns              # macOS icon (512x512)
├── icon.ico               # Windows icon
├── icons/                 # Linux icons
│   ├── 16x16.png
│   ├── 32x32.png
│   ├── 48x48.png
│   ├── 64x64.png
│   ├── 128x128.png
│   ├── 256x256.png
│   └── 512x512.png
├── entitlements.mac.plist
└── background.png         # DMG background (optional)
```

### Icon Generation Script

```bash
#!/bin/bash
# scripts/generate-icons.sh
# Requires: ImageMagick (brew install imagemagick)

SOURCE="source-icon.png"  # Your 1024x1024 source

# Linux icons
mkdir -p build-resources/icons
for size in 16 32 48 64 128 256 512; do
  convert "$SOURCE" -resize ${size}x${size} "build-resources/icons/${size}x${size}.png"
done

# macOS icns (requires iconutil on macOS)
mkdir -p icon.iconset
for size in 16 32 64 128 256 512; do
  convert "$SOURCE" -resize ${size}x${size} "icon.iconset/icon_${size}x${size}.png"
  convert "$SOURCE" -resize $((size*2))x$((size*2)) "icon.iconset/icon_${size}x${size}@2x.png"
done
iconutil -c icns icon.iconset -o build-resources/icon.icns
rm -rf icon.iconset

# Windows ico
convert "$SOURCE" -resize 256x256 build-resources/icon.ico

echo "Icons generated in build-resources/"
```

## Development Workflow

### Concurrent Development

```json
{
  "scripts": {
    "dev": "concurrently -n client,electron \"npm run dev:client\" \"npm run dev:electron-watch\"",
    "dev:client": "vite",
    "dev:electron-watch": "wait-on http://localhost:3000 && nodemon --watch electron --ext ts --exec \"npm run electron:build && npm run electron:dev\""
  },
  "devDependencies": {
    "concurrently": "^8.0.0",
    "nodemon": "^3.0.0",
    "wait-on": "^7.0.0"
  }
}
```

### Environment Detection

```typescript
// electron/main.ts
const isDev = process.env.NODE_ENV === 'development';

// In development, load from Vite dev server
if (isDev) {
  mainWindow.loadURL('http://localhost:3000');
} else {
  // In production, load from built files
  mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
}
```

## Troubleshooting Builds

### "Module not found" after packaging

1. Check module is in `files` array
2. Verify `--external` flag in esbuild
3. Ensure module is in `dependencies`, not `devDependencies`

### Native module crashes

1. Delete `node_modules` and reinstall
2. Run `./node_modules/.bin/electron-rebuild`
3. Check architecture matches (arm64 vs x64)

### Code signing issues (macOS)

1. Verify entitlements file exists
2. Check Apple Developer certificate is valid
3. Run `codesign --verify --deep --strict YourApp.app`

### App won't launch from Finder

1. Check `process.cwd()` not used (returns `/`)
2. Verify preload path uses `app.getAppPath()`
3. Check database path uses `app.getPath('userData')`

## Production Checklist

- [ ] All native modules in `files` array
- [ ] esbuild externals configured correctly
- [ ] `npmRebuild: true` in electron-builder config
- [ ] macOS entitlements configured for keytar
- [ ] Icons generated for all platforms
- [ ] TypeScript compiled to CommonJS
- [ ] Environment variables not hardcoded
- [ ] Database path uses userData directory
- [ ] Tested Finder launch (not just terminal)
- [ ] Build produces working installers

## Integration

Used by:
- `electron-converter` agent
- Distribution pipeline
