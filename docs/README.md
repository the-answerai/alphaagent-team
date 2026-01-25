# Claude Code Documentation Reference

> **IMPORTANT**: Always read the local documentation before creating or modifying plugins. This ensures we follow current best practices and don't hallucinate features.

## Local Documentation

All Claude Code docs are available locally in `docs/claudecode/`. **Read these first.**

### Core Plugin Development Docs

| Doc | Local Path | Purpose |
|-----|------------|---------|
| **Create plugins** | `docs/claudecode/plugins.md` | How to create plugins with skills, agents, hooks |
| **Plugins reference** | `docs/claudecode/plugins-reference.md` | Technical schemas, CLI commands, specifications |
| **Create marketplaces** | `docs/claudecode/distribute-plugin.md` | Building and hosting plugin marketplaces |
| **Discover plugins** | `docs/claudecode/plugin-discover-install-prebuilt.md` | Finding and installing plugins |

### Skills & Agents Docs

| Doc | Local Path | Purpose |
|-----|------------|---------|
| **Skills** | `docs/claudecode/skills.md` | Custom capabilities and slash commands |
| **Subagents** | `docs/claudecode/subagents.md` | Specialized AI agents for task-specific workflows |
| **Features overview** | `docs/claudecode/extending-claude-code.md` | When to use CLAUDE.md, Skills, subagents, hooks, MCP |

### Hooks & MCP Docs

| Doc | Local Path | Purpose |
|-----|------------|---------|
| **Hooks guide** | `docs/claudecode/hooks.md` | Getting started with hooks |
| **Hooks reference** | `docs/claudecode/hooks-reference.md` | Technical hook implementation details |
| **MCP** | `docs/claudecode/mcp.md` | Model Context Protocol tool integration |

### Configuration & Reference Docs

| Doc | Local Path | Purpose |
|-----|------------|---------|
| **Settings** | `docs/claudecode/settings.md` | Global and project-level settings |
| **CLI reference** | `docs/claudecode/cli-reference.md` | Command-line interface documentation |
| **Model configuration** | `docs/claudecode/model-config.md` | Model aliases and options |
| **Memory** | `docs/claudecode/memory-management.md` | Cross-session memory management |
| **Best practices** | `docs/claudecode/bestpractices.md` | Configuration tips, environment setup |
| **Common workflows** | `docs/claudecode/common-workflows.md` | Codebase exploration, bug fixing, testing |
| **Output styles** | `docs/claudecode/outputstyles.md` | Non-software-engineering use cases |
| **Interactive mode** | `docs/claudecode/interactive-mode.md` | Keyboard shortcuts, session features |

### Other Docs

| Doc | Local Path | Purpose |
|-----|------------|---------|
| **Troubleshooting** | `docs/claudecode/troubleshooting.md` | Common issues and solutions |
| **Data usage** | `docs/claudecode/data-usage.md` | Anthropic's data usage policies |
| **Checkpointing** | `docs/claudecode/checkpointing.md` | Track and rewind edits |
| **Terminal config** | `docs/claudecode/terminal-config.md` | Terminal setup |
| **Status line** | `docs/claudecode/statusline-config.md` | Custom status display |
| **Monitoring** | `docs/claudecode/monitoring.md` | OpenTelemetry setup |
| **Programmatic usage** | `docs/claudecode/programmatic-usage.md` | Agent SDK |

---

## How to Use This Documentation

### Before Creating a Plugin

1. **Read local plugin docs**:
   ```
   Read docs/claudecode/plugins.md
   Read docs/claudecode/plugins-reference.md
   ```

2. **Check the schema** from plugins-reference for:
   - plugin.json manifest format
   - SKILL.md frontmatter format
   - Agent definition format
   - hooks.json format

3. **Follow patterns from docs**, not assumptions

### Before Creating Skills

Read `docs/claudecode/skills.md` for:
- SKILL.md structure
- Frontmatter fields
- When skills auto-load vs manual invoke

### Before Creating Agents

Read `docs/claudecode/subagents.md` for:
- Agent definition format
- Model assignment
- Tool permissions
- Skills linking

### Before Creating Hooks

Read `docs/claudecode/hooks-reference.md` for:
- Hook types (PreToolUse, PostToolUse, etc.)
- Matcher patterns
- Script vs command hooks
- Environment variables available

---

## Updating Documentation

To update local docs to the latest version:

1. Fetch from official source: `https://code.claude.com/docs/llms.txt`
2. Download updated markdown files
3. Replace files in `docs/claudecode/`
4. Commit changes

---

## Key Concepts Summary

### Plugin Structure
```
plugin-name/
├── .claude-plugin/
│   └── plugin.json          # REQUIRED: Plugin manifest
├── agents/                   # Agent definitions
├── skills/                   # SKILL.md files in folders
├── commands/                 # Slash commands
├── hooks/
│   ├── hooks.json
│   └── scripts/
└── .mcp.json
```

### Skill vs Command
- **Skills**: Model-invoked, Claude uses them automatically based on context
- **Commands**: User-invoked via `/plugin-name:command-name`

### Plugin Naming
- Plugins are namespaced: `/aai-core:push` not `/push`
- Name in plugin.json becomes the namespace prefix

### Required Fields in plugin.json
```json
{
  "name": "plugin-name",        // REQUIRED
  "description": "...",         // REQUIRED
  "version": "1.0.0"            // REQUIRED
}
```

---

## Validation Checklist

Before committing any plugin:

- [ ] Read relevant local docs
- [ ] plugin.json has required fields
- [ ] All SKILL.md files have proper frontmatter
- [ ] Agent files have proper YAML frontmatter
- [ ] Hooks reference valid scripts
- [ ] No hardcoded paths or assumptions
- [ ] Tested plugin loads correctly
