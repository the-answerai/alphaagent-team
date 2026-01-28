---
description: Convert a web application to a cross-platform Electron desktop app
argument-hint: [optional: specific requirements or target platform]
allowed-tools: Task, Bash, Read, Grep, Glob, Edit, Write, AskUserQuestion
---

# Electron Convert

Convert the current web application to a cross-platform Electron desktop application.

## Context

- Current directory: !`pwd`
- Package manager: !`[ -f pnpm-lock.yaml ] && echo "pnpm" || ([ -f yarn.lock ] && echo "yarn" || echo "npm")`
- Has package.json: !`[ -f package.json ] && echo "yes" || echo "no"`

## Target Requirements

$ARGUMENTS

## Pre-Conversion Analysis

Before making any changes, analyze the current application:

### 1. Technology Stack Detection

Detect the project's stack:
- Frontend framework (React, Vue, Angular, Svelte)
- Backend (Express, Fastify, or client-only)
- Database (SQLite, none)
- Build tools (Vite, webpack, esbuild)

### 2. Path Usage Audit

Search for problematic patterns that WILL break in Electron:

```bash
# These patterns cause failures when launched from Finder:
grep -r "process.cwd()" src/ --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "__dirname" src/ --include="*.ts" --include="*.tsx" --include="*.js"
grep -r "require.resolve" src/ --include="*.ts" --include="*.tsx" --include="*.js"
```

### 3. External Dependencies Audit

Identify features that need special handling:
- CLI tool usage (spawning external processes)
- File system operations
- Database file locations
- Native module requirements (sharp, better-sqlite3, keytar)
- API keys/credentials

### 4. Current Architecture

Determine if app has:
- Embedded server (needs wrapping)
- Client-only (simpler conversion)
- External API dependencies

## Conversion Workflow

Execute these phases in order:

### Phase 1: Install Dependencies

Required dependencies:

```bash
# Production
npm install keytar

# Development
npm install -D electron electron-builder which concurrently wait-on
```

### Phase 2: Create Electron Structure

Create these files in `electron/` directory:

1. **electron/main.ts** - Main process entry
   - App lifecycle management
   - Window creation
   - Environment variable setup for paths
   - IPC handler registration

2. **electron/preload.ts** - Secure bridge
   - contextBridge exposure
   - Validated IPC channels only
   - Type-safe API surface

3. **electron/window.ts** - Window management
   - BrowserWindow configuration
   - Security settings (contextIsolation, sandbox)
   - Development vs production URL loading

4. **electron/keychain.ts** - Credential storage
   - keytar wrapper for get/set/delete
   - Service name configuration

5. **electron/cli-detector.ts** - CLI tool detection
   - Check common installation paths
   - Handle limited PATH in Finder launches
   - Version detection

6. **electron/ipc-handlers.ts** - IPC handlers
   - Keychain operations
   - CLI detection
   - App info

### Phase 3: Fix Path Resolution

**CRITICAL**: Fix ALL path-related code to work when `process.cwd()` returns `/`

For every file that uses paths:

```typescript
// Add helper function
function getDataDir(): string {
  if (process.env.ELECTRON_DB_PATH) {
    return path.dirname(process.env.ELECTRON_DB_PATH);
  }
  return process.cwd();
}

// Replace process.cwd() with getDataDir()
```

Key areas to fix:
- Database file paths
- Upload directories
- Generated file directories
- Temp directories
- Log file paths

### Phase 4: Server Integration

If app has embedded server:

1. Modify server entry point to export the app
2. Create `electron/server.ts` to start server on dynamic port
3. Pass port to renderer via environment variable
4. Configure static file serving for userData directories

### Phase 5: Add Settings UI

Create Settings page for:
- API key management (stored in keychain)
- CLI tool status display
- Connection testing

Files to create:
- `src/client/pages/Settings.tsx`
- `src/client/types/electron.d.ts`
- `src/client/hooks/useElectron.ts`

### Phase 6: Build Configuration

Create build configuration files:

1. **electron-builder.config.cjs** - Distribution config
2. **tsconfig.electron.json** - Electron TypeScript
3. **build-resources/entitlements.mac.plist** - macOS signing

Add package.json scripts:
```json
{
  "electron:dev": "NODE_ENV=development electron electron-dist/main.cjs",
  "electron:build": "esbuild electron/*.ts --bundle --platform=node --format=cjs --outdir=electron-dist --out-extension:.js=.cjs --external:electron --external:keytar --external:better-sqlite3",
  "build:electron": "npm run build && npm run electron:build",
  "dist:mac": "npm run build:electron && electron-builder --mac",
  "dist:win": "npm run build:electron && electron-builder --win",
  "dist:linux": "npm run build:electron && electron-builder --linux"
}
```

### Phase 7: Testing

Test the conversion:

1. **Development mode**: `npm run electron:dev`
2. **Finder launch test**: Double-click built .app
3. **API key persistence**: Save and restart
4. **File operations**: Uploads, database, generated files

## Success Criteria

- [ ] Electron structure created
- [ ] All path resolution fixed
- [ ] Server integration complete (if applicable)
- [ ] Settings UI implemented
- [ ] Build configuration complete
- [ ] Development mode works from terminal
- [ ] App works when launched from Finder
- [ ] API keys persist in keychain
- [ ] File operations work correctly

## Skills Used

This command uses the following skills:
- `electron-path-resolution` - Safe path handling
- `electron-native-modules` - Native module packaging
- `electron-security` - Secure IPC and credentials
- `electron-cli-integration` - CLI tool detection
- `electron-build-config` - Multi-platform builds

## Important Notes

- **NEVER skip path audit** - This is the #1 cause of Electron app failures
- **ALWAYS test Finder launch** - Terminal works, Finder breaks differently
- **ALWAYS use keytar** - Never store credentials in localStorage
- **NEVER expose ipcRenderer directly** - Use contextBridge
