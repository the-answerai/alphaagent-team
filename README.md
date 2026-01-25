# AlphaAgent Team Plugin Marketplace

> The official plugin marketplace for [AlphaAgent](https://github.com/the-answerai/alphaagent) - your autonomous coding assistant.

## Overview

This repository contains a curated collection of Claude Code plugins designed to work with AlphaAgent. Plugins provide agents, skills, commands, and hooks that extend Claude Code's capabilities.

**Note**: This marketplace contains only generic, reusable plugins. Project-specific patterns stay in their respective repos.

## Quick Start

### For AlphaAgent Users

AlphaAgent automatically discovers and suggests plugins from this marketplace. When you import a project:

1. AlphaAgent detects your tech stack
2. Suggests relevant plugins (e.g., `aai-stack-react` for React projects)
3. Install with one click

### For Claude Code Users (Manual Install)

```bash
# Clone this repo
git clone https://github.com/the-answerai/alphaagent-team.git

# Install a plugin to your project
./scripts/install-plugin.sh aai-core /path/to/your/project
```

## Plugin Categories

### Workflow Plugins
| Plugin | Description |
|--------|-------------|
| [aai-core](./plugins/aai-core/) | Core dev workflow - git, PRs, code review |
| [aai-hooks](./plugins/aai-hooks/) | Standard hook scripts for all projects |

### PM Plugins
| Plugin | Description | Required MCP |
|--------|-------------|--------------|
| [aai-pm-linear](./plugins/aai-pm-linear/) | Linear ticket management | `linear-mcp` |
| [aai-pm-jira](./plugins/aai-pm-jira/) | Jira ticket management | `jira-mcp` |
| [aai-pm-github](./plugins/aai-pm-github/) | GitHub Issues management | - |

### Development Agent Plugins
| Plugin | Description |
|--------|-------------|
| [aai-dev-frontend](./plugins/aai-dev-frontend/) | Frontend development agent |
| [aai-dev-backend](./plugins/aai-dev-backend/) | Backend development agent |
| [aai-dev-database](./plugins/aai-dev-database/) | Database development agent |
| [aai-dev-fullstack](./plugins/aai-dev-fullstack/) | All dev agents bundled |

### Stack Skill Plugins
| Plugin | Auto-loads when | Description |
|--------|-----------------|-------------|
| [aai-stack-react](./plugins/aai-stack-react/) | `react` in deps | React patterns |
| [aai-stack-nextjs](./plugins/aai-stack-nextjs/) | `next` in deps | Next.js patterns |
| [aai-stack-vite](./plugins/aai-stack-vite/) | `vite` in deps | Vite patterns |
| [aai-stack-express](./plugins/aai-stack-express/) | `express` in deps | Express patterns |
| [aai-stack-node](./plugins/aai-stack-node/) | Node.js detected | Node.js patterns |
| [aai-stack-typescript](./plugins/aai-stack-typescript/) | `typescript` in devDeps | TypeScript patterns |
| [aai-stack-postgres](./plugins/aai-stack-postgres/) | `pg` in deps | PostgreSQL patterns |
| [aai-stack-sqlite](./plugins/aai-stack-sqlite/) | `better-sqlite3` in deps | SQLite patterns |
| [aai-stack-prisma](./plugins/aai-stack-prisma/) | `prisma` in deps | Prisma ORM patterns |
| [aai-stack-typeorm](./plugins/aai-stack-typeorm/) | `typeorm` in deps | TypeORM patterns |
| [aai-stack-tailwind](./plugins/aai-stack-tailwind/) | `tailwindcss` in deps | Tailwind CSS patterns |
| [aai-stack-material-ui](./plugins/aai-stack-material-ui/) | `@mui/material` in deps | Material UI patterns |
| [aai-stack-playwright](./plugins/aai-stack-playwright/) | `@playwright/test` in devDeps | Playwright testing |
| [aai-stack-jest](./plugins/aai-stack-jest/) | `jest` in devDeps | Jest testing |
| [aai-stack-auth0](./plugins/aai-stack-auth0/) | `@auth0/*` in deps | Auth0 patterns |

### Specialized Plugins
| Plugin | Description |
|--------|-------------|
| [aai-testing](./plugins/aai-testing/) | Testing agents and QA |
| [aai-architecture](./plugins/aai-architecture/) | Architecture and design |
| [aai-docs](./plugins/aai-docs/) | Documentation |
| [aai-blog](./plugins/aai-blog/) | Blog writing |
| [aai-devops](./plugins/aai-devops/) | DevOps and deployment |
| [aai-quality](./plugins/aai-quality/) | Quality governance |

## Plugin Structure

Each plugin follows this structure:

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
│   └── example-command/
│       └── COMMAND.md
├── hooks/                    # Hook configurations
│   ├── hooks.json
│   └── scripts/
│       └── example-hook.cjs
└── .mcp.json                 # MCP server config
```

## Recommended Plugin Sets

### Developer
```json
["aai-core", "aai-hooks", "aai-dev-fullstack", "aai-testing"]
```

### PM / Product
```json
["aai-pm-linear", "aai-docs"]
```

### Full Stack Team
```json
[
  "aai-core", "aai-hooks", "aai-pm-linear",
  "aai-dev-fullstack", "aai-testing",
  "aai-architecture", "aai-docs"
]
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Development guidelines for this repo
- [CONTRIBUTING.md](./CONTRIBUTING.md) - How to create and submit plugins
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - Roadmap and specifications
- [docs/README.md](./docs/README.md) - Claude Code documentation reference

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on creating and submitting plugins.

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

Built with love by [AnswerAI](https://github.com/the-answerai)
