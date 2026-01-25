---
description: Execute a full implementation cycle with planning, agent delegation, testing, and code review
argument-hint: <requirements-or-task-description>
allowed-tools: Task, Bash, Read, Grep, Glob, Edit, Write, AskUserQuestion
---

# Implement Task

Execute a complete implementation workflow for a feature or task.

## Context

- Current branch: !`git branch --show-current`
- Uncommitted changes: !`git status --short`
- Recent commits: !`git log --oneline -5`

## Task Description

Implement: $ARGUMENTS

## Workflow

Execute these phases in order:

### Phase 1: Planning & Analysis

**MANDATORY FIRST STEP** - Before writing any code:

1. **Analyze the task requirements** thoroughly
2. **Explore the codebase** to understand existing patterns
3. **Identify affected components** and their relationships
4. **Detect the project's technology stack** (use stack-detection skill)
5. **Flag any ambiguities** that need user clarification

**If clarification is needed**: Use AskUserQuestion to get answers BEFORE proceeding. Do NOT assume or guess.

### Phase 2: Implementation Planning

Create a detailed implementation plan:

1. Break down into specific tasks with clear acceptance criteria
2. Identify which components/files will be modified
3. Determine task dependencies (what must complete before what)
4. Identify test requirements

### Phase 3: Implementation

**Critical: Technology Detection First**

Before writing any code, detect the project's technology stack:
- Frontend: React, Vue, Angular, Svelte, etc.
- Backend: Express, Fastify, NestJS, etc.
- Database: Prisma, TypeORM, Drizzle, Sequelize, etc.
- Testing: Jest, Vitest, Playwright, Cypress, etc.

**Write code that matches the detected stack and existing patterns.**

Implementation approach:
- Follow existing code patterns and conventions
- Write tests alongside implementation
- Make incremental, verifiable changes

### Phase 4: Quality Gates

After implementation, verify all quality gates pass:

```bash
# Detect and run appropriate build command
# npm run build / pnpm build / yarn build

# Detect and run appropriate test command
# npm test / pnpm test / yarn test
```

**If any check fails**:
1. Identify the root cause
2. Fix the issue
3. Re-run checks until all pass

### Phase 5: Code Review

Self-review the changes:

1. Review all changes for quality, security, and standards
2. Check for security vulnerabilities
3. Verify test coverage is adequate
4. Ensure code follows project patterns

**If issues found**:
1. Prioritize by severity (security > bugs > style)
2. Fix issues
3. Re-run review after fixes

### Phase 6: Completion

When all phases pass:

1. Summarize what was implemented
2. List any follow-up items or known limitations
3. Present final status to user

## Success Criteria

- [ ] Task requirements fully analyzed
- [ ] User clarifications obtained before implementation
- [ ] Implementation complete following project patterns
- [ ] Build succeeds
- [ ] Tests pass
- [ ] Self code review complete
- [ ] Summary provided to user

## Important Notes

- **NEVER skip planning** - This catches issues early
- **NEVER guess at ambiguous requirements** - Ask the user
- **NEVER proceed if build or tests fail** - Fix first
- **ALWAYS detect technology stack** before writing code
- **ALWAYS follow existing patterns** in the codebase
