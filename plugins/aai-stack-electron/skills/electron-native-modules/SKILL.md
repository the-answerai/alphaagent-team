---
name: electron-native-modules
description: Handle native Node.js modules in Electron - better-sqlite3, sharp, keytar packaging patterns
---

# Electron Native Modules Skill

Native modules require special handling in Electron because they must be compiled for Electron's Node.js version, not the system Node.js.

## Common Native Modules

| Module | Purpose | Special Notes |
|--------|---------|---------------|
| `better-sqlite3` | SQLite database | Most common, requires rebuild |
| `sharp` | Image processing | Large, multi-platform binaries |
| `keytar` | OS keychain access | Security-sensitive |
| `node-pty` | Terminal emulation | Platform-specific |
| `serialport` | Serial port access | Hardware access |

## Bundler Configuration

### esbuild (Recommended)

Native modules MUST be external - they cannot be bundled:

```bash
# Build command
esbuild src/server/index.ts \
  --bundle \
  --platform=node \
  --format=cjs \
  --outfile=dist/server/index.cjs \
  --external:better-sqlite3 \
  --external:sharp \
  --external:keytar \
  --external:electron
```

### package.json script

```json
{
  "scripts": {
    "build:server": "esbuild src/server/index.ts --bundle --platform=node --format=cjs --outfile=dist/server/index.cjs --external:better-sqlite3 --external:sharp --external:keytar",
    "electron:build": "esbuild electron/*.ts --bundle --platform=node --format=cjs --outdir=electron-dist --out-extension:.js=.cjs --external:electron --external:keytar --external:better-sqlite3 --external:sharp"
  }
}
```

## electron-builder Configuration

```javascript
// electron-builder.config.cjs
module.exports = {
  appId: 'com.yourcompany.yourapp',
  productName: 'Your App',

  // CRITICAL: Include native modules in the app
  files: [
    'dist/**/*',
    'electron-dist/**/*',
    'public/**/*',
    'package.json',
    // Native modules need their binary files
    'node_modules/better-sqlite3/**/*',
    'node_modules/keytar/**/*',
    'node_modules/sharp/**/*',
    // Also include their dependencies
    'node_modules/bindings/**/*',
    'node_modules/file-uri-to-path/**/*',
    'node_modules/prebuild-install/**/*',
  ],

  // CRITICAL: Rebuild native modules for Electron
  npmRebuild: true,

  // Don't use asar for apps with native modules (simpler, avoids issues)
  asar: false,

  // Or use asar with unpacking
  // asar: true,
  // asarUnpack: [
  //   'node_modules/better-sqlite3/**/*',
  //   'node_modules/keytar/**/*',
  //   'node_modules/sharp/**/*',
  // ],

  mac: {
    category: 'public.app-category.developer-tools',
    target: [
      { target: 'dmg', arch: ['x64', 'arm64'] },
      { target: 'zip', arch: ['x64', 'arm64'] },
    ],
    // Required for keytar
    hardenedRuntime: true,
    entitlements: 'build-resources/entitlements.mac.plist',
    entitlementsInherit: 'build-resources/entitlements.mac.plist',
  },

  win: {
    target: [
      { target: 'nsis', arch: ['x64'] },
    ],
  },

  linux: {
    target: [
      { target: 'AppImage', arch: ['x64'] },
      { target: 'deb', arch: ['x64'] },
    ],
    category: 'Development',
  },
};
```

## macOS Entitlements for Keytar

```xml
<!-- build-resources/entitlements.mac.plist -->
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.allow-dyld-environment-variables</key>
  <true/>
  <key>com.apple.security.keychain-access-groups</key>
  <array>
    <string>$(AppIdentifierPrefix)com.yourcompany.yourapp</string>
  </array>
</dict>
</plist>
```

## better-sqlite3 Specifics

### Database Path

```typescript
import Database from 'better-sqlite3';
import path from 'path';

function getDbPath(): string {
  if (process.env.ELECTRON_DB_PATH) {
    return process.env.ELECTRON_DB_PATH;
  }
  return path.resolve(process.cwd(), 'data', 'app.db');
}

const db = new Database(getDbPath());
```

### Auto-Migration on First Launch

```typescript
// Ensure tables exist on first launch
function initializeDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

// Call at startup
initializeDatabase(db);
```

## keytar for Secure Storage

```typescript
// electron/keychain.ts
import * as keytar from 'keytar';

const SERVICE_NAME = 'YourAppName';

export const KEY_NAMES = {
  API_KEY: 'api-key',
  AUTH_TOKEN: 'auth-token',
} as const;

export async function getCredential(key: string): Promise<string | null> {
  try {
    return await keytar.getPassword(SERVICE_NAME, key);
  } catch (error) {
    console.error('Failed to get credential:', error);
    return null;
  }
}

export async function setCredential(key: string, value: string): Promise<boolean> {
  try {
    await keytar.setPassword(SERVICE_NAME, key, value);
    return true;
  } catch (error) {
    console.error('Failed to set credential:', error);
    return false;
  }
}

export async function deleteCredential(key: string): Promise<boolean> {
  try {
    return await keytar.deletePassword(SERVICE_NAME, key);
  } catch (error) {
    console.error('Failed to delete credential:', error);
    return false;
  }
}
```

## sharp for Image Processing

```typescript
import sharp from 'sharp';
import path from 'path';

function getOutputDir(): string {
  if (process.env.ELECTRON_DB_PATH) {
    return path.join(path.dirname(process.env.ELECTRON_DB_PATH), 'processed');
  }
  return path.resolve(process.cwd(), 'public/processed');
}

async function processImage(inputPath: string, outputName: string): Promise<string> {
  const outputDir = getOutputDir();
  const outputPath = path.join(outputDir, outputName);

  await sharp(inputPath)
    .resize(800, 600)
    .jpeg({ quality: 80 })
    .toFile(outputPath);

  return outputPath;
}
```

## Deployment Script Pattern

Create a deployment script that installs only production dependencies:

```javascript
// scripts/prepare-electron.cjs
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const deployDir = 'electron-deploy';

// Clean and create deploy directory
if (fs.existsSync(deployDir)) {
  fs.rmSync(deployDir, { recursive: true });
}
fs.mkdirSync(deployDir);

// Copy package.json with only production deps
const pkg = require('../package.json');
const prodPkg = {
  name: pkg.name,
  version: pkg.version,
  main: 'electron-dist/main.cjs',
  dependencies: pkg.dependencies,
};
fs.writeFileSync(
  path.join(deployDir, 'package.json'),
  JSON.stringify(prodPkg, null, 2)
);

// Install production dependencies
execSync('npm install --omit=dev', { cwd: deployDir, stdio: 'inherit' });

// Copy built files
fs.cpSync('dist', path.join(deployDir, 'dist'), { recursive: true });
fs.cpSync('electron-dist', path.join(deployDir, 'electron-dist'), { recursive: true });
fs.cpSync('public', path.join(deployDir, 'public'), { recursive: true });

console.log('Deployment directory ready');
```

## Troubleshooting

### "Module not found" after packaging

1. Check the module is in `files` array in electron-builder config
2. Verify `--external` flag in esbuild command
3. Check module is in `dependencies`, not `devDependencies`

### "Invalid ELF header" or architecture mismatch

1. Delete `node_modules` and reinstall
2. Run `./node_modules/.bin/electron-rebuild`
3. Ensure building on same architecture as target

### keytar "Error: spawn Unknown system error"

1. Ensure macOS entitlements are configured
2. Sign the app (even with self-signed for testing)
3. Check keychain access permissions

## Integration

Used by:
- `electron-converter` agent
- `electron-build-config` skill
