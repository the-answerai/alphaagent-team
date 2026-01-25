# AlphaAgent Team Plugin Marketplace - Implementation Plan

> **Mission**: Create a centralized, public marketplace of Claude Code plugins that AlphaAgent can read, suggest, and install into projects.

---

## Executive Summary

This repository serves as the **source of truth** for all generic AAI plugins. AlphaAgent will:
1. Read this repo in real-time for plugin discovery
2. Auto-suggest plugins based on detected project stack
3. Install plugins by copying to project's `.claude/` directory
4. (Future) Customize plugins for specific project needs

**Note**: Project-specific plugins (aai-flowise, aai-data-sidekick, etc.) stay in their respective repos. This marketplace contains only generic, reusable plugins.

---

## Critical: Documentation-First Approach

Before creating ANY plugin, always fetch the latest Claude Code documentation:

```
WebFetch: https://code.claude.com/docs/en/plugins.md
WebFetch: https://code.claude.com/docs/en/plugins-reference.md
WebFetch: https://code.claude.com/docs/en/skills.md
WebFetch: https://code.claude.com/docs/en/sub-agents.md
WebFetch: https://code.claude.com/docs/en/hooks.md
```

See [docs/CLAUDE_CODE_DOCS.md](./docs/CLAUDE_CODE_DOCS.md) for complete reference.

---

## Plugin Inventory

### Total: 30 Generic Plugins

| Category | Count | Plugins |
|----------|-------|---------|
| **Workflow** | 2 | aai-core, aai-hooks |
| **PM** | 3 | aai-pm-linear, aai-pm-jira, aai-pm-github |
| **Dev Agents** | 4 | aai-dev-frontend, aai-dev-backend, aai-dev-database, aai-dev-fullstack |
| **Stack Skills** | 15 | react, nextjs, vite, express, node, typescript, postgres, sqlite, prisma, typeorm, tailwind, material-ui, playwright, jest, auth0 |
| **Specialized** | 5 | aai-testing, aai-architecture, aai-docs, aai-blog, aai-devops |
| **Quality** | 1 | aai-quality |

---

## Complete Plugin Specifications

### 1. WORKFLOW PLUGINS

#### aai-core
**Purpose**: Core development workflow - git, PRs, code review

**Commands**:
| Command | Description |
|---------|-------------|
| `/aai-core:push` | Commit, push, create/update PR |
| `/aai-core:review` | Code review workflow |
| `/aai-core:cleanup` | Repository cleanup |

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `code-reviewer` | sonnet | Code quality analysis |
| `git-pr-manager` | sonnet | PR creation and management |
| `git-pr-reviewer` | opus | PR review with security checks |

**Skills**:
- `branch-workflow` - Branch lifecycle and validation
- `commit-helper` - Conventional commits
- `pr-description-generator` - Auto-generate PR descriptions
- `pr-review-workflow` - Review methodology

**MCPs**: None required

---

#### aai-hooks
**Purpose**: Standard hook scripts for all projects

**PreToolUse Hooks**:
| Script | Matcher | Description |
|--------|---------|-------------|
| `block-master-commits.cjs` | `git commit/push/merge` | Block commits to main/master |
| `block-wrong-package-manager.cjs` | `Bash npm` | Enforce correct package manager |
| `block-protected-files.cjs` | `Write\|Edit` | Protect critical files |
| `inject-project-context.cjs` | `Bash` | Inject PROJECT_CONTEXT |
| `require-verification.cjs` | `git commit` | Require test verification |
| `validate-completion-claims.cjs` | `git commit` | Validate claims match reality |

**PostToolUse Hooks**:
| Script | Matcher | Description |
|--------|---------|-------------|
| `prettier-format.cjs` | `Write\|Edit` | Auto-format on edit |

**SubagentStop Hooks**:
| Script | Description |
|--------|-------------|
| `validate-anti-patterns.cjs` | Check for anti-patterns |

**Stop Hooks**:
| Script | Description |
|--------|-------------|
| `validate-session-end.cjs` | Full validation on session end |

**MCPs**: None required

---

### 2. PM PLUGINS

#### aai-pm-linear
**Purpose**: Linear ticket management workflow

**Commands**:
| Command | Description |
|---------|-------------|
| `/aai-pm-linear:ticket-create` | Create Linear ticket |
| `/aai-pm-linear:ticket-start` | Start work on ticket, create branch |
| `/aai-pm-linear:ticket-triage` | Triage tickets |

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `linear-ticket-creator` | sonnet | Create tickets with exploration |
| `linear-ticket-planner` | sonnet | Plan implementation from ticket |
| `linear-ticket-optimizer` | sonnet | Improve ticket quality |
| `linear-ticket-triager` | sonnet | Triage and organize tickets |

**Skills**:
- `ticket-planning-workflow` - Planning methodology
- `ticket-status-sync` - Sync status with Linear
- `ticket-duplicate-detection` - Find duplicates
- `linear-constants` - Pre-cached Linear config

**MCPs**: `linear-mcp` (REQUIRED)

---

#### aai-pm-jira
**Purpose**: Jira ticket management workflow

**Commands**:
| Command | Description |
|---------|-------------|
| `/aai-pm-jira:ticket-create` | Create Jira ticket |
| `/aai-pm-jira:ticket-start` | Start work on ticket |
| `/aai-pm-jira:ticket-triage` | Triage tickets |

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `jira-ticket-creator` | sonnet | Create Jira tickets |
| `jira-ticket-planner` | sonnet | Plan implementation |

**Skills**:
- `jira-workflow` - Jira-specific patterns
- `jira-status-sync` - Sync status with Jira

**MCPs**: `jira-mcp` (REQUIRED - TBD)

---

#### aai-pm-github
**Purpose**: GitHub Issues management

**Commands**:
| Command | Description |
|---------|-------------|
| `/aai-pm-github:issue-create` | Create GitHub issue |
| `/aai-pm-github:issue-triage` | Triage issues |
| `/aai-pm-github:issue-start` | Start work on issue |

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `github-issue-triager` | sonnet | Analyze and triage issues |
| `github-issue-creator` | sonnet | Create well-formed issues |

**Skills**:
- `github-issue-analysis` - Issue analysis methodology

**MCPs**: None (uses `gh` CLI)

---

### 3. DEV AGENT PLUGINS

#### aai-dev-frontend
**Purpose**: Frontend development agent

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `frontend-developer` | sonnet (configurable) | Expert React/Vue/Angular developer |

**Core Skills**:
- `component-architecture` - Component design patterns
- `state-management` - State management approaches
- `responsive-design` - Responsive/mobile patterns
- `accessibility-patterns` - A11y best practices

---

#### aai-dev-backend
**Purpose**: Backend development agent

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `backend-developer` | sonnet (configurable) | Expert Node.js/Express developer |

**Core Skills**:
- `api-design` - REST/GraphQL API design
- `authentication-patterns` - Auth implementation
- `error-handling` - Error handling patterns
- `middleware-patterns` - Middleware design

---

#### aai-dev-database
**Purpose**: Database development agent

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `database-developer` | sonnet (configurable) | Expert database developer |

**Core Skills**:
- `schema-design` - Database schema patterns
- `query-optimization` - Query performance
- `migration-patterns` - Migration best practices
- `data-modeling` - Data modeling approaches

---

#### aai-dev-fullstack
**Purpose**: Bundle of all dev agents

**Agents**: All agents from frontend, backend, database plugins

**Additional Skills**:
- `fullstack-patterns` - Full-stack coordination

---

### 4. STACK SKILL PLUGINS

#### aai-stack-react
**Auto-loads when**: `react` in dependencies

**Skills**:
- `react-patterns` - Component patterns, hooks, context
- `react-hooks` - Custom hooks, useEffect, useMemo
- `react-context` - Context API patterns
- `react-query-patterns` - TanStack Query usage
- `react-testing` - React Testing Library patterns

---

#### aai-stack-nextjs
**Auto-loads when**: `next` in dependencies

**Skills**:
- `nextjs-app-router` - App Router patterns
- `nextjs-server-components` - Server component patterns
- `nextjs-client-components` - Client component patterns
- `nextjs-api-routes` - API route handlers
- `nextjs-middleware` - Middleware patterns
- `nextjs-auth` - NextAuth.js / Auth.js patterns

---

#### aai-stack-vite
**Auto-loads when**: `vite` in dependencies

**Skills**:
- `vite-config` - Vite configuration
- `vite-plugins` - Plugin development
- `vite-hmr` - Hot module replacement

---

#### aai-stack-express
**Auto-loads when**: `express` in dependencies

**Skills**:
- `express-routing` - Route organization
- `express-middleware` - Middleware patterns
- `express-auth` - Authentication middleware
- `express-validation` - Input validation
- `express-error-handling` - Error handling

---

#### aai-stack-node
**Auto-loads when**: Node.js project detected

**Skills**:
- `node-streams` - Stream processing
- `node-async-patterns` - Async/await, promises
- `node-error-handling` - Error patterns
- `node-performance` - Performance optimization

---

#### aai-stack-typescript
**Auto-loads when**: `typescript` in devDependencies

**Skills**:
- `typescript-patterns` - TS best practices
- `typescript-generics` - Generic type patterns
- `typescript-utility-types` - Built-in utilities
- `typescript-inference` - Type inference

---

#### aai-stack-postgres
**Auto-loads when**: `pg` in dependencies

**Skills**:
- `postgres-queries` - Query patterns
- `postgres-indexes` - Index optimization
- `postgres-migrations` - Migration patterns
- `postgres-performance` - Performance tuning

---

#### aai-stack-sqlite
**Auto-loads when**: `better-sqlite3` or `sqlite3` in dependencies

**Skills**:
- `sqlite-patterns` - SQLite best practices
- `sqlite-optimization` - Performance optimization
- `better-sqlite3-patterns` - better-sqlite3 usage

---

#### aai-stack-prisma
**Auto-loads when**: `prisma` in dependencies

**Skills**:
- `prisma-schema` - Schema design
- `prisma-queries` - Query patterns
- `prisma-migrations` - Migration workflow
- `prisma-relations` - Relation modeling

---

#### aai-stack-typeorm
**Auto-loads when**: `typeorm` in dependencies

**Skills**:
- `typeorm-entities` - Entity definitions
- `typeorm-migrations` - Migration patterns
- `typeorm-queries` - QueryBuilder patterns

---

#### aai-stack-tailwind
**Auto-loads when**: `tailwindcss` in dependencies

**Skills**:
- `tailwind-patterns` - Utility-first patterns
- `tailwind-components` - Component styling
- `tailwind-responsive` - Responsive design

---

#### aai-stack-material-ui
**Auto-loads when**: `@mui/material` in dependencies

**Skills**:
- `mui-patterns` - MUI component usage
- `mui-theming` - Theme customization
- `mui-styling` - sx prop and styled()

---

#### aai-stack-playwright
**Auto-loads when**: `@playwright/test` in devDependencies

**Skills**:
- `playwright-selectors` - Selector strategies
- `playwright-assertions` - Assertion patterns
- `playwright-fixtures` - Test fixtures
- `playwright-debugging` - Debug workflow
- `playwright-visual-testing` - Visual regression

**MCPs**: `playwright` (recommended)

---

#### aai-stack-jest
**Auto-loads when**: `jest` in devDependencies

**Skills**:
- `jest-patterns` - Test organization
- `jest-mocking` - Mock patterns
- `jest-async` - Async testing
- `jest-coverage` - Coverage configuration

---

#### aai-stack-auth0
**Auto-loads when**: `@auth0/nextjs-auth0` or `auth0` in dependencies

**Skills**:
- `auth0-patterns` - Auth0 integration
- `auth0-nextjs` - NextAuth + Auth0
- `auth0-express` - Express + Auth0

---

### 5. SPECIALIZED PLUGINS

#### aai-testing
**Purpose**: Testing and QA agents

**Commands**:
| Command | Description |
|---------|-------------|
| `/aai-testing:fix-tests` | Debug and fix tests |
| `/aai-testing:coverage` | Analyze test coverage |

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `unit-test-specialist` | sonnet | Jest unit testing |
| `api-test-specialist` | sonnet | API integration testing |
| `e2e-test-specialist` | sonnet | Playwright E2E testing |
| `qa-specialist` | sonnet | Quality assurance |

**Skills**:
- `test-automation` - Test automation patterns
- `test-anti-pattern-detector` - Detect test smells
- `test-robustness` - Make tests robust
- `test-isolation-patterns` - Isolation strategies
- `api-test-checklist` - API test requirements

**MCPs**: `playwright` (recommended)

---

#### aai-architecture
**Purpose**: Architecture and design agents

**Commands**:
| Command | Description |
|---------|-------------|
| `/aai-architecture:plan-feature` | Plan feature implementation |
| `/aai-architecture:analyze-performance` | Performance analysis |
| `/aai-architecture:analyze-security` | Security analysis |

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `chief-architect` | opus | System design |
| `tech-lead` | sonnet | Technology decisions |
| `requirements-analyst` | sonnet | Requirements gathering |
| `ux-designer` | sonnet | UX/UI design |

**Skills**:
- `stack-detection` - Detect project stack
- `performance-optimization` - Performance patterns
- `security-analysis` - Security review

---

#### aai-docs
**Purpose**: Documentation agents

**Commands**:
| Command | Description |
|---------|-------------|
| `/aai-docs:audit` | Audit documentation |
| `/aai-docs:update-readme` | Update README |

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `documentation-curator` | haiku | Doc maintenance |
| `integration-docs-updater` | sonnet | Integration docs |

**Skills**:
- `documentation-workflow` - Doc patterns

---

#### aai-blog
**Purpose**: Blog and content writing

**Commands**:
| Command | Description |
|---------|-------------|
| `/aai-blog:write` | Write blog post |

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `blog-post-writer` | sonnet | Technical blog writing |

**Skills**:
- `blog-writing-workflow` - Blog methodology

---

#### aai-devops
**Purpose**: DevOps and deployment

**Commands**:
| Command | Description |
|---------|-------------|
| `/aai-devops:deploy` | Deployment workflow |
| `/aai-devops:status` | Project status |

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `ci-cd-engineer` | sonnet | CI/CD pipelines |
| `project-manager` | haiku | Project coordination |

**Skills**:
- `deployment-workflow` - Deploy patterns

---

### 6. QUALITY PLUGIN

#### aai-quality
**Purpose**: Quality governance and agent evaluation

**Agents**:
| Agent | Model | Description |
|-------|-------|-------------|
| `agent-evaluator` | sonnet | Evaluate agent performance |
| `quality-issues-maintainer` | sonnet | Track quality issues |
| `quality-lessons-maintainer` | sonnet | Track lessons learned |

**Skills**:
- `agent-performance-evaluation` - Evaluation methodology

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Core infrastructure and essential plugins

**Tasks**:
1. Repository Setup
   - [ ] Create directory structure
   - [ ] Add validation scripts
   - [ ] Add build-manifest script
   - [ ] Fetch latest Claude Code docs

2. aai-hooks Plugin
   - [ ] Port all hook scripts from AlphaAgent
   - [ ] Create hooks.json configuration
   - [ ] Test hooks work standalone

3. aai-core Plugin
   - [ ] Port git-pr-manager agent
   - [ ] Port git-pr-reviewer agent
   - [ ] Port code-reviewer agent
   - [ ] Port push, review, cleanup commands
   - [ ] Port branch-workflow, commit-helper skills

### Phase 2: PM Plugins (Week 1-2)
**Goal**: Project management integrations

4. aai-pm-linear Plugin
   - [ ] Port linear-ticket-creator agent
   - [ ] Port linear-ticket-planner agent
   - [ ] Port linear-ticket-optimizer agent
   - [ ] Port linear-ticket-triager agent
   - [ ] Port ticket commands
   - [ ] Port Linear skills

5. aai-pm-github Plugin
   - [ ] Port github-issue-triager agent
   - [ ] Create issue commands
   - [ ] Port github-issue-analysis skill

### Phase 3: Dev Agents (Week 2)
**Goal**: Core development agents

6. aai-dev-frontend Plugin
   - [ ] Port/create frontend-developer agent
   - [ ] Create core frontend skills

7. aai-dev-backend Plugin
   - [ ] Port/create backend-developer agent
   - [ ] Create core backend skills

8. aai-dev-database Plugin
   - [ ] Port/create database-developer agent
   - [ ] Create core database skills

9. aai-dev-fullstack Plugin
   - [ ] Bundle all dev agents
   - [ ] Create fullstack-patterns skill

### Phase 4: Stack Skills (Week 2-3)
**Goal**: Technology-specific skills (prioritized by usage)

10. Stack Plugins (Priority Order)
    - [ ] aai-stack-react
    - [ ] aai-stack-typescript
    - [ ] aai-stack-nextjs
    - [ ] aai-stack-express
    - [ ] aai-stack-postgres
    - [ ] aai-stack-prisma
    - [ ] aai-stack-playwright
    - [ ] aai-stack-jest
    - [ ] aai-stack-tailwind
    - [ ] aai-stack-material-ui
    - [ ] aai-stack-sqlite
    - [ ] aai-stack-vite
    - [ ] aai-stack-node
    - [ ] aai-stack-typeorm
    - [ ] aai-stack-auth0

### Phase 5: Specialized Plugins (Week 3)
**Goal**: Testing, architecture, docs, blog, devops

11. aai-testing Plugin
    - [ ] Port test specialists (unit, api, e2e)
    - [ ] Port qa-specialist
    - [ ] Port testing skills

12. aai-architecture Plugin
    - [ ] Port chief-architect agent
    - [ ] Port tech-lead agent
    - [ ] Port requirements-analyst agent
    - [ ] Port ux-designer agent
    - [ ] Port architecture skills

13. aai-docs Plugin
    - [ ] Port documentation-curator agent
    - [ ] Create documentation skills

14. aai-blog Plugin
    - [ ] Port blog-post-writer agent
    - [ ] Port blog-writing-workflow skill

15. aai-devops Plugin
    - [ ] Port ci-cd-engineer agent
    - [ ] Port project-manager agent
    - [ ] Port deployment skills

16. aai-quality Plugin
    - [ ] Port agent-evaluator
    - [ ] Port quality maintainers

### Phase 6: Validation & Pilot (Week 4)
**Goal**: Test with Data Sidekick

17. Validation
    - [ ] Run validation scripts on all plugins
    - [ ] Test all plugins load correctly
    - [ ] Generate plugin-manifest.json
    - [ ] Verify no conflicts

18. Data Sidekick Pilot
    - [ ] Install core plugins
    - [ ] Install relevant stack plugins
    - [ ] Test all commands work
    - [ ] Compare against current functionality
    - [ ] Document gaps and issues

### Phase 7: Rollout (Week 4+)
**Goal**: Deploy to all repos

19. Rollout
    - [ ] Apply to kumello
    - [ ] Apply to browser-sidekick
    - [ ] Apply to theanswer
    - [ ] Apply to alphaagent
    - [ ] Update AlphaAgent to read from this marketplace

---

## Directory Structure

```
alphaagent-team/
├── CLAUDE.md
├── README.md
├── CONTRIBUTING.md
├── IMPLEMENTATION_PLAN.md
├── plugin-manifest.json
│
├── docs/
│   └── CLAUDE_CODE_DOCS.md
│
├── plugins/
│   ├── aai-core/
│   ├── aai-hooks/
│   ├── aai-pm-linear/
│   ├── aai-pm-jira/
│   ├── aai-pm-github/
│   ├── aai-dev-frontend/
│   ├── aai-dev-backend/
│   ├── aai-dev-database/
│   ├── aai-dev-fullstack/
│   ├── aai-stack-react/
│   ├── aai-stack-nextjs/
│   ├── aai-stack-vite/
│   ├── aai-stack-express/
│   ├── aai-stack-node/
│   ├── aai-stack-typescript/
│   ├── aai-stack-postgres/
│   ├── aai-stack-sqlite/
│   ├── aai-stack-prisma/
│   ├── aai-stack-typeorm/
│   ├── aai-stack-tailwind/
│   ├── aai-stack-material-ui/
│   ├── aai-stack-playwright/
│   ├── aai-stack-jest/
│   ├── aai-stack-auth0/
│   ├── aai-testing/
│   ├── aai-architecture/
│   ├── aai-docs/
│   ├── aai-blog/
│   ├── aai-devops/
│   └── aai-quality/
│
├── shared/
│   └── templates/
│
└── scripts/
    ├── validate-plugins.js
    └── build-manifest.js
```

---

## Success Criteria

### Phase 1-5 Success
- [ ] All 30 plugins created with proper structure
- [ ] All plugins pass validation
- [ ] plugin-manifest.json generated correctly
- [ ] Documentation complete

### Pilot Success (Data Sidekick)
- [ ] All current commands work via new plugins
- [ ] All current agents available
- [ ] All current skills loaded
- [ ] No regressions in functionality
- [ ] Performance acceptable

### Rollout Success
- [ ] All repos using new plugin system
- [ ] Old .claude/ configs archived
- [ ] Team trained on new system
- [ ] AlphaAgent integration working

---

## What Stays in Project Repos

These project-specific patterns remain in their respective repos:

| Repo | Project-Specific Content |
|------|-------------------------|
| theanswer | Flowise components, multi-tenancy patterns, TheAnswer-specific rules |
| data-sidekick | Domain crawler patterns, CSV processing, AI tagging |
| browser-sidekick | Browser extension patterns |
| alphaagent | AlphaCoder database schema, session patterns, micro-app patterns |
| kumello | Kumello-specific patterns |

---

## Next Steps

1. **Approve this plan**
2. **Fetch latest Claude Code docs**
3. **Create Phase 1 plugins** (aai-hooks, aai-core)
4. **Test with Data Sidekick**
5. **Iterate and expand**

---

*Last Updated: 2025-01-24*
*Author: Claude Code + Brad Taylor*
