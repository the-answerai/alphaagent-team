---
name: electron-cli-integration
description: Integrate external CLI tools (Claude, Node, npx) in Electron apps with proper PATH handling
---

# Electron CLI Integration Skill

When Electron apps launch from Finder/Explorer, the PATH is minimal. This skill covers detecting and using CLI tools reliably.

## The PATH Problem

When launched from terminal:
```
PATH=/usr/local/bin:/usr/bin:/bin:/opt/homebrew/bin:~/.nvm/versions/node/v20/bin:...
```

When launched from Finder (macOS):
```
PATH=/usr/bin:/bin:/usr/sbin:/sbin
```

## CLI Detector Pattern

```typescript
// electron/cli-detector.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export interface CliStatus {
  found: boolean;
  path?: string;
  version?: string;
  error?: string;
}

// Common installation paths for various tools
function getCommonPaths(toolName: string): string[] {
  const home = os.homedir();

  return [
    // Homebrew (macOS)
    `/usr/local/bin/${toolName}`,
    `/opt/homebrew/bin/${toolName}`,

    // User-local installations
    path.join(home, '.local', 'bin', toolName),

    // Tool-specific locations
    path.join(home, '.claude', 'bin', toolName),

    // Node.js via nvm
    path.join(home, '.nvm', 'versions', 'node', 'current', 'bin', toolName),

    // System paths
    `/usr/bin/${toolName}`,

    // Windows-specific (if on Windows)
    path.join(home, 'AppData', 'Roaming', 'npm', `${toolName}.cmd`),
    `C:\\Program Files\\nodejs\\${toolName}.cmd`,
  ];
}

function isExecutable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

function findInCommonPaths(toolName: string): string | null {
  for (const toolPath of getCommonPaths(toolName)) {
    if (fs.existsSync(toolPath) && isExecutable(toolPath)) {
      return toolPath;
    }
  }
  return null;
}

export async function detectCli(toolName: string): Promise<CliStatus> {
  // First, check common installation paths
  let toolPath = findInCommonPaths(toolName);

  // If not found, try 'which' command (works if terminal has full PATH)
  if (!toolPath) {
    try {
      const which = await import('which');
      toolPath = await which.default(toolName);
    } catch {
      // Not found in PATH either
    }
  }

  if (!toolPath) {
    return {
      found: false,
      error: `${toolName} not found. Check common installation paths or ensure it's in your PATH.`,
    };
  }

  // Get version
  try {
    const { stdout } = await execAsync(`"${toolPath}" --version`, {
      timeout: 5000,
    });
    const version = stdout.trim();

    return {
      found: true,
      path: toolPath,
      version,
    };
  } catch {
    // Found but couldn't get version
    return {
      found: true,
      path: toolPath,
      error: `Found ${toolName} but could not determine version`,
    };
  }
}

// Specific detectors for common tools
export async function detectClaudeCli(): Promise<CliStatus> {
  return detectCli('claude');
}

export async function detectNode(): Promise<CliStatus> {
  return detectCli('node');
}

export async function detectNpx(): Promise<CliStatus> {
  return detectCli('npx');
}
```

## Using CLI Tools at Runtime

### Spawning with Safe Paths

```typescript
// src/server/services/cli-runner.ts
import { spawn } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

interface SpawnOptions {
  args: string[];
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
}

// Get safe working directory (not root!)
function getSafeWorkingDir(): string {
  if (process.env.ELECTRON_DB_PATH) {
    return path.dirname(process.env.ELECTRON_DB_PATH);
  }
  return os.tmpdir();
}

// Find executable in common paths
function findExecutable(name: string): string {
  const home = os.homedir();
  const paths = [
    `/usr/local/bin/${name}`,
    `/opt/homebrew/bin/${name}`,
    path.join(home, '.local', 'bin', name),
    path.join(home, '.nvm/versions/node/current/bin', name),
    `/usr/bin/${name}`,
  ];

  for (const p of paths) {
    try {
      fs.accessSync(p, fs.constants.X_OK);
      return p;
    } catch {}
  }

  // Fallback - hope it's in PATH
  return name;
}

export async function runCli(
  toolName: string,
  options: SpawnOptions
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const toolPath = process.env[`${toolName.toUpperCase()}_PATH`] || findExecutable(toolName);
    const cwd = options.cwd || getSafeWorkingDir();

    let stdout = '';
    let stderr = '';

    // Use bash to ensure proper environment
    const fullCommand = `"${toolPath}" ${options.args.map((a) => `"${a}"`).join(' ')}`;

    const proc = spawn('/bin/bash', ['-c', fullCommand], {
      cwd,
      env: { ...process.env, ...options.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      stdout += text;
      options.onStdout?.(text);
    });

    proc.stderr.on('data', (data) => {
      const text = data.toString();
      stderr += text;
      options.onStderr?.(text);
    });

    proc.on('close', (code) => {
      resolve({
        exitCode: code ?? 1,
        stdout,
        stderr,
      });
    });

    proc.on('error', (err) => {
      resolve({
        exitCode: 1,
        stdout,
        stderr: err.message,
      });
    });
  });
}
```

### Claude CLI Integration

```typescript
// src/server/services/claude-cli.ts
import { spawn } from 'child_process';
import * as path from 'path';
import * as os from 'os';

function getClaudePath(): string {
  // Check environment variable first (set by main process)
  if (process.env.CLAUDE_PATH) {
    return process.env.CLAUDE_PATH;
  }

  // Search common paths
  const home = os.homedir();
  const paths = [
    '/usr/local/bin/claude',
    '/opt/homebrew/bin/claude',
    path.join(home, '.local', 'bin', 'claude'),
    path.join(home, '.claude', 'bin', 'claude'),
  ];

  for (const p of paths) {
    try {
      require('fs').accessSync(p, require('fs').constants.X_OK);
      return p;
    } catch {}
  }

  return 'claude'; // Fallback
}

function getSafeWorkingDir(): string {
  if (process.env.ELECTRON_DB_PATH) {
    return path.dirname(process.env.ELECTRON_DB_PATH);
  }
  return os.tmpdir();
}

export async function runClaudeCommand(
  prompt: string
): Promise<{ success: boolean; output: string; error?: string }> {
  return new Promise((resolve) => {
    const claudePath = getClaudePath();

    const proc = spawn('/bin/bash', ['-c', `"${claudePath}" --print --output-format text`], {
      cwd: getSafeWorkingDir(),
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let output = '';
    let error = '';

    // Write prompt to stdin
    proc.stdin.write(prompt);
    proc.stdin.end();

    proc.stdout.on('data', (data) => {
      output += data.toString();
    });

    proc.stderr.on('data', (data) => {
      error += data.toString();
    });

    proc.on('close', (code) => {
      if (code === 0 && output.trim()) {
        resolve({ success: true, output: output.trim() });
      } else {
        resolve({
          success: false,
          output,
          error: error || 'Command failed',
        });
      }
    });

    proc.on('error', (err) => {
      resolve({
        success: false,
        output: '',
        error: err.message,
      });
    });
  });
}
```

### Running npx Without .bin Directory

In packaged apps, `node_modules/.bin` doesn't exist. Call CLI scripts directly:

```typescript
// src/server/services/remotion-runner.ts
import { spawn } from 'child_process';
import * as path from 'path';
import * as os from 'os';

function findNodePath(): string {
  const home = os.homedir();
  const paths = [
    '/usr/local/bin/node',
    '/opt/homebrew/bin/node',
    path.join(home, '.nvm/versions/node/current/bin/node'),
  ];

  const fs = require('fs');
  for (const p of paths) {
    try {
      fs.accessSync(p, fs.constants.X_OK);
      return p;
    } catch {}
  }

  // In Electron, process.execPath is the Electron binary
  // which can run Node.js code
  return process.execPath;
}

function getAppRoot(): string {
  if (process.env.ELECTRON_APP_ROOT) {
    return path.join(process.env.ELECTRON_APP_ROOT, '..');
  }
  return process.cwd();
}

export async function runRemotionRender(args: string[]): Promise<void> {
  const nodePath = findNodePath();
  const appRoot = getAppRoot();

  // Call CLI script directly instead of using npx
  const remotionCli = path.join(appRoot, 'node_modules/@remotion/cli/remotion-cli.js');

  const fullCommand = `"${nodePath}" "${remotionCli}" ${args.map((a) => `"${a}"`).join(' ')}`;

  return new Promise((resolve, reject) => {
    const proc = spawn('/bin/bash', ['-c', fullCommand], {
      cwd: appRoot, // Must run from where node_modules is
      env: { ...process.env },
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Render failed with code ${code}`));
      }
    });

    proc.on('error', reject);
  });
}
```

## IPC Handler for CLI Detection

```typescript
// electron/ipc-handlers.ts
import { ipcMain } from 'electron';
import { detectClaudeCli, detectNode, detectNpx } from './cli-detector';

export function registerCliHandlers(): void {
  ipcMain.handle('cli:detect-claude', async () => {
    const result = await detectClaudeCli();
    // Store path for server to use
    if (result.found && result.path) {
      process.env.CLAUDE_PATH = result.path;
    }
    return result;
  });

  ipcMain.handle('cli:detect-node', async () => {
    return detectNode();
  });

  ipcMain.handle('cli:detect-npx', async () => {
    return detectNpx();
  });

  ipcMain.handle('cli:detect-all', async () => {
    const [claude, node, npx] = await Promise.all([
      detectClaudeCli(),
      detectNode(),
      detectNpx(),
    ]);
    return { claude, node, npx };
  });
}
```

## CLI Status Display Component

```typescript
// src/client/components/CliStatus.tsx
import React, { useEffect, useState } from 'react';
import { useElectron } from '../hooks/useElectron';

interface CliInfo {
  found: boolean;
  path?: string;
  version?: string;
  error?: string;
}

export function CliStatus() {
  const { isElectron, invoke } = useElectron();
  const [status, setStatus] = useState<Record<string, CliInfo>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detect() {
      if (!isElectron) return;

      const result = await invoke<Record<string, CliInfo>>('cli:detect-all');
      if (result) {
        setStatus(result);
      }
      setLoading(false);
    }

    detect();
  }, [isElectron, invoke]);

  if (!isElectron) return null;
  if (loading) return <div>Detecting CLI tools...</div>;

  return (
    <div className="cli-status">
      <h3>CLI Tools</h3>
      {Object.entries(status).map(([name, info]) => (
        <div key={name} className={`cli-item ${info.found ? 'found' : 'missing'}`}>
          <span className="cli-name">{name}</span>
          {info.found ? (
            <>
              <span className="cli-version">{info.version}</span>
              <span className="cli-path" title={info.path}>
                {info.path}
              </span>
            </>
          ) : (
            <span className="cli-error">{info.error}</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Startup Detection

```typescript
// electron/main.ts
import { detectClaudeCli } from './cli-detector';

async function initializeCli(): Promise<void> {
  // Auto-detect Claude CLI at startup
  try {
    const cliStatus = await detectClaudeCli();
    if (cliStatus.found && cliStatus.path) {
      process.env.CLAUDE_PATH = cliStatus.path;
      console.log(`Claude CLI found at: ${cliStatus.path}`);
    } else {
      console.warn('Claude CLI not found:', cliStatus.error);
    }
  } catch (error) {
    console.error('Error detecting Claude CLI:', error);
  }
}

app.whenReady().then(async () => {
  await initializeCli();
  // ... rest of startup
});
```

## Anti-Patterns

```typescript
// NEVER do these:

// 1. Assume PATH is complete
spawn('claude', ['--version']); // Fails from Finder!

// 2. Use npx in packaged apps
spawn('npx', ['remotion', 'render']); // .bin doesn't exist!

// 3. Use process.cwd() as working directory
spawn('node', ['script.js'], { cwd: process.cwd() }); // Returns "/" !

// 4. Hardcode paths
const claudePath = '/usr/local/bin/claude'; // May not exist!
```

## Integration

Used by:
- `electron-converter` agent
- `electron-security` skill
