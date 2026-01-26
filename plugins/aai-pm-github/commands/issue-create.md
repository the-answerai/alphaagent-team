---
description: Create a new GitHub issue with guided prompts and codebase exploration
argument-hint: [optional description]
---

# /issue-create - Create GitHub Issue

Create a new GitHub issue using the `github-issue-creator` agent.

## Usage

```
/issue-create [optional description]
```

## Workflow

Launch the `github-issue-creator` agent with any initial description provided.

The agent will:
1. Check for duplicate issues first (REQUIRED)
2. Gather issue requirements through clarifying questions
3. Explore the codebase for relevant context
4. Suggest appropriate labels and milestone
5. Draft a comprehensive issue description
6. Create the issue in GitHub
7. Offer to start work immediately with `/issue-start`

## Screenshot Handling

If the user has shared any screenshots or images in the conversation, explicitly mention them in the agent prompt so they can be included in the issue for visual context.

## After Completion

Provide:
- Issue number and URL
- Summary of what was created
- Option to start work immediately
