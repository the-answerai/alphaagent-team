# CLAUDE.md - AlphaAgent Team Plugin Marketplace

This repository is the official plugin marketplace for AlphaAgent. It contains Claude Code plugins that provide agents, skills, commands, and hooks.

## Critical: Always Reference Documentation

**Before creating or modifying ANY plugin, you MUST read the local Claude Code documentation.**

### Local Documentation

All Claude Code docs are available in `docs/claudecode/`. **Read these first - do not assume formats.**

See [docs/README.md](./docs/README.md) for the complete index.

### Required Reading Before Plugin Work

| Task | Read These Docs |
|------|-----------------|
| **Creating a plugin** | `docs/claudecode/plugins.md`, `docs/claudecode/plugins-reference.md` |
| **Creating skills** | `docs/claudecode/skills.md` |
| **Creating agents** | `docs/claudecode/subagents.md` |
| **Creating hooks** | `docs/claudecode/hooks-reference.md` |
| **MCP integration** | `docs/claudecode/mcp.md` |

**DO NOT assume plugin formats. Always verify against the documentation.**

---

## Repository Structure

```
alphaagent-team/
├── CLAUDE.md                      # This file
├── README.md                      # Marketplace overview
├── CONTRIBUTING.md                # Contribution guidelines
├── IMPLEMENTATION_PLAN.md         # Implementation roadmap
├── plugin-manifest.json           # Registry of all plugins
│
├── docs/
│   ├── README.md                  # Documentation index
│   └── claudecode/                # Claude Code official docs
│       ├── plugins.md
│       ├── plugins-reference.md
│       ├── skills.md
│       ├── subagents.md
│       ├── hooks-reference.md
│       └── ...
│
├── plugins/
│   ├── aai-core/                  # Core workflow
│   ├── aai-hooks/                 # Standard hooks
│   ├── aai-pm-linear/             # Linear PM
│   ├── aai-pm-jira/               # Jira PM
│   ├── aai-pm-github/             # GitHub Issues PM
│   ├── aai-dev-frontend/          # Frontend agent
│   ├── aai-dev-backend/           # Backend agent
│   ├── aai-dev-database/          # Database agent
│   ├── aai-dev-fullstack/         # All dev agents
│   ├── aai-stack-*/               # Tech stack skills
│   ├── aai-testing/               # Testing agents
│   ├── aai-architecture/          # Architecture agents
│   ├── aai-docs/                  # Documentation agents
│   ├── aai-blog/                  # Blog writing
│   ├── aai-devops/                # DevOps agents
│   └── aai-quality/               # Quality governance
│
├── shared/
│   └── templates/                 # Plugin templates
│
└── scripts/
    ├── validate-plugins.js        # Validate plugin structure
    └── build-manifest.js          # Generate manifest
```

---

## Plugin Development Workflow

### 1. Before Starting

```bash
# Read the plugin documentation first
Read docs/claudecode/plugins.md
Read docs/claudecode/plugins-reference.md
```

### 2. Create Plugin Structure

Every plugin MUST have this structure (verified from docs):

```
aai-example/
├── .claude-plugin/
│   └── plugin.json          # REQUIRED
├── agents/                   # Optional
│   └── agent-name.md
├── skills/                   # Optional
│   └── skill-name/
│       └── SKILL.md
├── commands/                 # Optional
│   └── command-name/
│       └── COMMAND.md
├── hooks/                    # Optional
│   ├── hooks.json
│   └── scripts/
└── .mcp.json                 # Optional
```

### 3. Plugin Manifest (plugin.json)

**Verify format against `docs/claudecode/plugins-reference.md`**

```json
{
  "name": "aai-example",
  "displayName": "AAI Example Plugin",
  "description": "What this plugin does",
  "version": "1.0.0",
  "author": {
    "name": "AnswerAI",
    "url": "https://github.com/the-answerai"
  },
  "category": "workflow",
  "tags": ["relevant", "tags"],
  "requires": {
    "mcpServers": [],
    "plugins": []
  },
  "recommends": {
    "mcpServers": [],
    "plugins": []
  },
  "autoLoad": {
    "when": {
      "dependencies": [],
      "files": []
    }
  },
  "models": {
    "default": "sonnet",
    "configurable": true
  },
  "compatibility": {
    "claudeCode": ">=1.0.33"
  }
}
```

### 4. Skill Definition (SKILL.md)

**Verify format against `docs/claudecode/skills.md`**

```markdown
---
name: skill-name
description: One-line description of when to use this skill
---

# Skill Title

## Overview
What this skill provides.

## Patterns
Detailed patterns and examples.

## Anti-Patterns
What to avoid.
```

### 5. Agent Definition

**Verify format against `docs/claudecode/subagents.md`**

```markdown
---
name: agent-name
description: What this agent does
model: sonnet
model_configurable: true
skills:
  - required-skill
  - optional-skill?
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

You are an expert...
```

### 6. Command Definition (COMMAND.md)

```markdown
---
description: What this command does
allowed_tools:
  - Read
  - Write
---

# /command-name

Instructions for what the command should do.
```

### 7. Hooks (hooks.json)

**Verify format against `docs/claudecode/hooks-reference.md`**

```json
{
  "hooks": {
    "PreToolUse": [...],
    "PostToolUse": [...],
    "SubagentStop": [...],
    "Stop": [...]
  }
}
```

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Plugin name | `aai-{category}-{name}` | `aai-stack-react` |
| Agent name | `kebab-case` | `frontend-developer` |
| Skill name | `kebab-case` | `react-patterns` |
| Command name | `kebab-case` | `ticket-create` |
| Hook script | `kebab-case.cjs` | `block-master-commits.cjs` |

---

## Plugin Categories

| Category | Prefix | Purpose |
|----------|--------|---------|
| workflow | `aai-core`, `aai-hooks` | Core workflow tools |
| pm | `aai-pm-*` | Project management |
| dev | `aai-dev-*` | Development agents |
| stack | `aai-stack-*` | Technology-specific skills |
| testing | `aai-testing` | Testing and QA |
| architecture | `aai-architecture` | Architecture and design |
| docs | `aai-docs` | Documentation |
| blog | `aai-blog` | Content writing |
| devops | `aai-devops` | DevOps and deployment |
| quality | `aai-quality` | Quality governance |

---

## Validation Checklist

Before committing any plugin:

- [ ] Read relevant docs in `docs/claudecode/`
- [ ] plugin.json follows current schema
- [ ] All SKILL.md files have proper frontmatter
- [ ] Agent files have proper YAML frontmatter
- [ ] Command files have proper frontmatter
- [ ] Hooks reference valid scripts
- [ ] No hardcoded paths
- [ ] Tested plugin loads with `claude --plugin-dir`

---

## Important Rules

1. **DO NOT include project-specific plugins** - Those stay in their respective repos
2. **Always read local docs before creating plugins** - Prevents hallucination
3. **Use the `aai-` prefix** - All plugins are namespaced
4. **Keep skills focused** - One concept per skill
5. **Make models configurable** - Allow project-level overrides
6. **Document MCP requirements** - In plugin.json requires field

---

## Commands

```bash
# Validate all plugins
node scripts/validate-plugins.js

# Validate single plugin
node scripts/validate-plugins.js plugins/aai-core

# Build manifest
node scripts/build-manifest.js

# Test plugin locally
claude --plugin-dir ./plugins/aai-core
```

---

## Source Repos for Porting

When creating plugins, port content from these repos:

- **theanswer**: `/Users/bradtaylor/Github/theanswer/.claude/`
- **data-sidekick**: `/Users/bradtaylor/Github/data-sidekick/.claude/`
- **alphaagent**: `/Users/bradtaylor/Github/alphaagent/.claude/`
- **kumello**: `/Users/bradtaylor/Github/kumello/.claude/`

But remember: project-specific patterns stay in those repos.

---

## AlphaAgent Integration

This repo is read by AlphaAgent for:
1. Plugin discovery
2. Auto-suggestion based on detected stack
3. Installation to project's `.claude/` directory

AlphaAgent reads `plugin-manifest.json` for the registry of available plugins.

---

## Updating Documentation

To update the local Claude Code docs:

1. Check for updates at `https://code.claude.com/docs/llms.txt`
2. Download updated markdown files
3. Replace files in `docs/claudecode/`
4. Commit changes
