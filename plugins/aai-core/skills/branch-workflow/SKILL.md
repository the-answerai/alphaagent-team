---
name: branch-workflow
description: Patterns for branch naming, validation, and lifecycle management. Used by git-pr-manager agent.
user-invocable: false
---

# Branch Workflow Patterns

Reference patterns for branch naming, validation, and protection.

## Branch Naming Convention

```
{type}/{ticket-id}-{description}
```

### Branch Types
| Type | Description | Example |
|------|-------------|---------|
| `feature` | New functionality | `feature/AUTH-123-oauth-login` |
| `fix` | Bug fixes | `fix/AUTH-456-token-expiry` |
| `chore` | Maintenance tasks | `chore/DEP-789-update-deps` |
| `docs` | Documentation | `docs/README-updates` |
| `refactor` | Code restructure | `refactor/API-101-cleanup` |
| `test` | Test additions | `test/AUTH-202-unit-tests` |

### Description Guidelines
- Use lowercase with hyphens
- Keep short but descriptive
- No spaces or special characters

## Protected Branches

These branches are PROTECTED - never commit directly:

| Branch | Purpose |
|--------|---------|
| `main` | Production code |
| `master` | Production code (legacy) |
| `production` | Production deployment |
| `staging` | Pre-production testing |
| `develop` | Development integration |

## Branch Validation

### Check Current Branch
```bash
git branch --show-current
```

### Validate Not Protected
```javascript
const PROTECTED = ['main', 'master', 'production', 'staging', 'develop'];
const current = getCurrentBranch();
if (PROTECTED.includes(current.toLowerCase())) {
  throw new Error(`Cannot operate on protected branch: ${current}`);
}
```

### Extract Ticket ID
```javascript
// Pattern: type/TICKET-123-description
const match = branchName.match(/^[a-z]+\/([A-Z]+-\d+)/);
const ticketId = match ? match[1] : null;
```

## PR Target Rules

| Source Branch | Target Branch |
|---------------|---------------|
| `feature/*` | `staging` or `develop` |
| `fix/*` | `staging` or `develop` |
| `chore/*` | `staging` or `develop` |
| `staging` | `production` or `main` |

**NEVER target main/master directly from feature branches.**

## Branch Lifecycle

1. **Create**: Branch from staging/develop
2. **Develop**: Make changes, commit frequently
3. **Push**: Push to remote
4. **PR**: Create PR targeting staging
5. **Review**: Address feedback
6. **Merge**: Squash or merge to staging
7. **Delete**: Remove merged branch

## Commands Reference

### Create Branch
```bash
git checkout staging
git pull origin staging
git checkout -b feature/TICKET-123-description
```

### Check Remote Tracking
```bash
git branch -vv
```

### Push New Branch
```bash
git push -u origin feature/TICKET-123-description
```

### Delete Merged Branch
```bash
# Local
git branch -d feature/TICKET-123-description

# Remote
git push origin --delete feature/TICKET-123-description
```

## Anti-Patterns

- Committing directly to main/master
- Branches without ticket IDs (when applicable)
- Long-lived feature branches (merge frequently)
- Branches with spaces or special characters
- Multiple developers on same branch without coordination
