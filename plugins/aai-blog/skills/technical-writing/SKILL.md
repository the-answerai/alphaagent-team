---
name: technical-writing
description: Technical writing standards and best practices
user-invocable: false
---

# Technical Writing Skill

Standards and best practices for technical writing.

## Writing Principles

### Clarity

```markdown
## Be Clear

❌ "Utilize the aforementioned methodology to facilitate optimal outcomes."

✅ "Use this method to get the best results."

## Rules:
- Use simple words
- One idea per sentence
- Active voice over passive
- Specific over vague
```

### Conciseness

```markdown
## Be Concise

❌ "In order to effectively and efficiently process the data,
    it is necessary that the system must first initialize."

✅ "The system must initialize before processing data."

## Cut:
- Unnecessary words ("very", "really", "actually")
- Redundant phrases ("end result", "future plans")
- Filler phrases ("it should be noted that")
```

### Consistency

```markdown
## Be Consistent

### Terminology
Pick one term and stick with it:
- "user" or "customer" (not both)
- "click" or "select" (not both)
- "app" or "application" (not both)

### Formatting
- Code: `backticks`
- UI elements: **bold**
- File paths: `code`
- First mention of terms: *italics*
```

## Style Guide

### Voice and Tone

```markdown
## Voice Characteristics

### Professional but Friendly
❌ "One must ensure that..."
✅ "Make sure you..."

❌ "Heyyy! Super excited to show you..."
✅ "We're excited to introduce..."

### Direct and Helpful
❌ "You might want to consider..."
✅ "We recommend..."

❌ "There are several ways to..."
✅ "Do this by..."
```

### Sentence Structure

```markdown
## Sentence Guidelines

### Lead with Action
❌ "To create a new user, click the Create button."
✅ "Click Create to add a new user."

### One Action per Step
❌ "Click Settings, then Security, then API Keys."
✅ "1. Click Settings
    2. Select Security
    3. Click API Keys"

### Front-Load Key Information
❌ "If you're using Docker, skip this step."
✅ "Skip this step if you're using Docker."
```

### Technical Terms

```markdown
## Handling Technical Terms

### Define on First Use
"The API uses *webhooks* (HTTP callbacks triggered by events)
to notify your server of changes."

### Use Consistently
If you introduce "webhook," don't later call it:
- "HTTP callback"
- "event notification"
- "push notification"

### Know Your Audience
**Beginner audience:** Define all terms
**Expert audience:** Use standard terminology
**Mixed audience:** Link to glossary
```

## Formatting Standards

### Headings

```markdown
## Heading Guidelines

### Use Sentence Case
✅ "Getting started with APIs"
❌ "Getting Started With APIs"

### Be Descriptive
✅ "Install dependencies"
❌ "Step 1"

### Heading Hierarchy
- H1: Page title only
- H2: Main sections
- H3: Subsections
- H4: Use sparingly
```

### Lists

```markdown
## List Guidelines

### Use Bullets For:
- Unordered items
- Features or benefits
- Requirements

### Use Numbers For:
1. Sequential steps
2. Ordered processes
3. Rankings

### List Formatting
- Parallel structure
- Complete sentences or fragments (not both)
- 2-7 items ideally
```

### Code

```markdown
## Code Guidelines

### Inline Code
Use for:
- Function names: \`createUser()\`
- File paths: \`src/index.ts\`
- Commands: \`npm install\`
- Values: \`true\`, \`null\`

### Code Blocks
\`\`\`typescript
// Always specify language
// Include comments for complex code
// Use realistic examples
const user = await createUser({
  email: 'john@example.com'
})
\`\`\`

### Show Expected Output
\`\`\`
$ npm test
✓ 42 tests passed
\`\`\`
```

## Common Patterns

### Procedures

```markdown
## Procedure Template

### Prerequisites
Before you begin:
- Requirement 1
- Requirement 2

### Steps

1. **[Action verb]** the [object].

   [Additional details if needed]

   \`\`\`bash
   command
   \`\`\`

2. **[Next action]** the [object].

3. **Verify** that [expected result].

### Result
You have now [completed task].
```

### Warnings and Notes

```markdown
## Callout Types

> **Note:** Additional information that's helpful but not critical.

> **Tip:** Helpful suggestion or best practice.

> **Important:** Information the reader needs to know.

> **Warning:** Potential for data loss or security issues.

> **Caution:** Action that can't be undone.
```

### Examples

```markdown
## Example Structure

### Good Example Includes:
1. Context - why you'd use this
2. Complete, runnable code
3. Expected output
4. Common variations

### Example
\`\`\`typescript
// Create a user with minimal required fields
const user = await createUser({
  email: 'john@example.com'
})
// Output: { id: 'usr_123', email: 'john@example.com' }

// Create a user with all fields
const fullUser = await createUser({
  email: 'jane@example.com',
  name: 'Jane Doe',
  role: 'admin'
})
\`\`\`
```

## Review Checklist

```markdown
## Before Publishing

### Content
- [ ] Accurate and up-to-date
- [ ] Complete (no missing steps)
- [ ] Tested (code works)
- [ ] Audience-appropriate

### Writing
- [ ] Clear and concise
- [ ] Active voice
- [ ] Consistent terminology
- [ ] No jargon unexplained

### Formatting
- [ ] Proper heading hierarchy
- [ ] Code has syntax highlighting
- [ ] Links work
- [ ] Images have alt text

### Polish
- [ ] Spell-checked
- [ ] Grammar-checked
- [ ] Read aloud for flow
```

## Integration

Used by:
- `blog-writer` agent
- `tutorial-writer` agent
- `announcement-writer` agent
