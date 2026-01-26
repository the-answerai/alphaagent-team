---
description: Generate changelog or release notes from git history and PR descriptions
argument-hint: [version or date range]
---

# /changelog - Generate Changelog

Generate changelog or release notes from git history.

## Usage

```
/changelog
/changelog v1.2.0
/changelog --since last-release
/changelog --from v1.0.0 --to v1.1.0
```

## Workflow

1. **Gather Changes**
   - Read git commit history
   - Fetch merged PR descriptions
   - Identify version tags

2. **Categorize Changes**
   - Features (feat:)
   - Bug fixes (fix:)
   - Breaking changes
   - Performance improvements
   - Documentation updates

3. **Generate Changelog**
   - Group by category
   - Link to PRs/issues
   - Highlight breaking changes

4. **Format Output**
   - Keep a Changelog format
   - Semantic versioning notes
   - Migration guides for breaking changes

## Output

- CHANGELOG.md entry
- Release notes summary
- Migration guide if needed
- Suggested version bump
