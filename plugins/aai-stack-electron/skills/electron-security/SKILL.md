---
name: electron-security
description: Secure IPC patterns, credential storage, and API key management for Electron apps
---

# Electron Security Skill

Security is critical in Electron apps. This skill covers secure IPC, credential storage, and protecting sensitive data.

## Secure IPC with contextBridge

NEVER expose Node.js directly to the renderer. Use contextBridge:

### Preload Script

```typescript
// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

// Define allowed channels
const validSendChannels = [
  'keychain:set',
  'keychain:delete',
  'cli:detect',
  'app:quit',
];

const validReceiveChannels = [
  'keychain:result',
  'cli:status',
  'update:available',
];

const validInvokeChannels = [
  'keychain:get',
  'keychain:set',
  'keychain:delete',
  'cli:detect-claude',
  'app:get-version',
  'app:get-paths',
];

contextBridge.exposeInMainWorld('electronAPI', {
  // Invoke pattern (request-response)
  invoke: (channel: string, ...args: unknown[]) => {
    if (validInvokeChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, ...args);
    }
    throw new Error(`Invalid channel: ${channel}`);
  },

  // Send pattern (fire-and-forget)
  send: (channel: string, ...args: unknown[]) => {
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, ...args);
    }
  },

  // Receive pattern (listen for events)
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    if (validReceiveChannels.includes(channel)) {
      const subscription = (_event: Electron.IpcRendererEvent, ...args: unknown[]) =>
        callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
    throw new Error(`Invalid channel: ${channel}`);
  },

  // One-time listener
  once: (channel: string, callback: (...args: unknown[]) => void) => {
    if (validReceiveChannels.includes(channel)) {
      ipcRenderer.once(channel, (_event, ...args) => callback(...args));
    }
  },
});
```

### TypeScript Declarations

```typescript
// src/client/types/electron.d.ts
export interface ElectronAPI {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  send: (channel: string, ...args: unknown[]) => void;
  on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
  once: (channel: string, callback: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
```

### React Hook for Electron API

```typescript
// src/client/hooks/useElectron.ts
import { useCallback, useEffect } from 'react';

export function useElectron() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  const invoke = useCallback(
    async <T>(channel: string, ...args: unknown[]): Promise<T | null> => {
      if (!isElectron) return null;
      try {
        return (await window.electronAPI!.invoke(channel, ...args)) as T;
      } catch (error) {
        console.error(`IPC invoke error on ${channel}:`, error);
        throw error;
      }
    },
    [isElectron]
  );

  const send = useCallback(
    (channel: string, ...args: unknown[]) => {
      if (isElectron) {
        window.electronAPI!.send(channel, ...args);
      }
    },
    [isElectron]
  );

  const on = useCallback(
    (channel: string, callback: (...args: unknown[]) => void) => {
      if (!isElectron) return () => {};
      return window.electronAPI!.on(channel, callback);
    },
    [isElectron]
  );

  return { isElectron, invoke, send, on };
}

// Keychain-specific hooks
export const KEY_NAMES = {
  ANTHROPIC_API_KEY: 'anthropic-api-key',
  GEMINI_API_KEY: 'gemini-api-key',
  OPENAI_API_KEY: 'openai-api-key',
} as const;

export function useKeychain() {
  const { isElectron, invoke } = useElectron();

  const getKey = async (keyName: string): Promise<string | null> => {
    if (!isElectron) return null;
    return invoke<string | null>('keychain:get', keyName);
  };

  const setKey = async (keyName: string, value: string): Promise<boolean> => {
    if (!isElectron) return false;
    return (await invoke<boolean>('keychain:set', keyName, value)) ?? false;
  };

  const deleteKey = async (keyName: string): Promise<boolean> => {
    if (!isElectron) return false;
    return (await invoke<boolean>('keychain:delete', keyName)) ?? false;
  };

  return { isElectron, getKey, setKey, deleteKey };
}
```

## Secure Credential Storage

### Main Process IPC Handlers

```typescript
// electron/ipc-handlers.ts
import { ipcMain, app } from 'electron';
import { getCredential, setCredential, deleteCredential, KEY_NAMES } from './keychain';

// Map keychain keys to environment variables
const KEY_TO_ENV: Record<string, string> = {
  [KEY_NAMES.ANTHROPIC_API_KEY]: 'ANTHROPIC_API_KEY',
  [KEY_NAMES.GEMINI_API_KEY]: 'GEMINI_API_KEY',
  [KEY_NAMES.OPENAI_API_KEY]: 'OPENAI_API_KEY',
};

export function registerIpcHandlers(): void {
  // Get credential from keychain
  ipcMain.handle('keychain:get', async (_event, keyName: string) => {
    return getCredential(keyName);
  });

  // Set credential in keychain AND environment
  ipcMain.handle('keychain:set', async (_event, keyName: string, value: string) => {
    const result = await setCredential(keyName, value);
    // Also set as environment variable so server can use it immediately
    if (result && KEY_TO_ENV[keyName]) {
      process.env[KEY_TO_ENV[keyName]] = value;
    }
    return result;
  });

  // Delete credential from keychain AND environment
  ipcMain.handle('keychain:delete', async (_event, keyName: string) => {
    const result = await deleteCredential(keyName);
    if (result && KEY_TO_ENV[keyName]) {
      delete process.env[KEY_TO_ENV[keyName]];
    }
    return result;
  });

  // App info
  ipcMain.handle('app:get-version', () => app.getVersion());
  ipcMain.handle('app:get-paths', () => ({
    userData: app.getPath('userData'),
    temp: app.getPath('temp'),
  }));
}
```

### Load Credentials at Startup

```typescript
// electron/main.ts
import { app } from 'electron';
import { getCredential, KEY_NAMES } from './keychain';

async function loadCredentials(): Promise<void> {
  const keyMappings = [
    { key: KEY_NAMES.ANTHROPIC_API_KEY, env: 'ANTHROPIC_API_KEY' },
    { key: KEY_NAMES.GEMINI_API_KEY, env: 'GEMINI_API_KEY' },
    { key: KEY_NAMES.OPENAI_API_KEY, env: 'OPENAI_API_KEY' },
  ];

  for (const { key, env } of keyMappings) {
    try {
      const value = await getCredential(key);
      if (value) {
        process.env[env] = value;
        console.log(`Loaded ${key} from keychain`);
      }
    } catch (error) {
      console.error(`Failed to load ${key}:`, error);
    }
  }
}

app.whenReady().then(async () => {
  await loadCredentials();
  // ... rest of startup
});
```

## Settings UI Component

```typescript
// src/client/pages/Settings.tsx
import React, { useState, useEffect } from 'react';
import { useKeychain, KEY_NAMES } from '../hooks/useElectron';

interface KeyConfig {
  name: string;
  keyName: string;
  placeholder: string;
}

const API_KEYS: KeyConfig[] = [
  {
    name: 'Anthropic API Key',
    keyName: KEY_NAMES.ANTHROPIC_API_KEY,
    placeholder: 'sk-ant-...',
  },
  {
    name: 'Google Gemini API Key',
    keyName: KEY_NAMES.GEMINI_API_KEY,
    placeholder: 'AIza...',
  },
];

export function Settings() {
  const { isElectron, getKey, setKey, deleteKey } = useKeychain();
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadKeys() {
      if (!isElectron) return;

      const loaded: Record<string, string> = {};
      const savedState: Record<string, boolean> = {};

      for (const key of API_KEYS) {
        const value = await getKey(key.keyName);
        if (value) {
          loaded[key.keyName] = '••••••••••••' + value.slice(-4);
          savedState[key.keyName] = true;
        }
      }

      setValues(loaded);
      setSaved(savedState);
      setLoading(false);
    }

    loadKeys();
  }, [isElectron, getKey]);

  const handleSave = async (keyName: string, value: string) => {
    if (!value.startsWith('••••')) {
      const success = await setKey(keyName, value);
      if (success) {
        setValues((prev) => ({
          ...prev,
          [keyName]: '••••••••••••' + value.slice(-4),
        }));
        setSaved((prev) => ({ ...prev, [keyName]: true }));
      }
    }
  };

  const handleDelete = async (keyName: string) => {
    const success = await deleteKey(keyName);
    if (success) {
      setValues((prev) => ({ ...prev, [keyName]: '' }));
      setSaved((prev) => ({ ...prev, [keyName]: false }));
    }
  };

  if (!isElectron) {
    return <div>Settings are only available in the desktop app.</div>;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <section>
        <h2>API Keys</h2>
        <p>Your API keys are stored securely in your system keychain.</p>

        {API_KEYS.map((key) => (
          <div key={key.keyName} className="key-input-group">
            <label>{key.name}</label>
            <input
              type="password"
              placeholder={key.placeholder}
              value={values[key.keyName] || ''}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, [key.keyName]: e.target.value }))
              }
            />
            <button onClick={() => handleSave(key.keyName, values[key.keyName] || '')}>
              Save
            </button>
            {saved[key.keyName] && (
              <button onClick={() => handleDelete(key.keyName)}>Delete</button>
            )}
            {saved[key.keyName] && <span className="saved-badge">Saved</span>}
          </div>
        ))}
      </section>
    </div>
  );
}
```

## Navigation Security

Prevent navigation to untrusted URLs:

```typescript
// electron/main.ts
app.on('web-contents-created', (_, contents) => {
  // Block navigation to external URLs
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const allowedOrigins = ['localhost', '127.0.0.1'];

    if (!allowedOrigins.includes(parsedUrl.hostname)) {
      event.preventDefault();
      console.warn('Blocked navigation to:', navigationUrl);
    }
  });

  // Block new window creation
  contents.setWindowOpenHandler(({ url }) => {
    // Open external links in default browser
    if (url.startsWith('https://')) {
      require('electron').shell.openExternal(url);
    }
    return { action: 'deny' };
  });
});
```

## BrowserWindow Security Settings

```typescript
// electron/window.ts
import { BrowserWindow } from 'electron';

export function createMainWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // CRITICAL: Enable context isolation
      contextIsolation: true,

      // CRITICAL: Disable Node.js integration in renderer
      nodeIntegration: false,

      // Use preload script for IPC
      preload: preloadPath,

      // Disable remote module
      enableRemoteModule: false,

      // Sandbox renderer process
      sandbox: true,

      // Disable webview tag
      webviewTag: false,
    },
  });

  return win;
}
```

## Anti-Patterns

```typescript
// NEVER do these:

// 1. Expose ipcRenderer directly
contextBridge.exposeInMainWorld('ipc', ipcRenderer); // DANGEROUS!

// 2. Allow any channel
ipcRenderer.invoke(anyUserProvidedChannel); // DANGEROUS!

// 3. Eval user input
eval(userInput); // DANGEROUS!

// 4. Disable security features
webPreferences: {
  nodeIntegration: true, // DANGEROUS!
  contextIsolation: false, // DANGEROUS!
}

// 5. Store credentials in localStorage
localStorage.setItem('apiKey', key); // Use keychain instead!
```

## Integration

Used by:
- `electron-converter` agent
- Settings page implementation
