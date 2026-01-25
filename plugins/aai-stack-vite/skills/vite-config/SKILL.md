---
name: vite-config
description: Vite configuration patterns
user-invocable: false
---

# Vite Configuration Skill

Patterns for configuring Vite projects.

## Basic Configuration

### Minimal Config

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### Full Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // Root directory
  root: process.cwd(),

  // Base public path
  base: '/',

  // Public assets directory
  publicDir: 'public',

  // Cache directory
  cacheDir: 'node_modules/.vite',

  // Environment variables prefix
  envPrefix: 'VITE_',

  // Resolve options
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },

  // CSS options
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },

  // JSON options
  json: {
    namedExports: true,
    stringify: false,
  },

  // esbuild options
  esbuild: {
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
    jsxInject: `import React from 'react'`,
  },
})
```

## Server Configuration

### Dev Server

```typescript
export default defineConfig({
  server: {
    host: 'localhost',
    port: 3000,
    strictPort: true,  // Fail if port is in use
    open: true,        // Open browser on start

    // HTTPS
    https: {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem'),
    },

    // Proxy configuration
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/socket.io': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },

    // CORS
    cors: true,

    // Headers
    headers: {
      'X-Custom-Header': 'value',
    },

    // File watching
    watch: {
      usePolling: true,  // For Docker/WSL
      interval: 100,
    },
  },
})
```

### Preview Server

```typescript
export default defineConfig({
  preview: {
    host: 'localhost',
    port: 4173,
    strictPort: true,
    open: true,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
```

## Build Configuration

### Build Options

```typescript
export default defineConfig({
  build: {
    // Output directory
    outDir: 'dist',

    // Assets directory (relative to outDir)
    assetsDir: 'assets',

    // Inline assets smaller than this (bytes)
    assetsInlineLimit: 4096,

    // CSS code splitting
    cssCodeSplit: true,

    // Minification
    minify: 'esbuild',  // or 'terser'

    // Source maps
    sourcemap: true,  // or 'inline' | 'hidden'

    // Target browsers
    target: 'esnext',

    // Rollup options
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        nested: path.resolve(__dirname, 'nested/index.html'),
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
        // Asset file naming
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
      external: ['some-external-lib'],
    },

    // Library mode
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'MyLib',
      formats: ['es', 'umd'],
      fileName: (format) => `my-lib.${format}.js`,
    },

    // Empty outDir before build
    emptyOutDir: true,

    // Chunk size warning limit (KB)
    chunkSizeWarningLimit: 500,
  },
})
```

### Terser Options

```typescript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
  },
})
```

## Environment Variables

### Configuration

```typescript
// .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App

// .env.development
VITE_API_URL=http://localhost:8080

// .env.production
VITE_API_URL=https://api.production.com
```

### Usage

```typescript
// In code
const apiUrl = import.meta.env.VITE_API_URL

// Type declarations
// env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### Conditional Config

```typescript
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    define: {
      __APP_VERSION__: JSON.stringify(env.npm_package_version),
    },

    ...(command === 'serve' ? {
      // Dev-specific config
    } : {
      // Build-specific config
    }),

    ...(mode === 'production' ? {
      build: {
        sourcemap: false,
      },
    } : {}),
  }
})
```

## Path Aliases

### TypeScript Support

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Worker Configuration

```typescript
export default defineConfig({
  worker: {
    format: 'es',  // or 'iife'
    plugins: [],
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
