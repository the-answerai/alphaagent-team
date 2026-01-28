---
name: electron-path-resolution
description: Critical path resolution patterns for Electron apps - avoid process.cwd() and __dirname pitfalls
---

# Electron Path Resolution Skill

Path resolution is the #1 cause of Electron app failures. This skill covers all the pitfalls and their solutions.

## The Core Problem

When an Electron app is launched from Finder/Explorer (NOT terminal):
- `process.cwd()` returns `/` on macOS, `C:\Windows\System32` on Windows
- `__dirname` in bundled code is resolved at bundle time, not runtime
- Node.js module resolution fails for bundled apps

## Environment Setup Pattern

In your main process, set environment variables that ALL code can use:

```typescript
// electron/main.ts
import { app } from 'electron';
import path from 'path';

async function initializeEnvironment() {
  // User data directory (database, uploads, cache)
  const userDataDir = app.getPath('userData');

  // App resources directory (bundled assets, node_modules)
  const appRoot = app.getAppPath();

  // Set environment variables for all processes
  process.env.ELECTRON_USER_DATA = userDataDir;
  process.env.ELECTRON_APP_ROOT = appRoot;
  process.env.ELECTRON_DB_PATH = path.join(userDataDir, 'app.db');

  // Ensure directories exist
  const fs = require('fs');
  const dirs = ['uploads', 'generated', 'cache', 'logs'];
  for (const dir of dirs) {
    const dirPath = path.join(userDataDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
```

## Safe Path Helper Functions

Create utility functions that ALL code uses:

```typescript
// src/shared/electron-paths.ts
import path from 'path';
import os from 'os';

/**
 * Get the user data directory (for database, uploads, etc.)
 * Works in both Electron and development
 */
export function getUserDataDir(): string {
  if (process.env.ELECTRON_USER_DATA) {
    return process.env.ELECTRON_USER_DATA;
  }
  if (process.env.ELECTRON_DB_PATH) {
    return path.dirname(process.env.ELECTRON_DB_PATH);
  }
  // Development fallback
  return path.resolve(process.cwd(), 'data');
}

/**
 * Get the app root directory (for bundled assets)
 */
export function getAppRoot(): string {
  if (process.env.ELECTRON_APP_ROOT) {
    return process.env.ELECTRON_APP_ROOT;
  }
  // Development fallback
  return process.cwd();
}

/**
 * Check if running in Electron
 */
export function isElectron(): boolean {
  return !!process.env.ELECTRON_USER_DATA || !!process.env.ELECTRON_DB_PATH;
}

/**
 * Get safe working directory for spawning processes
 */
export function getSafeWorkingDir(): string {
  if (isElectron()) {
    return getUserDataDir();
  }
  return process.cwd();
}

/**
 * Resolve a file path that may be relative or absolute
 * Handles /assets/... URLs in Electron
 */
export function resolveFilePath(relativePath: string): string {
  if (!relativePath.startsWith('/')) {
    return relativePath; // Already absolute or relative to cwd
  }

  const filename = path.basename(relativePath);

  if (isElectron()) {
    const userData = getUserDataDir();
    // Map URL paths to userData directories
    if (relativePath.includes('/uploaded/') || relativePath.includes('/uploads/')) {
      return path.join(userData, 'uploads', filename);
    }
    if (relativePath.includes('/generated/')) {
      return path.join(userData, 'generated', filename);
    }
    if (relativePath.includes('/renders/')) {
      return path.join(userData, 'renders', filename);
    }
    // Static assets from app bundle
    return path.join(getAppRoot(), 'public', relativePath);
  }

  // Development
  return path.join(process.cwd(), 'public', relativePath);
}
```

## Fixing Existing Code

### Database Location

```typescript
// BAD
const dbPath = path.resolve(process.cwd(), 'data', 'app.db');

// GOOD
import { getUserDataDir } from './electron-paths';
const dbPath = process.env.ELECTRON_DB_PATH || path.join(getUserDataDir(), 'app.db');
```

### File Uploads

```typescript
// BAD
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// GOOD
function getUploadsDir(): string {
  if (process.env.ELECTRON_DB_PATH) {
    const userDataDir = path.dirname(process.env.ELECTRON_DB_PATH);
    return path.join(userDataDir, 'uploads');
  }
  return path.join(process.cwd(), 'public', 'uploads');
}
```

### Generated Files

```typescript
// BAD
const GENERATED_DIR = path.resolve(process.cwd(), 'public/assets/generated');

// GOOD
function getGeneratedDir(): string {
  if (process.env.ELECTRON_DB_PATH) {
    const userDataDir = path.dirname(process.env.ELECTRON_DB_PATH);
    return path.join(userDataDir, 'generated');
  }
  return path.resolve(process.cwd(), 'public/assets/generated');
}
const GENERATED_DIR = getGeneratedDir();
```

### Temp Directories

```typescript
// BAD
const tempDir = path.resolve(process.cwd(), '.temp');

// GOOD
function getTempDir(): string {
  if (process.env.ELECTRON_DB_PATH) {
    const userDataDir = path.dirname(process.env.ELECTRON_DB_PATH);
    return path.join(userDataDir, '.temp');
  }
  return path.resolve(process.cwd(), '.temp');
}
```

## Static File Serving in Express

```typescript
// src/server/index.ts
import express from 'express';
import path from 'path';

const app = express();
const isElectron = !!process.env.ELECTRON_DB_PATH;

if (isElectron) {
  const userDataDir = path.dirname(process.env.ELECTRON_DB_PATH!);

  // User-generated files from userData
  app.use('/assets/uploads', express.static(path.join(userDataDir, 'uploads')));
  app.use('/assets/generated', express.static(path.join(userDataDir, 'generated')));
  app.use('/assets/renders', express.static(path.join(userDataDir, 'renders')));

  // Static assets from app bundle
  const publicPath = process.env.ELECTRON_APP_ROOT
    ? path.join(process.env.ELECTRON_APP_ROOT, '..', 'public')
    : path.resolve(__dirname, '../../public');
  app.use('/assets', express.static(publicPath));
} else {
  // Development
  app.use('/assets', express.static(path.join(process.cwd(), 'public/assets')));
}
```

## Preload Path in BrowserWindow

```typescript
// electron/window.ts
import { app, BrowserWindow } from 'electron';
import path from 'path';

const isDev = process.env.NODE_ENV === 'development';

export function createMainWindow() {
  // CRITICAL: Use app.getAppPath() in production
  const preloadPath = isDev
    ? path.join(__dirname, 'preload.cjs')
    : path.join(app.getAppPath(), 'electron-dist', 'preload.cjs');

  const win = new BrowserWindow({
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  return win;
}
```

## Anti-Patterns

```typescript
// NEVER use these in Electron apps:

// 1. Raw process.cwd()
const bad1 = process.cwd(); // Returns "/" in Finder!

// 2. Raw __dirname in bundled code
const bad2 = __dirname; // Resolved at bundle time!

// 3. require.resolve() for bundled modules
const bad3 = require.resolve('./config.json'); // Breaks in bundled app!

// 4. Relative paths without base
const bad4 = './data/file.txt'; // Relative to what?!
```

## Validation Checklist

Before packaging:

- [ ] Search codebase for `process.cwd()` - all replaced with helpers?
- [ ] Search for `__dirname` - only used with app.getAppPath() fallback?
- [ ] All file paths use environment-aware helpers?
- [ ] Static file serving configured for both dev and production?
- [ ] Temp directories use userData?

## Integration

Used by:
- `electron-converter` agent
- `electron-build-config` skill
