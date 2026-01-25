# AlphaAgent Team Plugin Marketplace

> A curated collection of Claude Code plugins for autonomous coding assistance.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Quick Install

```shell
# 1. Add the marketplace
/plugin marketplace add the-answerai/alphaagent-team

# 2. Install plugins you need
/plugin install aai-core@alphaagent-team
/plugin install aai-hooks@alphaagent-team
```

## What's Included

**30 plugins** organized into categories:

| Category | Plugins | Description |
|----------|---------|-------------|
| **Workflow** | `aai-core`, `aai-hooks` | Git operations, PR management, validation hooks |
| **PM** | `aai-pm-linear`, `aai-pm-jira`, `aai-pm-github` | Ticket/issue management |
| **Dev Agents** | `aai-dev-frontend`, `aai-dev-backend`, `aai-dev-database`, `aai-dev-fullstack` | Technology-agnostic development agents |
| **Stack Skills** | 15 plugins | Technology-specific patterns (React, Next.js, Express, etc.) |
| **Specialized** | `aai-testing`, `aai-architecture`, `aai-docs`, `aai-blog`, `aai-devops`, `aai-quality` | Specialized agents |

## Installation Guide

### Step 1: Add the Marketplace

In Claude Code, run:

```shell
/plugin marketplace add the-answerai/alphaagent-team
```

### Step 2: Browse Available Plugins

```shell
/plugin
```

Navigate to the **Discover** tab to see all 30 plugins with descriptions.

### Step 3: Install Plugins

Install plugins based on your needs:

```shell
# Essential for all projects
/plugin install aai-core@alphaagent-team
/plugin install aai-hooks@alphaagent-team

# PM integration (choose based on your tooling)
/plugin install aai-pm-linear@alphaagent-team    # Linear users
/plugin install aai-pm-jira@alphaagent-team      # Jira users
/plugin install aai-pm-github@alphaagent-team    # GitHub Issues

# Development agents
/plugin install aai-dev-fullstack@alphaagent-team  # All-in-one bundle

# Stack-specific skills (install based on your tech stack)
/plugin install aai-stack-react@alphaagent-team
/plugin install aai-stack-express@alphaagent-team
/plugin install aai-stack-typescript@alphaagent-team
# ... etc.
```

### Step 4: Verify Installation

```shell
/help  # See all available commands from installed plugins
```

## Recommended Plugin Sets

### For Full-Stack Developers

```shell
/plugin install aai-core@alphaagent-team
/plugin install aai-hooks@alphaagent-team
/plugin install aai-dev-fullstack@alphaagent-team
/plugin install aai-testing@alphaagent-team
```

Then add stack plugins matching your tech:
- React project: `aai-stack-react`, `aai-stack-typescript`
- Next.js project: `aai-stack-nextjs`, `aai-stack-react`
- Express API: `aai-stack-express`, `aai-stack-node`
- With Postgres: `aai-stack-postgres`, `aai-stack-prisma`

### For Product/PM Teams

```shell
/plugin install aai-pm-linear@alphaagent-team   # or aai-pm-jira
/plugin install aai-docs@alphaagent-team
```

## Plugin Catalog

### Workflow Plugins

| Plugin | Description |
|--------|-------------|
| [aai-core](./plugins/aai-core/) | Core workflow - git operations, PRs, code review, essential commands |
| [aai-hooks](./plugins/aai-hooks/) | Validation hooks - protected branches, completion validation, anti-patterns |

### PM Plugins

| Plugin | Description | Requires |
|--------|-------------|----------|
| [aai-pm-linear](./plugins/aai-pm-linear/) | Linear ticket management - create, plan, optimize, triage | Linear MCP |
| [aai-pm-jira](./plugins/aai-pm-jira/) | Jira ticket management - create, plan, optimize, triage | Atlassian MCP |
| [aai-pm-github](./plugins/aai-pm-github/) | GitHub Issues management - triage, workflow | `gh` CLI |

### Development Agent Plugins

| Plugin | Description |
|--------|-------------|
| [aai-dev-frontend](./plugins/aai-dev-frontend/) | Frontend agent - UI components, state management, accessibility |
| [aai-dev-backend](./plugins/aai-dev-backend/) | Backend agent - API design, authentication, error handling |
| [aai-dev-database](./plugins/aai-dev-database/) | Database agent - schema design, queries, migrations |
| [aai-dev-fullstack](./plugins/aai-dev-fullstack/) | All dev agents bundled together |

### Stack Skill Plugins

| Plugin | Auto-loads when | Description |
|--------|-----------------|-------------|
| [aai-stack-react](./plugins/aai-stack-react/) | `react` in deps | React patterns, hooks, context |
| [aai-stack-nextjs](./plugins/aai-stack-nextjs/) | `next` in deps | App Router, Server Components |
| [aai-stack-vite](./plugins/aai-stack-vite/) | `vite` in deps | Vite configuration, plugins |
| [aai-stack-express](./plugins/aai-stack-express/) | `express` in deps | Routing, middleware, validation |
| [aai-stack-node](./plugins/aai-stack-node/) | Node.js detected | Streams, async patterns |
| [aai-stack-typescript](./plugins/aai-stack-typescript/) | `typescript` in devDeps | Generics, utility types |
| [aai-stack-postgres](./plugins/aai-stack-postgres/) | `pg` in deps | Queries, indexes, migrations |
| [aai-stack-sqlite](./plugins/aai-stack-sqlite/) | `better-sqlite3` in deps | SQLite patterns |
| [aai-stack-prisma](./plugins/aai-stack-prisma/) | `prisma` in deps | Schema, queries, relations |
| [aai-stack-typeorm](./plugins/aai-stack-typeorm/) | `typeorm` in deps | Entities, QueryBuilder |
| [aai-stack-tailwind](./plugins/aai-stack-tailwind/) | `tailwindcss` in deps | Utility-first styling |
| [aai-stack-material-ui](./plugins/aai-stack-material-ui/) | `@mui/material` in deps | MUI components, theming |
| [aai-stack-playwright](./plugins/aai-stack-playwright/) | `@playwright/test` in devDeps | E2E testing patterns |
| [aai-stack-jest](./plugins/aai-stack-jest/) | `jest` in devDeps | Unit testing, mocking |
| [aai-stack-auth0](./plugins/aai-stack-auth0/) | `@auth0/*` in deps | Auth0 integration |

### Specialized Plugins

| Plugin | Description |
|--------|-------------|
| [aai-testing](./plugins/aai-testing/) | Testing agents - unit, API, E2E specialists |
| [aai-architecture](./plugins/aai-architecture/) | Architecture and design patterns |
| [aai-docs](./plugins/aai-docs/) | Documentation agents |
| [aai-blog](./plugins/aai-blog/) | Technical blog writing |
| [aai-devops](./plugins/aai-devops/) | CI/CD and deployment |
| [aai-quality](./plugins/aai-quality/) | Quality governance |

## Plugin Structure

Each plugin follows Claude Code's plugin specification:

```
aai-example/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest
├── agents/                   # Agent definitions
│   └── example-agent.md
├── skills/                   # Reusable skills
│   └── example-skill/
│       └── SKILL.md
├── commands/                 # Slash commands
│   └── example-command.md
├── hooks/                    # Hook configurations
│   ├── hooks.json
│   └── scripts/
└── .mcp.json                 # MCP server config
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on creating and submitting plugins.

## Requirements

- [Claude Code](https://claude.com/claude-code) v1.0.33 or later
- For PM plugins: relevant MCP servers (Linear, Jira) or CLI tools (`gh`)

## Documentation

- [Claude Code Plugin Docs](https://code.claude.com/docs/en/plugins) - Official plugin documentation
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to create plugins

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

Built by [AnswerAI](https://github.com/the-answerai)
