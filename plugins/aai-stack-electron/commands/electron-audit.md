---
description: Audit existing code for Electron compatibility issues before packaging
argument-hint: [optional: specific directory to audit]
allowed-tools: Bash, Read, Grep, Glob
---

# Electron Audit

Audit the current codebase for common Electron packaging issues that cause apps to fail when launched from Finder/Explorer.

## Context

- Current directory: !`pwd`
- Source directories: !`ls -d src/ electron/ 2>/dev/null || echo "No src/ or electron/ found"`

## Audit Target

$ARGUMENTS

## Audit Categories

### 1. Path Resolution Issues (CRITICAL)

These patterns WILL break when app is launched from Finder:

**`process.cwd()` Usage**
```bash
# Returns "/" on macOS when launched from Finder
grep -rn "process.cwd()" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"
```

**`__dirname` in Bundled Code**
```bash
# Resolved at bundle time, not runtime
grep -rn "__dirname" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"
```

**`require.resolve()` for Paths**
```bash
# Breaks in bundled apps
grep -rn "require.resolve" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"
```

### 2. Process Spawning Issues

**Direct CLI Commands**
```bash
# May not be in PATH when launched from Finder
grep -rn "spawn(" src/ --include="*.ts" --include="*.tsx" --include="*.js" -A 2
grep -rn "exec(" src/ --include="*.ts" --include="*.tsx" --include="*.js" -A 2
grep -rn "execSync(" src/ --include="*.ts" --include="*.tsx" --include="*.js" -A 2
```

**npx Usage**
```bash
# .bin directory not created in packaged apps
grep -rn "npx " src/ --include="*.ts" --include="*.tsx" --include="*.js"
```

### 3. Credential Storage Issues

**localStorage for Secrets**
```bash
# Insecure - use keytar instead
grep -rn "localStorage.setItem.*key\|localStorage.setItem.*token\|localStorage.setItem.*password\|localStorage.setItem.*secret" src/ --include="*.ts" --include="*.tsx" --include="*.js" -i
```

**Hardcoded Credentials**
```bash
# Should use keychain/environment
grep -rn "sk-ant-\|AIza\|sk-" src/ --include="*.ts" --include="*.tsx" --include="*.js"
```

### 4. Security Issues

**nodeIntegration Enabled**
```bash
grep -rn "nodeIntegration.*true" electron/ --include="*.ts" --include="*.js"
```

**contextIsolation Disabled**
```bash
grep -rn "contextIsolation.*false" electron/ --include="*.ts" --include="*.js"
```

**Direct ipcRenderer Exposure**
```bash
grep -rn "exposeInMainWorld.*ipcRenderer" electron/ --include="*.ts" --include="*.js"
```

### 5. Native Module Issues

**Native Modules in Dependencies**
```bash
# Check if these need special handling
cat package.json | grep -E "better-sqlite3|sharp|keytar|node-pty|serialport|canvas"
```

**Missing External Flags**
```bash
# Check if esbuild/build scripts mark native modules as external
cat package.json | grep -E "external.*better-sqlite3|external.*sharp|external.*keytar"
```

### 6. File System Operations

**Absolute Path Construction**
```bash
# May resolve incorrectly
grep -rn "path.resolve(" src/ --include="*.ts" --include="*.tsx" --include="*.js" -B 1 -A 1
grep -rn "path.join(" src/ --include="*.ts" --include="*.tsx" --include="*.js" -B 1 -A 1
```

**File System Access**
```bash
# Check for unprotected file operations
grep -rn "fs.writeFile\|fs.readFile\|fs.mkdir" src/ --include="*.ts" --include="*.tsx" --include="*.js" -B 1 -A 1
```

## Report Format

For each issue found, report:

1. **File and Line**: Exact location
2. **Issue Type**: Path/Spawn/Security/Native
3. **Severity**: Critical/Warning/Info
4. **Current Code**: What's there now
5. **Recommended Fix**: How to fix it

### Severity Definitions

- **Critical**: Will cause app to crash or fail silently when launched from Finder
- **Warning**: May cause issues depending on usage patterns
- **Info**: Best practice recommendation

## Summary Template

```markdown
## Electron Compatibility Audit Results

### Critical Issues (Must Fix)
- [ ] Issue 1: description (file:line)
- [ ] Issue 2: description (file:line)

### Warnings (Should Fix)
- [ ] Issue 1: description (file:line)

### Recommendations (Nice to Have)
- [ ] Issue 1: description (file:line)

### Native Modules Detected
- module1: needs external flag in bundler
- module2: needs rebuild for Electron

### Next Steps
1. Fix all critical issues before packaging
2. Address warnings for better reliability
3. Run `npm run dist:mac` to test packaging
4. Test by double-clicking .app in Finder
```

## Skills Used

This command references:
- `electron-path-resolution` - For path issue fixes
- `electron-security` - For security issue fixes
- `electron-native-modules` - For native module handling
- `electron-cli-integration` - For spawn/exec fixes
