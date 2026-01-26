---
name: changelog-management
description: Changelog and release notes patterns
---

# Changelog Management Skill

Patterns for maintaining changelogs and release notes.

## Changelog Format

### Keep a Changelog Standard

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New feature description

### Changed
- Change description

### Deprecated
- Deprecated feature

### Removed
- Removed feature

### Fixed
- Bug fix description

### Security
- Security fix description

## [1.2.0] - 2024-01-15

### Added
- User profile page with avatar upload
- Export data to CSV functionality
- Dark mode support

### Changed
- Improved search performance by 50%
- Updated dependencies to latest versions

### Fixed
- Fixed login redirect issue on Safari
- Resolved memory leak in real-time updates

## [1.1.0] - 2024-01-01

### Added
- Initial release features

[Unreleased]: https://github.com/org/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/org/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/org/repo/releases/tag/v1.1.0
```

### Category Guidelines

```markdown
## Categories

### Added
New features that add functionality.
- "Added user authentication with OAuth"
- "Added export to PDF feature"

### Changed
Changes to existing functionality.
- "Changed default timeout from 30s to 60s"
- "Improved error message clarity"

### Deprecated
Features that will be removed in future versions.
- "Deprecated legacyMethod() in favor of newMethod()"
- "Deprecated XML export (use JSON instead)"

### Removed
Features that have been removed.
- "Removed support for Node.js 14"
- "Removed deprecated API endpoints"

### Fixed
Bug fixes.
- "Fixed crash when processing empty files"
- "Fixed incorrect date formatting"

### Security
Security-related changes.
- "Fixed XSS vulnerability in user input"
- "Updated dependencies with security patches"
```

## Release Notes

### Public Release Notes

```markdown
# Release v2.0.0

We're excited to announce v2.0.0! This release includes major improvements
to performance, a redesigned dashboard, and new API features.

## Highlights

### 🚀 50% Faster Performance
We've completely rewritten our data processing pipeline, resulting in
significant performance improvements across all operations.

### 🎨 Redesigned Dashboard
The dashboard has been redesigned with a focus on usability:
- Customizable widgets
- Dark mode support
- Improved navigation

### 🔌 New API Features
- Webhook support for real-time events
- Batch operations for bulk updates
- GraphQL endpoint (beta)

## Breaking Changes

### API Changes
- `GET /users` now returns paginated results
- Authentication header changed from `X-Auth-Token` to `Authorization`

### Configuration
- `config.json` format has changed (see [migration guide](/docs/migration))

## Migration Guide

### Step 1: Update API Calls

\`\`\`diff
- fetch('/api/users')
+ fetch('/api/users?page=1&limit=20')
\`\`\`

### Step 2: Update Authentication

\`\`\`diff
- headers: { 'X-Auth-Token': token }
+ headers: { 'Authorization': 'Bearer ' + token }
\`\`\`

## Full Changelog

See [CHANGELOG.md](CHANGELOG.md) for complete details.

## Thank You

Thanks to everyone who contributed to this release!

@contributor1, @contributor2, @contributor3
```

### Internal Release Notes

```markdown
# Release Notes v2.0.0 (Internal)

**Release Date:** 2024-01-15
**Release Manager:** @john
**Status:** Production

## Deployment Information

### Pre-requisites
- [ ] Database migration (migration #45)
- [ ] Redis cache flush required
- [ ] Feature flag `new_dashboard` enabled

### Deployment Steps
1. Deploy database migrations
2. Deploy backend services
3. Deploy frontend
4. Enable feature flags
5. Monitor error rates

### Rollback Plan
1. Disable feature flags
2. Rollback frontend
3. Rollback backend
4. Rollback migrations (script: `rollback_45.sql`)

## Known Issues

| Issue | Severity | Workaround |
|-------|----------|------------|
| IE11 layout issues | Low | Use Chrome/Firefox |
| Slow initial load | Medium | Caching in progress |

## Metrics to Monitor

- Error rate (target: < 0.1%)
- API latency p95 (target: < 200ms)
- Memory usage (baseline: 512MB)

## Contacts

- Engineering: @eng-team
- On-call: @john (primary), @jane (secondary)
```

## Conventional Commits

### Commit Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

```markdown
## Commit Types

| Type | Description | Changelog Section |
|------|-------------|------------------|
| feat | New feature | Added |
| fix | Bug fix | Fixed |
| docs | Documentation | - |
| style | Formatting | - |
| refactor | Code change | Changed |
| perf | Performance | Changed |
| test | Tests | - |
| chore | Maintenance | - |
| revert | Revert commit | Removed |
| security | Security fix | Security |
```

### Examples

```bash
# Feature
feat(auth): add OAuth2 login support

# Bug fix
fix(api): resolve null pointer in user endpoint

Fixes #123

# Breaking change
feat(api)!: change response format to JSON:API

BREAKING CHANGE: API responses now follow JSON:API specification.
See migration guide for details.

# Multiple footers
fix(ui): correct button alignment on mobile

Fixes #456
Reviewed-by: @jane
Co-authored-by: @bob
```

## Automated Changelog

### Using Conventional Changelog

```javascript
// .versionrc.js
module.exports = {
  types: [
    { type: 'feat', section: 'Features' },
    { type: 'fix', section: 'Bug Fixes' },
    { type: 'perf', section: 'Performance' },
    { type: 'revert', section: 'Reverts' },
    { type: 'docs', hidden: true },
    { type: 'style', hidden: true },
    { type: 'chore', hidden: true },
    { type: 'refactor', hidden: true },
    { type: 'test', hidden: true }
  ],
  commitUrlFormat: '{{host}}/{{owner}}/{{repository}}/commit/{{hash}}',
  compareUrlFormat: '{{host}}/{{owner}}/{{repository}}/compare/{{previousTag}}...{{currentTag}}'
}
```

### Release Workflow

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Create Release
        run: |
          npx standard-version
          git push --follow-tags

      - name: Publish Release Notes
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs')
            const changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
            // Extract latest version notes
            // Create GitHub release
```

## Integration

Used by:
- `readme-writer` agent
- `integration-doc-writer` agent
