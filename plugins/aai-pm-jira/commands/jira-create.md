---
description: Create a new Jira ticket with guided prompts and codebase exploration
argument-hint: [optional description]
---

# /jira-create - Create Jira Ticket

Create a new Jira ticket using the `jira-ticket-creator` agent.

## Usage

```
/jira-create [optional description]
```

## Workflow

Launch the `jira-ticket-creator` agent with any initial description provided.

The agent will:
1. Check for duplicate tickets first (REQUIRED)
2. Gather ticket requirements through clarifying questions
3. Explore the codebase for relevant context
4. Suggest appropriate issue type, labels, components, and priority
5. Draft a comprehensive ticket description using Jira markup
6. Create the ticket in Jira
7. Offer to start work immediately with `/jira-start`

## Screenshot Handling

If the user has shared any screenshots or images in the conversation, explicitly mention them in the agent prompt so they can be included in the ticket for visual context.

## After Completion

Provide:
- Ticket key (e.g., PROJ-123) and URL
- Summary of what was created
- Option to start work immediately
