---
description: Create a new Linear ticket with guided prompts and optional immediate work start
argument-hint: [optional description]
---

# /linear-create - Create Linear Ticket

Create a new Linear ticket using the `linear-ticket-creator` agent.

## Usage

```
/linear-create [optional description]
```

## Workflow

Launch the `linear-ticket-creator` agent with any initial description provided.

The agent will:
1. Check for duplicate tickets first (REQUIRED)
2. Gather ticket requirements through clarifying questions
3. Explore the codebase for relevant context
4. Suggest appropriate labels, team, and priority
5. Draft a comprehensive ticket description
6. Create the ticket in Linear
7. Offer to start work immediately with `/linear-start`

## Screenshot Handling

If the user has shared any screenshots or images in the conversation, explicitly mention them in the agent prompt so they can be included in the ticket for visual context.

## After Completion

Provide:
- Ticket ID and URL
- Summary of what was created
- Option to start work immediately
