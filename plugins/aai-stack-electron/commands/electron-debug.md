---
description: Debug common Electron packaging and runtime issues
argument-hint: <error-message-or-symptom>
allowed-tools: Task, Bash, Read, Grep, Glob, Edit, Write, AskUserQuestion
---

# Electron Debug

Debug and fix common Electron app issues based on error messages or symptoms.

## Context

- Current directory: !`pwd`
- Electron version: !`npm list electron 2>/dev/null | grep electron || echo "Not installed"`
- Node version: !`node --version`

## Problem Description

$ARGUMENTS

## Common Issues and Solutions

### Issue: "ENOENT: no such file or directory" with path starting with "/"

**Symptom**: Error like `ENOENT: no such file or directory, mkdir '/.something'`

**Cause**: `process.cwd()` returns `/` when app is launched from Finder (macOS) or Explorer (Windows)

**Diagnosis**:
```bash
grep -rn "process.cwd()" src/ electron/ --include="*.ts" --include="*.js"
```

**Fix**:
```typescript
// Replace process.cwd() with environment-aware function
function getDataDir(): string {
  if (process.env.ELECTRON_DB_PATH) {
    return path.dirname(process.env.ELECTRON_DB_PATH);
  }
  return process.cwd();
}
```

---

### Issue: "Module not found" for native module

**Symptom**: `Error: Cannot find module 'better-sqlite3'` (or sharp, keytar)

**Cause**: Native module not included in package or not marked as external

**Diagnosis**:
```bash
# Check if module is external in build
cat package.json | grep -A 20 '"scripts"' | grep -E "external.*better-sqlite3"

# Check if module is in files array
cat electron-builder.config.* | grep better-sqlite3
```

**Fix**:
1. Add `--external:better-sqlite3` to esbuild command
2. Add `"node_modules/better-sqlite3/**/*"` to electron-builder files array
3. Ensure `npmRebuild: true` in electron-builder config

---

### Issue: "Invalid ELF header" or architecture mismatch

**Symptom**: Native module crashes with architecture error

**Cause**: Module compiled for wrong Node version or architecture

**Fix**:
```bash
# Delete and reinstall
rm -rf node_modules
npm install

# Rebuild for Electron
./node_modules/.bin/electron-rebuild
```

---

### Issue: "could not determine executable to run" with npx

**Symptom**: `npm error could not determine executable to run`

**Cause**: `node_modules/.bin` not created in packaged apps

**Diagnosis**:
```bash
grep -rn "npx " src/ --include="*.ts" --include="*.js"
```

**Fix**: Call CLI scripts directly:
```typescript
// Instead of: spawn('npx', ['remotion', 'render', ...])
const cliPath = path.join(app.getAppPath(), 'node_modules/@remotion/cli/remotion-cli.js');
const nodePath = findNodePath(); // Check common paths
spawn(nodePath, [cliPath, 'render', ...args]);
```

---

### Issue: CLI tool not found (claude, node, etc.)

**Symptom**: Tool works in terminal but not when app launched from Finder

**Cause**: PATH is minimal when launched from Finder: `/usr/bin:/bin:/usr/sbin:/sbin`

**Diagnosis**:
```bash
# Check what PATH looks like in packaged app
console.log('PATH:', process.env.PATH);
```

**Fix**: Check common installation paths:
```typescript
function findExecutable(name: string): string | null {
  const home = os.homedir();
  const paths = [
    `/usr/local/bin/${name}`,
    `/opt/homebrew/bin/${name}`,
    path.join(home, '.local', 'bin', name),
    path.join(home, '.nvm/versions/node/current/bin', name),
  ];

  for (const p of paths) {
    if (fs.existsSync(p) && fs.accessSync(p, fs.constants.X_OK)) {
      return p;
    }
  }
  return null;
}
```

---

### Issue: Keytar "spawn Unknown system error" on macOS

**Symptom**: Keychain operations fail silently or with spawn error

**Cause**: Missing entitlements or code signing

**Diagnosis**:
```bash
# Check entitlements
cat build-resources/entitlements.mac.plist
```

**Fix**:
1. Add keychain entitlement to plist:
```xml
<key>com.apple.security.keychain-access-groups</key>
<array>
  <string>$(AppIdentifierPrefix)com.yourcompany.yourapp</string>
</array>
```
2. Ensure `hardenedRuntime: true` in electron-builder config
3. Sign the app (even self-signed for testing)

---

### Issue: API key not found after saving

**Symptom**: Key saves but isn't used by service

**Cause**: Environment variable name mismatch between keychain and service

**Diagnosis**:
```bash
# Check keychain key names
grep -rn "keytar\|KEY_NAMES\|keychain" electron/ --include="*.ts"

# Check service env var names
grep -rn "process.env\." src/server/services/ --include="*.ts"
```

**Fix**: Ensure keychain stores with same name service reads:
```typescript
// Keychain stores
await keytar.setPassword('MyApp', 'ANTHROPIC_API_KEY', value);

// Service reads - check BOTH possible names
const apiKey = process.env.ANTHROPIC_API_KEY || process.env.SOME_OTHER_NAME;
```

---

### Issue: BrowserWindow shows blank

**Symptom**: Window opens but content is white/empty

**Cause**: Wrong URL or file path for production

**Diagnosis**:
```bash
grep -rn "loadURL\|loadFile" electron/ --include="*.ts"
```

**Fix**:
```typescript
const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  mainWindow.loadURL('http://localhost:3000');
} else {
  mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
}
```

---

### Issue: Permission prompts for Photos/Downloads/Desktop

**Symptom**: macOS shows permission dialog when app accesses certain directories

**Cause**: Using a protected directory as working directory for spawned processes

**Fix**: Use userData directory instead:
```typescript
spawn('some-command', args, {
  cwd: app.getPath('userData'), // Safe directory
  env: { ...process.env },
});
```

---

## Debugging Steps

1. **Enable DevTools in Production**:
```typescript
mainWindow.webContents.openDevTools();
```

2. **Add Error Logging**:
```typescript
process.on('uncaughtException', (error) => {
  fs.appendFileSync(
    path.join(app.getPath('userData'), 'error.log'),
    `${new Date().toISOString()}: ${error.stack}\n`
  );
});
```

3. **Check Electron Logs** (macOS):
```bash
# Find app logs
tail -f ~/Library/Logs/YourAppName/*.log

# Check Console.app for crash reports
open /Applications/Utilities/Console.app
```

4. **Test Finder Launch vs Terminal**:
```bash
# Works?
npm run electron:dev

# Also test double-click on built .app
open release/mac/YourApp.app
```

## Skills Used

This command uses:
- `electron-path-resolution` - Path issue fixes
- `electron-native-modules` - Native module issues
- `electron-cli-integration` - CLI detection fixes
- `electron-security` - Security and keychain fixes
