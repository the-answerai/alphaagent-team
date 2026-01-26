---
name: documentation-patterns
description: Documentation structure and organization patterns
---

# Documentation Patterns Skill

Patterns for organizing and structuring documentation.

## Documentation Types

### Reference Documentation

Technical specifications and API details.

```markdown
## Function: createUser

Creates a new user in the system.

### Signature

\`\`\`typescript
function createUser(data: CreateUserData): Promise<User>
\`\`\`

### Parameters

| Name | Type | Required | Description |
|------|------|----------|-------------|
| data.email | string | Yes | User's email address |
| data.name | string | No | Display name |
| data.role | UserRole | No | Default: "user" |

### Returns

`Promise<User>` - The created user object

### Throws

- `ValidationError` - If email format is invalid
- `ConflictError` - If email already exists

### Example

\`\`\`typescript
const user = await createUser({
  email: 'john@example.com',
  name: 'John Doe'
})
\`\`\`
```

### Conceptual Documentation

Explains concepts and architecture.

```markdown
# Authentication Architecture

## Overview

The authentication system uses JWT tokens for stateless authentication.

## Components

### Token Service

Responsible for generating and validating tokens.

### Session Manager

Manages user sessions and refresh tokens.

## Flow

1. User submits credentials
2. Server validates credentials
3. Server generates JWT token
4. Client stores token
5. Client sends token with requests
6. Server validates token on each request

## Security Considerations

- Tokens expire after 1 hour
- Refresh tokens valid for 30 days
- Tokens are signed with RS256
```

### Procedural Documentation

Step-by-step instructions.

```markdown
# Setting Up Local Development

## Prerequisites

- Node.js 18+
- PostgreSQL 15
- Redis 7

## Steps

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/org/repo.git
cd repo
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment

\`\`\`bash
cp .env.example .env
# Edit .env with your settings
\`\`\`

### 4. Start Services

\`\`\`bash
docker-compose up -d
npm run dev
\`\`\`

### 5. Verify Setup

Open http://localhost:3000 and log in.
```

## Documentation Structure

### Project Documentation

```
docs/
├── README.md                 # Project overview
├── getting-started/
│   ├── installation.md      # Setup instructions
│   ├── quick-start.md       # First steps
│   └── configuration.md     # Config options
├── guides/
│   ├── authentication.md    # Auth guide
│   ├── api-usage.md         # API patterns
│   └── best-practices.md    # Recommendations
├── api/
│   ├── overview.md          # API introduction
│   ├── endpoints/           # Endpoint docs
│   └── schemas.md           # Data schemas
├── reference/
│   ├── configuration.md     # Config reference
│   ├── environment.md       # Env variables
│   └── cli.md               # CLI reference
└── contributing/
    ├── development.md       # Dev setup
    ├── testing.md           # Test guide
    └── releasing.md         # Release process
```

### API Documentation

```
api-docs/
├── overview.md
├── authentication.md
├── rate-limiting.md
├── errors.md
├── endpoints/
│   ├── users/
│   │   ├── list.md
│   │   ├── create.md
│   │   ├── get.md
│   │   ├── update.md
│   │   └── delete.md
│   ├── orders/
│   │   └── ...
│   └── products/
│       └── ...
└── webhooks/
    ├── overview.md
    ├── events.md
    └── security.md
```

## Writing Patterns

### Inverted Pyramid

Start with the most important information:

```markdown
# Feature X

Feature X allows you to do Y. Use it when you need Z.

## Quick Start

\`\`\`typescript
// Most common usage
doFeatureX()
\`\`\`

## Details

More detailed explanation...

## Advanced Usage

Edge cases and advanced scenarios...
```

### Progressive Disclosure

Layer information from simple to complex:

```markdown
# Configuration

## Basic Configuration

\`\`\`json
{
  "apiKey": "your-key"
}
\`\`\`

## Standard Options

| Option | Type | Default |
|--------|------|---------|
| timeout | number | 30000 |
| retries | number | 3 |

## Advanced Options

For fine-grained control...

## Expert Configuration

For specialized use cases...
```

### Task-Oriented

Organize around what users want to accomplish:

```markdown
# User Management

## Common Tasks

### Add a New User
...

### Update User Permissions
...

### Remove a User
...

### Reset User Password
...
```

## Formatting Guidelines

### Code Blocks

```markdown
\`\`\`typescript
// Always specify the language
const example = true
\`\`\`

\`\`\`bash
# Use bash for shell commands
npm install package
\`\`\`

\`\`\`json
{
  "use": "json for config"
}
\`\`\`
```

### Tables

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Left     | Center   | Right    |
| aligned  | aligned  | aligned  |
```

### Callouts

```markdown
> **Note:** Important information

> **Warning:** Potential issues

> **Tip:** Helpful suggestion

> **Caution:** Dangerous action
```

### Links

```markdown
<!-- Relative links for internal docs -->
See [Configuration](../reference/configuration.md)

<!-- Absolute links for external resources -->
Visit [GitHub](https://github.com)

<!-- Anchor links for same page -->
See [Installation](#installation)
```

## Integration

Used by:
- `readme-writer` agent
- `api-doc-writer` agent
- `integration-doc-writer` agent
