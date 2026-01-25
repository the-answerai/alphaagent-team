---
description: Gather detailed requirements for a new feature through systematic analysis and clarification
argument-hint: <feature description>
allowed-tools: Read, Grep, Glob, AskUserQuestion
---

# Plan Feature Command

Gather comprehensive requirements for a new feature before implementation.

## Usage

```
/plan-feature User authentication with social login
```

## What This Command Does

1. **Analyzes the feature request** for completeness
2. **Explores the codebase** to understand existing patterns
3. **Identifies gaps and ambiguities** in the description
4. **Asks clarifying questions** using the AskUserQuestion tool
5. **Documents complete requirements** in structured format
6. **Creates acceptance criteria** that can be used for testing
7. **Outputs a requirements document** ready for implementation

## Output Format

The command produces a complete requirements document with:

- **User Story** (As a X, I want Y, so that Z)
- **Acceptance Criteria** (measurable, testable)
- **Technical Considerations** (database, API, UI needs)
- **Open Questions** (needs user decisions)
- **Testing Approach** (how to verify the feature works)

## Example

### Input:
```
/plan-feature Add commenting system for blog posts
```

### Output:
```markdown
## Feature Requirements: Blog Post Comments

### User Story
As a logged-in user, I want to leave comments on blog posts so that I can engage with content and discuss with other readers.

### Acceptance Criteria
- [ ] User can write comment (max 1000 characters) on any published blog post
- [ ] User can edit their own comments within 24 hours
- [ ] User can delete their own comments anytime
- [ ] Comments display author name, timestamp, and content
- [ ] Comments ordered newest first
- [ ] Comment form validates: not empty, under character limit

### Technical Considerations

**Database**:
- Table: comments (id, post_id, user_id, content, created_at, updated_at)
- Foreign keys: post_id -> posts.id, user_id -> users.id
- Index on post_id for fast lookups

**API Endpoints**:
- GET /api/posts/:id/comments - List comments for post
- POST /api/posts/:id/comments - Create comment (auth required)
- PUT /api/comments/:id - Edit comment (auth + ownership check)
- DELETE /api/comments/:id - Delete comment (auth + ownership check)

**UI Components**:
- CommentList (displays all comments)
- CommentForm (textarea, submit button, character counter)
- CommentItem (shows comment with edit/delete buttons if owned)

### Open Questions
1. Should users be able to reply to comments (nested threads)?
   - Impact: Requires parent_comment_id field, more complex UI
   - Recommended: Start flat, add threading later if needed

2. Should there be comment moderation?
   - Options: Auto-publish, require approval, spam filter
   - Recommended: Auto-publish with "report abuse" button

### Testing Approach
- Unit tests for validation logic
- API tests for CRUD operations
- E2E test for comment submission flow
- Authorization tests for edit/delete permissions
```

## When to Use

- **Before implementing vague features** - Get clarity first
- **When requirements are incomplete** - Fill in the gaps
- **For complex features** - Break down into manageable pieces
- **When stakeholder input needed** - Generate good questions to ask

## Next Steps After Planning

1. **Review the requirements document**
2. **Answer any open questions** raised
3. **Begin implementation** using the /implement-task command

## Tips

- **Be as specific as possible** in your initial description
- **Mention constraints** (budget, timeline, dependencies)
- **Reference existing features** if similar functionality exists
- **Answer questions promptly** to keep momentum going
