# Plugin Marketplace Comprehensive Audit Report

**Date**: 2025-01-24
**Scope**: All plugins in `/plugins/` directory
**Source Comparison**: alphaagent, data-sidekick, theanswer, aai-browser-sidekick

---

## Executive Summary

This audit identifies **critical issues** that will cause hallucinations, incorrect behavior, and failures if projects rely solely on these plugins without their original Claude instances.

### Severity Levels
- **CRITICAL**: Will cause hallucinations or incorrect code generation
- **HIGH**: Missing functionality that users expect to work
- **MEDIUM**: Gaps that reduce effectiveness
- **LOW**: Minor improvements needed

---

## Critical Issue #1: Technology Hardcoded in Agents

**Severity: CRITICAL**

Agents should be **role-based** (what they do), while skills should be **technology-specific** (how they do it). Several agents violate this principle by embedding specific technology code examples.

### Affected Agents

| Agent | Plugin | Hardcoded Technologies | Risk |
|-------|--------|----------------------|------|
| `database-developer` | aai-dev-database | Prisma schema syntax, Prisma queries | If project uses Knex, TypeORM, Drizzle, or raw SQL, agent will suggest Prisma patterns |
| `backend-developer` | aai-dev-backend | Express routing, Prisma in service layer | If project uses Fastify, NestJS, Hono, or Koa, agent shows Express patterns |
| `frontend-developer` | aai-dev-frontend | React hooks, TanStack Query, Tailwind | If project uses Vue, Svelte, Angular, or styled-components, agent shows React patterns |
| `fullstack-developer` | aai-dev-fullstack | React, Express, Prisma, Tailwind, TanStack Query | Most severe - combines all hardcoded tech |
| `e2e-test-developer` | aai-testing | Playwright-only patterns, AxeBuilder | If project uses Cypress, WebDriverIO, or Selenium, agent shows Playwright |
| `unit-test-developer` | aai-testing | Jest patterns | If project uses Vitest, Mocha, or AVA, agent shows Jest |

### Evidence (database-developer.md lines 48-109)

```typescript
// Prisma schema example - HARDCODED
model User {
  id        String   @id @default(uuid())
  // ... Prisma-specific syntax
}

// Prisma query example - HARDCODED
const users = await prisma.user.findMany({
  // ... Prisma-specific API
});
```

### Recommended Fix

1. Remove ALL code examples from agent definitions
2. Agents should describe the ROLE and WORKFLOW only
3. Create/reference skills for each technology:
   - `aai-stack-prisma/skills/prisma-schema/SKILL.md`
   - `aai-stack-typeorm/skills/typeorm-entities/SKILL.md`
   - `aai-stack-drizzle/skills/drizzle-schema/SKILL.md`

4. Agent should dynamically load appropriate skill based on detected project stack

**Agent Template (Technology-Agnostic):**

```yaml
---
name: database-developer
description: Expert database developer specializing in schema design, query optimization, and data modeling.
model: sonnet
skills:
  - schema-design
  - query-optimization
  - migration-patterns
  - data-modeling
  # Technology skills loaded based on project detection
---

# Database Developer Agent

You are an expert database developer. Your role is:
1. Understand data requirements
2. Design schemas following normalization principles
3. Write optimized queries for the project's ORM/query builder
4. Create safe, reversible migrations

## Important
- ALWAYS detect the project's database technology first
- Use the appropriate skill patterns for the detected ORM/database
- Never assume a specific technology - verify with file inspection
```

---

## Critical Issue #2: PM Plugin Parity Gap

**Severity: HIGH**

The Jira plugin is **completely empty** while Linear has full implementation.

### Current State

| Plugin | Agents | Skills | Commands | Status |
|--------|--------|--------|----------|--------|
| aai-pm-linear | 4 | 7 | - | Complete |
| aai-pm-jira | **0** | **0** | - | **EMPTY** |
| aai-pm-github | 1 | 2 | - | Partial |

### Linear Plugin Contents (Reference)

**Agents:**
- `linear-ticket-creator` - Create tickets with duplicate detection
- `linear-ticket-planner` - Plan ticket implementation
- `linear-ticket-optimizer` - Improve ticket quality
- `linear-ticket-triager` - Categorize and triage tickets

**Skills:**
- `ticket-create` - Guided ticket creation
- `ticket-start` - Start work on tickets
- `ticket-planning-workflow` - Sprint planning
- `linear-triage` - Triage methodology
- `linear-ticket-analysis` - Analysis patterns
- `ticket-duplicate-detection` - Find duplicates
- `ticket-status-sync` - Keep status updated

### Missing from Jira Plugin

Everything. The plugin.json exists but there are no agents or skills.

**Required Jira Agents:**
- `jira-ticket-creator`
- `jira-ticket-planner`
- `jira-ticket-optimizer`
- `jira-ticket-triager`

**Required Jira Skills:**
- `jira-ticket-create`
- `jira-ticket-start`
- `jira-sprint-planning`
- `jira-triage`
- `jira-ticket-analysis`
- `jira-duplicate-detection`
- `jira-status-sync`

### Missing from GitHub Plugin

**Agents needed:**
- `github-issue-creator` - Create issues from context
- `github-issue-planner` - Plan issue implementation
- `github-issue-optimizer` - Improve issue descriptions

**Skills needed:**
- `issue-create` - Guided issue creation
- `issue-start` - Start work on issues
- `issue-planning-workflow` - Milestone planning
- `issue-duplicate-detection` - Find duplicate issues
- `issue-status-sync` - Status via labels

---

## Critical Issue #3: Missing Source Repo Functionality

**Severity: HIGH**

The source repos contain battle-tested patterns that are missing from the marketplace.

### alphaagent Source (33 agents, 67 skills)

**Missing Agents:**
| Agent | Purpose | Priority |
|-------|---------|----------|
| linear-integration | Linear OAuth + GraphQL API | High |
| github-integration | GitHub API and OAuth | High |
| slack-integration | Slack OAuth + Webhooks | Medium |
| stripe-integration | Stripe Connect payments | Medium |
| notion-integration | Notion API patterns | Medium |
| google-integration | Google OAuth + Workspace | Medium |
| atlassian-integration | Jira/Confluence API | High |
| salesforce-integration | Salesforce REST API | Low |
| hubspot-integration | HubSpot CRM API | Low |
| contentful-integration | Contentful CMS | Low |
| sanity-integration | Sanity CMS | Low |
| zoom-integration | Zoom OAuth + Meetings | Low |
| n8n-integration | n8n workflow automation | Low |
| make-integration | Make.com automation | Low |
| third-party-integration-specialist | Generic integration guide | High |

**Missing Skills:**
| Skill | Purpose | Priority |
|-------|---------|----------|
| supabase-patterns | Supabase PostgreSQL setup | High |
| bullmq-queue-patterns | BullMQ job processing | Medium |
| defensive-api-handling | API response validation | High |
| test-anti-pattern-detector | Bad testing pattern detection | High |
| test-robustness | Flaky test elimination | High |
| test-timestamp-handling | Time mocking patterns | Medium |
| test-isolation-patterns | Test isolation techniques | Medium |
| full-stack-feature-checklist | Complete feature checklist | High |
| security-analysis | OWASP Top 10 scanning | High |
| worktree-development | Git worktree workflow | Low |
| console-log-elimination | Debug logging cleanup | Medium |

### theanswer Source (19 agents, 14 skills)

**Unique Missing Items:**
| Item | Type | Purpose |
|------|------|---------|
| blog-post-writer | Agent | Technical blog posts with CTAs |
| blog-writing-workflow | Skill | 2,015 lines of blog guidance |
| error-handling | Skill | 725 lines, 22 error patterns |
| theanswer-patterns | Skill | Multi-tenancy patterns (generic version needed) |
| commit-helper | Skill | 456 lines validation rules |
| pr-review-workflow | Skill | 15-point review checklist |

### data-sidekick Source (22 agents, 39 skills)

**Unique Missing Items:**
| Item | Type | Purpose |
|------|------|---------|
| ux-designer | Agent | UX/UI design, accessibility, WCAG |
| spec-*-maintainers | Agents | Documentation maintenance |
| winston-logging | Skill | Structured logging patterns |
| csv-data-processing | Skill | CSV parsing and processing |
| multi-env-config | Skill | Multi-environment setup |

---

## Critical Issue #4: Missing Hooks Infrastructure

**Severity: HIGH**

The `aai-hooks` plugin exists but lacks critical hooks from source projects.

### Current aai-hooks Contents
- `inject-project-context.cjs` - Project context injection
- `block-wrong-package-manager.cjs` - Package manager enforcement
- `block-master-commits.cjs` - Protected branch guard
- Auto-format with Prettier

### Missing Critical Hooks (from alphaagent)

| Hook | Purpose | Impact |
|------|---------|--------|
| `validate-completion-claims.cjs` | Verify test/file modification claims | Prevents false completion claims |
| `validate-anti-patterns.cjs` | Detect bad coding patterns | Prevents code quality issues |
| `require-verification.cjs` | Block commits without evidence | Ensures work is verified |
| `export-alphaagent.cjs` | Export data before commits | Data integrity |
| `validate-session-end.cjs` | Full session validation + metrics | Quality tracking |
| `session-start-hook.cjs` | Initialize session environment | Proper session setup |

---

## Critical Issue #5: Skill Reference Mismatches

**Severity: MEDIUM**

Agents reference skills that don't exist in the marketplace or are in different plugins.

### Examples

**database-developer.md (lines 213-218):**
```markdown
Works with skills:
- `schema-design` - Database modeling patterns
- `query-optimization` - Performance tuning
- `migration-patterns` - Safe migration practices
- `data-modeling` - Entity relationship design
```

These skills exist in `aai-dev-database/skills/` but:
1. No mechanism ensures they're loaded together
2. Agent could be loaded without skills installed
3. No validation that skills are compatible

**frontend-developer.md references:**
- `component-architecture`
- `state-management`
- `responsive-design`
- `accessibility-patterns`

These exist but may not be loaded when agent runs in isolation.

### Recommended Fix

1. Add explicit skill dependencies to plugin.json:

```json
{
  "name": "aai-dev-database",
  "requires": {
    "skills": [
      "schema-design",
      "query-optimization",
      "migration-patterns",
      "data-modeling"
    ]
  }
}
```

2. Create validation script that checks skill references exist

---

## Critical Issue #6: Missing Stack Detection

**Severity: HIGH**

Agents don't dynamically adapt to the project's technology stack.

### Current Behavior

Agents have hardcoded examples assuming specific technologies. When loaded into a project with different tech:
- **Database agent** shows Prisma examples for a TypeORM project
- **Frontend agent** shows React examples for a Vue project
- **Backend agent** shows Express examples for a Fastify project

### Required: Stack Detection Skill

From alphaagent source: `skills/stack-detection/SKILL.md`

This skill:
1. Scans package.json for dependencies
2. Identifies framework (React, Vue, Angular, Svelte)
3. Identifies ORM (Prisma, TypeORM, Drizzle, Sequelize)
4. Identifies test framework (Jest, Vitest, Mocha)
5. Identifies styling (Tailwind, CSS Modules, styled-components)
6. Injects context for all agents

### Implementation Needed

```markdown
---
name: stack-detection
description: Detect project technology stack and inject context
auto_load: all
---

# Stack Detection

## Detection Process
1. Read package.json dependencies
2. Check for config files (prisma/schema.prisma, tailwind.config.js, etc.)
3. Identify patterns in existing code
4. Set PROJECT_STACK context

## Detected Technologies
- Framework: {react|vue|angular|svelte|none}
- ORM: {prisma|typeorm|drizzle|sequelize|knex|none}
- Database: {postgresql|mysql|sqlite|mongodb|none}
- Testing: {jest|vitest|mocha|playwright|cypress}
- Styling: {tailwind|css-modules|styled-components|sass}
```

---

## Critical Issue #7: Testing Agents Too Framework-Specific

**Severity: MEDIUM**

### e2e-test-developer

The entire agent is Playwright-specific:
- All examples use Playwright API
- References `@playwright/test` imports
- Uses Playwright-specific fixtures
- References `@axe-core/playwright`

**Problem**: Projects using Cypress or WebDriverIO get Playwright code.

### unit-test-developer

Less severe but still shows Jest-specific patterns:
- `jest.fn()` mocking
- `describe/it` structure (shared with others)

### Recommended Fix

1. Create generic testing agent with methodology only
2. Create separate skills for each framework:
   - `aai-stack-playwright/skills/playwright-testing`
   - `aai-stack-cypress/skills/cypress-testing`
   - `aai-stack-jest/skills/jest-testing`
   - `aai-stack-vitest/skills/vitest-testing`

---

## Issue #8: Incomplete Plugin Manifests

**Severity: MEDIUM**

Many plugin.json files lack required fields.

### Example: aai-pm-jira/plugin.json

```json
{
  "name": "aai-pm-jira",
  "version": "1.0.0",
  "description": "Jira ticket management...",
  "author": {...},
  "repository": "...",
  "license": "MIT",
  "keywords": [...]
}
```

**Missing:**
- `requires.mcps` - Should require a Jira MCP
- `autoLoad.when` - Stack detection triggers
- `compatibility.claudeCode` - Version requirements

### Example: aai-pm-linear/plugin.json (Better)

```json
{
  "requires": {
    "mcps": ["linear-mcp"]
  }
}
```

But still missing `autoLoad` and `compatibility`.

---

## Issue #9: No MCP Requirements for Integration Plugins

**Severity: MEDIUM**

Plugins that need MCP servers don't always declare them.

| Plugin | Needs MCP | Declared |
|--------|-----------|----------|
| aai-pm-linear | linear-mcp | Yes |
| aai-pm-jira | jira-mcp (or atlassian-mcp) | **No** |
| aai-pm-github | - (uses gh CLI) | N/A |

---

## Issue #10: Missing Commands

**Severity: MEDIUM**

Source projects have useful commands not in marketplace.

### Missing from aai-core

| Command | Purpose |
|---------|---------|
| `/implement-task` | Full implementation cycle |
| `/plan-feature` | Feature planning workflow |
| `/fix-tests` | Diagnose and fix failing tests |
| `/bug` | Bug reproduction and fix workflow |
| `/deploy` | Deployment automation |
| `/status` | Session status reporting |
| `/cleanup` | Repository maintenance |
| `/audit-docs` | Documentation audit |

### Missing from aai-pm-linear

| Command | Purpose |
|---------|---------|
| `/ticket-create` | Create Linear ticket |
| `/ticket-start` | Start work on ticket |

These exist as skills but not as commands.

---

## Gaps Analysis: Removing Claude Instances

If a project removes its `.claude/` directory and relies only on marketplace plugins:

### What Will Break

1. **Project Context**: No `PROJECT_CONTEXT` injection with package manager, paths, stack info
2. **Stack-Specific Patterns**: Agents will suggest wrong technology patterns
3. **Validation Hooks**: No pre-commit quality gates, anti-pattern detection
4. **Session Management**: No session metrics, completion verification
5. **PM Workflows**: Jira users have nothing, GitHub users have minimal support
6. **Integration Patterns**: No OAuth patterns, API integration guidance

### What Will Work

1. **Basic Git Workflow**: Commit, push, PR creation
2. **Linear PM**: Full ticket management
3. **Generic Architecture**: System design, requirements analysis
4. **Documentation**: README, API docs, integration docs
5. **Blog Writing**: Technical posts (if blog plugin is loaded)

### What Will Hallucinate

1. **Database code**: Will suggest Prisma for any ORM
2. **Frontend code**: Will suggest React for any framework
3. **Backend code**: Will suggest Express for any server framework
4. **Test code**: Will suggest Playwright/Jest regardless of project setup

---

## Recommended Remediation Plan

### Phase 1: Critical (Do First)

1. **Remove technology examples from agents** - Create technology-agnostic agent definitions
2. **Create Jira plugin content** - Match Linear plugin feature parity
3. **Complete GitHub plugin** - Add creator, planner, optimizer agents
4. **Add stack-detection skill** - Inject project context for all agents

### Phase 2: High Priority

5. **Port missing hooks** - validation, anti-patterns, completion verification
6. **Add integration agents** - At least: github-integration, slack-integration, atlassian-integration
7. **Add defensive-api-handling skill** - Critical for frontend reliability
8. **Add security-analysis skill** - OWASP Top 10 scanning

### Phase 3: Medium Priority

9. **Fix skill references** - Validate all referenced skills exist
10. **Add missing commands** - /implement-task, /plan-feature, /fix-tests, /bug
11. **Port blog-writing-workflow** - Comprehensive content system
12. **Add test framework skills** - Cypress, Vitest, Mocha

### Phase 4: Enhancements

13. **Complete plugin.json schemas** - All required fields
14. **Add MCP requirements** - Where needed
15. **Port remaining integration specialists**
16. **Add session management hooks**

---

## File Changes Required

### Immediate Changes

```
plugins/
├── aai-dev-database/agents/database-developer.md     # Remove code examples
├── aai-dev-backend/agents/backend-developer.md       # Remove code examples
├── aai-dev-frontend/agents/frontend-developer.md     # Remove code examples
├── aai-dev-fullstack/agents/fullstack-developer.md   # Remove code examples
├── aai-testing/agents/e2e-test-developer/AGENT.md    # Genericize
├── aai-testing/agents/unit-test-developer/AGENT.md   # Genericize
├── aai-pm-jira/                                      # Add all agents/skills
│   ├── agents/
│   │   ├── jira-ticket-creator.md
│   │   ├── jira-ticket-planner.md
│   │   ├── jira-ticket-optimizer.md
│   │   └── jira-ticket-triager.md
│   └── skills/
│       ├── jira-ticket-create/SKILL.md
│       ├── jira-sprint-planning/SKILL.md
│       ├── jira-triage/SKILL.md
│       └── ... (match Linear skills)
├── aai-pm-github/                                    # Complete
│   ├── agents/
│   │   ├── github-issue-creator.md                   # NEW
│   │   ├── github-issue-planner.md                   # NEW
│   │   └── github-issue-optimizer.md                 # NEW
│   └── skills/
│       ├── issue-create/SKILL.md                     # NEW
│       └── issue-planning-workflow/SKILL.md          # NEW
└── shared/
    └── skills/
        └── stack-detection/SKILL.md                  # NEW - critical
```

---

## Conclusion

The plugin marketplace has a solid foundation but contains critical gaps that will cause hallucinations and failures if projects rely on it exclusively. The most urgent fixes are:

1. **Decouple technology from roles** - Agents should not contain framework-specific code
2. **Complete PM plugin parity** - Jira and GitHub need full implementations
3. **Add stack detection** - Agents must adapt to project technology
4. **Port validation hooks** - Quality gates are essential

These changes will transform the marketplace from a collection of potentially conflicting patterns into a reliable, stack-agnostic toolkit.
