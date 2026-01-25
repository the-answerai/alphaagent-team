---
name: jira-triage
description: Patterns for triaging Jira tickets - categorization, prioritization, and routing methodology.
---

# Jira Triage Skill

This skill provides methodology and patterns for efficient Jira ticket triage, ensuring proper categorization, prioritization, and routing.

## Triage Principles

### Goals of Triage
1. Every ticket has appropriate priority
2. Every ticket has correct categorization
3. Every ticket is routed to right team/person
4. Duplicates are identified and merged
5. Backlog stays healthy and actionable

### Triage Frequency
- **Critical/Blocker**: Immediate (as reported)
- **High Priority**: Daily
- **Medium/Low**: Weekly or sprint planning

---

## Prioritization Framework

### Priority Matrix

| Impact \ Urgency | Urgent | Not Urgent |
|------------------|--------|------------|
| **High Impact** | Blocker/Critical | High |
| **Low Impact** | Medium | Low |

### Priority Definitions

**Blocker**
- Production system down
- Data loss or corruption
- Security breach
- Revenue-critical feature broken
- Response: Immediate, drop everything

**Critical**
- Major feature not working
- Affecting many users
- No workaround available
- Response: Same day

**High**
- Significant impact on users
- Workaround exists but painful
- Business timeline dependent
- Response: Current sprint

**Medium**
- Moderate user impact
- Workaround available
- Important but not urgent
- Response: Next 2-3 sprints

**Low**
- Minor inconvenience
- Affects few users
- Nice to have improvement
- Response: Backlog, as capacity allows

### Priority Decision Tree

```
Is production down or data at risk?
├── Yes → Blocker
└── No
    └── Are many users significantly impacted?
        ├── Yes → Is there a workaround?
        │   ├── No → Critical
        │   └── Yes → High
        └── No
            └── Is this blocking important work?
                ├── Yes → High
                └── No → Medium or Low
```

---

## Categorization

### Issue Type Selection

| Issue Type | When to Use | Examples |
|------------|-------------|----------|
| Bug | Something broken | Error messages, crashes, incorrect behavior |
| Story | New user value | Features, enhancements |
| Task | Technical work | Refactoring, upgrades, maintenance |
| Epic | Large initiative | Multi-sprint features |
| Sub-task | Part of larger item | Steps within story |
| Spike | Research needed | Investigation, POC |

### Common Labels

**Status Labels**:
- `blocked` - Waiting on something
- `needs-info` - Requires clarification
- `needs-design` - Requires design input
- `needs-qa` - Requires QA review

**Type Labels**:
- `tech-debt` - Technical improvement
- `security` - Security related
- `performance` - Performance issue
- `accessibility` - A11y improvement
- `documentation` - Docs needed

**Source Labels**:
- `customer-reported` - From customer
- `internal` - Found internally
- `automated` - From monitoring/tests

### Component Assignment

Map tickets to system components:
- Enables team routing
- Improves reporting
- Helps identify problem areas

```
Frontend → UI Team
Backend → API Team
Database → Platform Team
Infrastructure → DevOps Team
Mobile → Mobile Team
```

---

## Routing Rules

### Team Assignment

```
IF component = Frontend AND type = Bug
THEN assign to → Frontend On-Call

IF priority = Blocker OR Critical
THEN assign to → Team Lead + notify Slack channel

IF labels contains "security"
THEN assign to → Security Team

IF reporter = External Customer
THEN add label "customer-reported" AND assign to Support
```

### Escalation Paths

| Scenario | Escalation |
|----------|------------|
| Security issue | → Security lead, mark confidential |
| Customer escalation | → Customer success + engineering lead |
| Cross-team dependency | → Affected team leads |
| Architectural question | → Tech lead or architect |
| Priority dispute | → Product manager |

---

## Duplicate Detection

### Search Strategies

1. **Text similarity**:
   ```
   text ~ "error message" ORDER BY created DESC
   ```

2. **Same reporter, recent**:
   ```
   reporter = currentUser() AND created >= -7d
   ```

3. **Same component/area**:
   ```
   component = Backend AND text ~ "timeout" AND created >= -30d
   ```

4. **Error patterns**:
   - Same stack trace
   - Same error code
   - Same affected endpoint

### Handling Duplicates

**Keep the older ticket if**:
- More context/discussion
- Already has work done
- More watchers/stakeholders

**Keep the newer ticket if**:
- Better written
- More accurate information
- Original was closed/stale

**Merge Process**:
1. Link as "duplicates" / "is duplicated by"
2. Copy relevant info to primary ticket
3. Close duplicate with comment
4. Notify duplicate reporter

---

## Triage Workflow

### Individual Ticket Triage

```markdown
1. Read ticket completely
2. Check for duplicates
3. Assess priority using framework
4. Assign issue type
5. Add appropriate labels
6. Assign component(s)
7. Route to team/individual
8. Add triage comment if needed
```

### Batch Triage Session

```markdown
1. Query untriaged tickets
2. Sort by age (oldest first) or priority (highest first)
3. Quick assessment of each:
   - Set priority
   - Add labels
   - Identify duplicates
4. Deep dive on complex tickets
5. Generate triage report
```

### Triage Meeting Agenda

```
1. Review new tickets (15 min)
   - Prioritize blockers/critical
   - Identify quick wins

2. Discuss ambiguous items (10 min)
   - Get product input on priority
   - Clarify requirements

3. Duplicate review (5 min)
   - Merge identified duplicates

4. Backlog health check (5 min)
   - Stale tickets review
   - Capacity vs backlog size
```

---

## Triage Queries (JQL)

### Untriaged Tickets
```
project = PROJ AND
priority IS EMPTY AND
created >= -7d
ORDER BY created ASC
```

### Needs Attention
```
project = PROJ AND
(labels IS EMPTY OR component IS EMPTY) AND
status != Done
ORDER BY priority DESC, created ASC
```

### Potential Duplicates
```
project = PROJ AND
text ~ "specific error message" AND
status != Done
ORDER BY created DESC
```

### Stale Tickets
```
project = PROJ AND
status = "To Do" AND
updated <= -90d
ORDER BY updated ASC
```

### High Priority Unassigned
```
project = PROJ AND
priority in (Blocker, Critical, High) AND
assignee IS EMPTY AND
status = "To Do"
```

---

## Quality Checks

### Before Closing Triage

- [ ] All tickets have priority
- [ ] All tickets have issue type
- [ ] High/Critical tickets have assignee
- [ ] Duplicates merged
- [ ] Blockers escalated appropriately
- [ ] Ambiguous tickets have clarifying comments
- [ ] Triage notes added where helpful
