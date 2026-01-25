# Contributing to AlphaAgent Team

Thank you for your interest in contributing to the AlphaAgent plugin marketplace!

## Creating a Plugin

### 1. Plugin Structure

Every plugin must follow this structure:

```
your-plugin/
├── .claude-plugin/
│   └── plugin.json          # REQUIRED: Plugin manifest
├── agents/                   # Agent definitions (optional)
│   └── your-agent.md
├── skills/                   # Skills (optional)
│   └── your-skill/
│       └── SKILL.md
├── commands/                 # Commands (optional)
│   └── your-command/
│       └── COMMAND.md
├── hooks/                    # Hooks (optional)
│   ├── hooks.json
│   └── scripts/
└── .mcp.json                 # MCP config (optional)
```

### 2. Plugin Manifest (plugin.json)

```json
{
  "name": "your-plugin-name",
  "displayName": "Your Plugin Display Name",
  "description": "What your plugin does",
  "version": "1.0.0",
  "author": {
    "name": "Your Name",
    "url": "https://github.com/yourname"
  },
  "category": "workflow|pm|dev|stack|testing|architecture|docs|blog|devops|quality|project",
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
      "dependencies": ["package-name"],
      "devDependencies": ["package-name"],
      "files": ["*.extension"],
      "always": false
    }
  },
  "models": {
    "default": "sonnet",
    "configurable": true,
    "agents": {
      "agent-name": "sonnet|opus|haiku"
    }
  },
  "compatibility": {
    "claudeCode": ">=1.0.33"
  }
}
```

### 3. Agent Definition

Agents are Markdown files with YAML frontmatter:

```markdown
---
name: your-agent
description: What this agent does
model: sonnet
model_configurable: true
skills:
  - skill-name
  - optional-skill?
tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
  - Bash
---

You are an expert in [domain]...

## Your Responsibilities

1. Task one
2. Task two

## Guidelines

- Guideline one
- Guideline two
```

### 4. Skill Definition

Skills live in a folder with a `SKILL.md` file:

```markdown
---
name: your-skill
description: When to use this skill
---

# Skill Name

## Overview

What this skill covers.

## Patterns

### Pattern 1

```typescript
// Example code
```

### Pattern 2

```typescript
// Example code
```

## Anti-Patterns

- What NOT to do
```

### 5. Command Definition

Commands are Markdown files that define slash commands:

```markdown
---
description: What this command does
allowed_tools:
  - Read
  - Write
  - Bash
---

# /your-command

## Purpose

What this command accomplishes.

## Workflow

1. Step one
2. Step two
3. Step three

## Usage

```
/your-plugin:your-command [arguments]
```
```

### 6. Hooks Configuration

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "script",
            "script": ".claude/hooks/scripts/your-script.cjs",
            "timeout": 5000,
            "description": "What this hook does"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$FILE\"",
            "timeout": 5000,
            "description": "Format files after edit"
          }
        ]
      }
    ]
  }
}
```

## Naming Conventions

- **Plugin names**: `aai-{category}-{name}` (e.g., `aai-stack-react`)
- **Agent names**: `kebab-case` (e.g., `frontend-developer`)
- **Skill names**: `kebab-case` (e.g., `react-patterns`)
- **Command names**: `kebab-case` (e.g., `ticket-create`)

## Categories

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
| project | `aai-{project}` | Project-specific |

## Validation

Before submitting, validate your plugin:

```bash
node scripts/validate-plugins.js plugins/your-plugin
```

## Submitting

1. Fork this repository
2. Create your plugin in `plugins/`
3. Run validation
4. Submit a pull request

## Questions?

Open an issue or reach out to the AnswerAI team.
