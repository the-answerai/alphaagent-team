---
name: stack-detection
description: Detect project technology stack from package.json, config files, and code patterns. Use this skill FIRST before writing any technology-specific code to prevent hallucinations.
auto_load: all
priority: high
---

# Stack Detection Skill

This skill provides patterns for detecting a project's technology stack to ensure agents use the correct technology-specific patterns.

## Why Stack Detection Matters

**Problem**: Agents with hardcoded technology examples will hallucinate incorrect code for projects using different technologies.

**Solution**: Always detect the project's actual technology stack BEFORE writing any code.

## Detection Process

### Step 1: Read package.json

```bash
# Check for package.json
cat package.json 2>/dev/null || echo "No package.json found"
```

### Step 2: Parse Dependencies

Examine `dependencies` and `devDependencies` for technology indicators.

### Step 3: Check Config Files

Look for framework-specific configuration files.

### Step 4: Examine Existing Code

Check existing patterns in the codebase.

---

## Frontend Framework Detection

### React
```
Indicators:
- package.json: "react", "react-dom"
- Files: jsx/tsx extensions, React imports
- Config: None required (bundler handles it)

Sub-frameworks:
- "next" → Next.js (App Router if app/ exists, Pages Router if pages/)
- "gatsby" → Gatsby
- "remix" → Remix
- "@tanstack/react-router" → TanStack Router
```

### Vue
```
Indicators:
- package.json: "vue"
- Files: .vue extensions
- Config: vite.config with Vue plugin, or vue.config.js

Sub-frameworks:
- "nuxt" → Nuxt 3
- "nuxt-bridge" → Nuxt Bridge
```

### Angular
```
Indicators:
- package.json: "@angular/core"
- Files: .component.ts, .module.ts, .service.ts
- Config: angular.json
```

### Svelte
```
Indicators:
- package.json: "svelte"
- Files: .svelte extensions
- Config: svelte.config.js

Sub-frameworks:
- "@sveltejs/kit" → SvelteKit
```

### SolidJS
```
Indicators:
- package.json: "solid-js"
- Config: vite.config with Solid plugin
```

---

## Backend Framework Detection

### Express
```
Indicators:
- package.json: "express"
- Files: app.use(), app.get(), Router()
```

### Fastify
```
Indicators:
- package.json: "fastify"
- Files: fastify.register(), fastify.get()
```

### NestJS
```
Indicators:
- package.json: "@nestjs/core"
- Files: @Controller(), @Injectable(), @Module() decorators
- Config: nest-cli.json
```

### Hono
```
Indicators:
- package.json: "hono"
- Files: new Hono(), app.get()
```

### Koa
```
Indicators:
- package.json: "koa"
- Files: new Koa(), ctx.body
```

### Next.js API Routes
```
Indicators:
- package.json: "next"
- Files: app/api/*/route.ts (App Router) or pages/api/*.ts (Pages Router)
```

---

## Database & ORM Detection

### Prisma
```
Indicators:
- package.json: "prisma", "@prisma/client"
- Files: prisma/schema.prisma
- Config: prisma/schema.prisma

Usage patterns:
- prisma.model.findMany()
- PrismaClient import
```

### TypeORM
```
Indicators:
- package.json: "typeorm"
- Files: @Entity(), @Column() decorators
- Config: ormconfig.json, data-source.ts

Usage patterns:
- getRepository()
- createQueryBuilder()
```

### Drizzle
```
Indicators:
- package.json: "drizzle-orm"
- Files: drizzle/ directory, *.schema.ts
- Config: drizzle.config.ts

Usage patterns:
- db.select().from()
- pgTable(), mysqlTable()
```

### Sequelize
```
Indicators:
- package.json: "sequelize"
- Files: Model.define(), sequelize.define()
- Config: .sequelizerc
```

### Knex
```
Indicators:
- package.json: "knex"
- Config: knexfile.js, knexfile.ts

Usage patterns:
- knex('table').select()
- knex.schema.createTable()
```

### Database Type
```
PostgreSQL:
- DATABASE_URL contains "postgresql://" or "postgres://"
- package.json: "pg"

MySQL:
- DATABASE_URL contains "mysql://"
- package.json: "mysql2"

SQLite:
- DATABASE_URL contains "file:" or ".db"
- package.json: "better-sqlite3", "sqlite3"
- Files: *.db, *.sqlite files

MongoDB:
- DATABASE_URL contains "mongodb://"
- package.json: "mongodb", "mongoose"
```

---

## State Management Detection

### React State Libraries
```
Redux:
- package.json: "@reduxjs/toolkit", "redux"
- Files: createSlice(), configureStore()

Zustand:
- package.json: "zustand"
- Files: create() from zustand

Jotai:
- package.json: "jotai"
- Files: atom(), useAtom()

TanStack Query:
- package.json: "@tanstack/react-query"
- Files: useQuery(), useMutation()

Recoil:
- package.json: "recoil"
- Files: atom(), selector(), useRecoilState()
```

### Vue State Libraries
```
Pinia:
- package.json: "pinia"
- Files: defineStore()

Vuex:
- package.json: "vuex"
- Files: createStore(), mapState()
```

---

## Styling Detection

### Tailwind CSS
```
Indicators:
- package.json: "tailwindcss"
- Config: tailwind.config.js, tailwind.config.ts
- Files: className with utility classes (flex, p-4, text-lg)
```

### CSS-in-JS
```
Styled Components:
- package.json: "styled-components"
- Files: styled.div``, css``

Emotion:
- package.json: "@emotion/react", "@emotion/styled"
- Files: css``, styled()
```

### Component Libraries
```
Material UI:
- package.json: "@mui/material"

Chakra UI:
- package.json: "@chakra-ui/react"

Radix UI:
- package.json: "@radix-ui/*"

shadcn/ui:
- Files: components/ui/ directory with Radix-based components

Ant Design:
- package.json: "antd"
```

### CSS Modules
```
Indicators:
- Files: *.module.css, *.module.scss
- Imports: import styles from './Component.module.css'
```

---

## Testing Framework Detection

### Unit Testing
```
Jest:
- package.json: "jest"
- Config: jest.config.js, jest.config.ts
- Files: *.test.ts, *.spec.ts with describe/it/expect

Vitest:
- package.json: "vitest"
- Config: vitest.config.ts
- Files: Same as Jest but often in vitest-specific config

Mocha:
- package.json: "mocha"
- Config: .mocharc.js, .mocharc.json
- Often with "chai" for assertions
```

### E2E Testing
```
Playwright:
- package.json: "@playwright/test"
- Config: playwright.config.ts
- Files: *.spec.ts in e2e/ or tests/

Cypress:
- package.json: "cypress"
- Config: cypress.config.ts, cypress.json
- Files: cypress/ directory with e2e/, support/
```

---

## Validation Library Detection

```
Zod:
- package.json: "zod"
- Files: z.object(), z.string()

Yup:
- package.json: "yup"
- Files: yup.object(), yup.string()

Joi:
- package.json: "joi"
- Files: Joi.object(), Joi.string()

class-validator (NestJS):
- package.json: "class-validator"
- Files: @IsString(), @IsEmail() decorators
```

---

## Build Tool Detection

```
Vite:
- package.json: "vite"
- Config: vite.config.ts

Webpack:
- package.json: "webpack"
- Config: webpack.config.js

esbuild:
- package.json: "esbuild"
- Often used through other tools

Turbopack:
- Next.js 13+ with --turbo flag
```

---

## Detection Script

Run this detection process before writing code:

```markdown
## Stack Detection Checklist

1. [ ] Read package.json dependencies
2. [ ] Check for framework config files
3. [ ] Examine existing code patterns
4. [ ] Document detected stack:
   - Frontend: _______________
   - Backend: _______________
   - Database/ORM: _______________
   - Testing: _______________
   - Styling: _______________
   - Validation: _______________
5. [ ] Use ONLY detected technology patterns
```

---

## Usage in Agents

### Before Writing Code

```
1. Read package.json
2. Identify all relevant technologies
3. Load appropriate technology-specific skills
4. Use ONLY patterns from detected stack
5. NEVER assume technology - verify first
```

### If Technology Not Detected

```
1. Ask user to clarify technology stack
2. Check for alternative indicators
3. Default to minimal assumptions
4. Explain any assumptions made
```

---

## Common Mistakes to Avoid

1. **Assuming React** - Check first, could be Vue/Angular/Svelte
2. **Assuming Prisma** - Check first, could be TypeORM/Drizzle/raw SQL
3. **Assuming Jest** - Check first, could be Vitest/Mocha
4. **Assuming Tailwind** - Check first, could be CSS modules/styled-components
5. **Assuming Express** - Check first, could be Fastify/NestJS/Hono

---

## Related Skills

Load technology-specific skills after detection:
- `react-patterns` for React projects
- `vue-patterns` for Vue projects
- `prisma-patterns` for Prisma projects
- `typeorm-patterns` for TypeORM projects
- `jest-patterns` for Jest projects
- `playwright-patterns` for Playwright projects
- `tailwind-patterns` for Tailwind projects
