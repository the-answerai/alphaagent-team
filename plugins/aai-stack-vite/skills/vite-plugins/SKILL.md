---
name: vite-plugins
description: Vite plugins and ecosystem
user-invocable: false
---

# Vite Plugins Skill

Patterns for using and creating Vite plugins.

## Official Plugins

### React Plugin

```bash
npm install @vitejs/plugin-react
```

```typescript
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // Babel options
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
      // Fast Refresh options
      fastRefresh: true,
      // JSX runtime
      jsxRuntime: 'automatic',
    }),
  ],
})
```

### Legacy Browser Support

```bash
npm install @vitejs/plugin-legacy
```

```typescript
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
      polyfills: ['es.promise', 'es.array.iterator'],
    }),
  ],
})
```

## Community Plugins

### SVG as Components

```bash
npm install vite-plugin-svgr
```

```typescript
import svgr from 'vite-plugin-svgr'

export default defineConfig({
  plugins: [
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),
  ],
})

// Usage
import { ReactComponent as Logo } from './logo.svg'
// or
import Logo from './logo.svg?react'
```

### Auto Import

```bash
npm install unplugin-auto-import
```

```typescript
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ['react', 'react-router-dom'],
      dts: './src/auto-imports.d.ts',
    }),
  ],
})
```

### Component Auto Import

```bash
npm install unplugin-react-components
```

```typescript
import Components from 'unplugin-react-components/vite'

export default defineConfig({
  plugins: [
    Components({
      dirs: ['src/components'],
      dts: './src/components.d.ts',
    }),
  ],
})
```

### PWA Plugin

```bash
npm install vite-plugin-pwa
```

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My App',
        short_name: 'App',
        theme_color: '#ffffff',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
})
```

### Environment Variables

```bash
npm install vite-plugin-env-compatible
```

```typescript
import envCompatible from 'vite-plugin-env-compatible'

export default defineConfig({
  plugins: [
    envCompatible({
      prefix: 'REACT_APP',  // Support CRA env vars
    }),
  ],
})
```

### Compression

```bash
npm install vite-plugin-compression
```

```typescript
import compression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ],
})
```

### Bundle Analyzer

```bash
npm install rollup-plugin-visualizer
```

```typescript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      filename: 'stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
})
```

## Creating Custom Plugins

### Plugin Structure

```typescript
import type { Plugin } from 'vite'

function myPlugin(): Plugin {
  return {
    name: 'my-plugin',

    // Plugin hooks

    // Called when config is resolved
    configResolved(config) {
      console.log('Config resolved:', config)
    },

    // Transform source code
    transform(code, id) {
      if (id.endsWith('.custom')) {
        return {
          code: transformCustomFile(code),
          map: null,
        }
      }
    },

    // Handle virtual modules
    resolveId(id) {
      if (id === 'virtual:my-module') {
        return '\0virtual:my-module'
      }
    },

    load(id) {
      if (id === '\0virtual:my-module') {
        return 'export default "Hello from virtual module"'
      }
    },

    // Modify HTML
    transformIndexHtml(html) {
      return html.replace(
        '</head>',
        '<script>console.log("injected")</script></head>'
      )
    },
  }
}

export default defineConfig({
  plugins: [myPlugin()],
})
```

### Hooks Reference

```typescript
interface Plugin {
  // Vite-specific hooks
  config?: (config, env) => UserConfig | null | void
  configResolved?: (config) => void
  configureServer?: (server) => void | (() => void)
  configurePreviewServer?: (server) => void | (() => void)
  transformIndexHtml?: (html, ctx) => string | HtmlTagDescriptor[]
  handleHotUpdate?: (ctx) => ModuleNode[] | void

  // Rollup hooks (build-time)
  options?: (options) => InputOptions | null
  buildStart?: (options) => void
  resolveId?: (source, importer) => ResolveIdResult
  load?: (id) => LoadResult
  transform?: (code, id) => TransformResult
  buildEnd?: (error?) => void
  closeBundle?: () => void

  // Rollup hooks (output generation)
  outputOptions?: (options) => OutputOptions | null
  renderStart?: (outputOptions, inputOptions) => void
  augmentChunkHash?: (chunkInfo) => string | void
  renderChunk?: (code, chunk, options) => RenderChunkResult
  generateBundle?: (options, bundle) => void
  writeBundle?: (options, bundle) => void
}
```

### Dev Server Middleware

```typescript
function apiMockPlugin(): Plugin {
  return {
    name: 'api-mock',

    configureServer(server) {
      server.middlewares.use('/api/mock', (req, res, next) => {
        if (req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ mock: true }))
          return
        }
        next()
      })
    },
  }
}
```

### Hot Module Replacement

```typescript
function hmrPlugin(): Plugin {
  return {
    name: 'hmr-plugin',

    handleHotUpdate({ file, server, modules }) {
      if (file.endsWith('.config.json')) {
        server.ws.send({
          type: 'custom',
          event: 'config-update',
          data: { file },
        })
        return []  // Don't trigger default HMR
      }
    },
  }
}

// Client-side
if (import.meta.hot) {
  import.meta.hot.on('config-update', (data) => {
    console.log('Config updated:', data.file)
    location.reload()
  })
}
```

## Plugin Ordering

```typescript
export default defineConfig({
  plugins: [
    // Plugins run in order
    // Use enforce to control order

    { ...myPlugin(), enforce: 'pre' },   // Run before core plugins
    react(),                              // Normal order
    { ...otherPlugin(), enforce: 'post' }, // Run after core plugins
  ],
})
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
