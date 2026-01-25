---
name: issue-duplicate-detection
description: Patterns for detecting duplicate GitHub issues before creating new ones.
---

# GitHub Issue Duplicate Detection Skill

This skill provides patterns for detecting and handling duplicate GitHub issues.

## Why Check for Duplicates

- Prevent duplicate work
- Consolidate discussion
- Better tracking and metrics
- Cleaner backlog

---

## Detection Process

### Step 1: Extract Key Terms

From the potential new issue:
- Core functionality/feature
- Error messages (exact text)
- Component names
- User actions described

### Step 2: Search Existing Issues

```bash
# Search open issues
gh issue list --state open --search "keyword1 keyword2" --limit 20

# Search all issues (including closed)
gh issue list --state all --search "keyword1 keyword2" --limit 20

# Search with specific terms
gh issue list --state all --search "in:title error message"

# Search by label
gh issue list --state open --label "bug" --search "keyword"
```

### Step 3: Review Results

For each potential match:
- Compare titles carefully
- Read descriptions
- Check if closed issue was fixed
- Consider different wordings of same problem

### Step 4: Present Findings

```markdown
## Duplicate Check Results

### Potential Duplicates Found

| # | Title | State | Created | Similarity |
|---|-------|-------|---------|------------|
| #123 | Similar issue title | Open | 2024-01-10 | High |
| #456 | Related problem | Closed | 2023-12-01 | Medium |

### Analysis

**#123** appears to describe the same issue:
- Same error message mentioned
- Same component affected
- Both triggered by same user action

**Recommendation**: Add context to #123 instead of creating new issue.

### If Not Duplicate

If you confirm this is a new issue, I'll proceed with creation.
```

---

## Search Strategies

### By Error Message
```bash
gh issue list --state all --search "TypeError: Cannot read property"
```

### By Component/Feature
```bash
gh issue list --state all --search "in:title checkout"
gh issue list --state all --search "in:body payment"
```

### By Author (Recent)
```bash
gh issue list --state all --author @me --search "keyword"
```

### Combined Search
```bash
gh issue list --state open --label "bug" --search "in:title login error"
```

---

## Similarity Assessment

### High Similarity (Likely Duplicate)
- Same error message
- Same steps to reproduce
- Same component affected
- Different wording, same problem

**Action**: Recommend adding to existing issue

### Medium Similarity (Possibly Related)
- Same area but different specifics
- Could share root cause
- Related symptoms

**Action**: Recommend linking issues

### Low Similarity (Probably Different)
- Same component, different issue
- Superficially similar only

**Action**: Proceed with new issue

---

## Handling Duplicates

### When Duplicate Found

1. **Don't create new issue**
2. **Add context to existing:**
```bash
gh issue comment 123 --body "$(cat <<'EOF'
Additional report:

[New information not in original issue]

Confirming this is still occurring as of [date].
EOF
)"
```

3. **If existing is closed:**
   - Check if fix actually resolved it
   - May need to reopen with new info

### Linking Related Issues

When related but not duplicate:
```markdown
In new issue body:
Related to #123
See also #456
```

### Closing as Duplicate

```bash
gh issue close {number} --comment "Closing as duplicate of #123"
gh issue edit {number} --add-label "duplicate"
```

---

## Common Duplicate Patterns

### Same Bug, Different Reports
- Different users reporting
- Slightly different reproduction steps
- Same underlying cause

### Feature Requests
- Multiple requests for same feature
- Different use cases, same solution
- Different wording, same goal

### Regression Reports
- Previously fixed, returned
- Same symptoms as old issue
- May warrant new issue with reference

---

## Search Query Reference

| Query | Meaning |
|-------|---------|
| `keyword` | Search all fields |
| `in:title keyword` | Title only |
| `in:body keyword` | Body only |
| `is:open` | Open issues |
| `is:closed` | Closed issues |
| `label:bug` | With label |
| `author:username` | By author |
| `assignee:username` | Assigned to |
| `created:>2024-01-01` | Created after |
| `updated:>2024-01-01` | Updated after |

**Combine with AND:**
```bash
gh issue list --search "is:open label:bug in:title checkout"
```

---

## Checklist Before Creating

- [ ] Searched for exact error messages
- [ ] Searched for key feature terms
- [ ] Checked component-specific issues
- [ ] Reviewed recent issues
- [ ] Verified no duplicate exists
- [ ] OR found duplicate and added context
