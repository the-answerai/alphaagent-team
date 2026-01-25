---
name: technical-planning
description: Sprint planning and technical roadmap patterns
user-invocable: false
---

# Technical Planning Skill

Patterns for sprint planning and technical roadmaps.

## Sprint Planning

### Story Point Estimation

```markdown
## Fibonacci Scale (Recommended)

| Points | Description | Examples |
|--------|-------------|----------|
| 1 | Trivial | Config change, copy update |
| 2 | Simple | Bug fix, small feature |
| 3 | Medium | Standard feature, API endpoint |
| 5 | Complex | Multi-component feature |
| 8 | Large | Cross-service feature |
| 13 | Very Large | Should be broken down |

## T-Shirt Sizing (Alternative)

| Size | Points | Description |
|------|--------|-------------|
| XS | 1 | < 2 hours |
| S | 2-3 | < 1 day |
| M | 5 | 1-2 days |
| L | 8 | 3-5 days |
| XL | 13+ | > 1 week, break down |
```

### Sprint Capacity

```markdown
## Team Capacity Calculation

Team Size: 5 developers
Sprint Length: 2 weeks (10 working days)
Ceremonies: 1 day equivalent
PTO/Holidays: 2 days
Buffer (bugs, support): 20%

Available Days: (5 × 10) - (1 × 5) - 2 = 43 days
Effective Capacity: 43 × 0.8 = 34.4 days

At 6 points/dev/day:
Sprint Capacity: ~35-40 points
```

### Sprint Backlog

```markdown
## Sprint 12 - User Management

### Sprint Goal
Enable users to manage their profiles and preferences.

### Committed Stories

| ID | Title | Points | Owner |
|----|-------|--------|-------|
| US-101 | Profile page UI | 5 | @alice |
| US-102 | Update profile API | 3 | @bob |
| US-103 | Profile image upload | 5 | @alice |
| US-104 | Email preferences | 3 | @carol |
| US-105 | Password change | 3 | @bob |
| BUG-45 | Login redirect issue | 2 | @dave |

**Total Points:** 21
**Team Capacity:** 35

### Stretch Goals
| ID | Title | Points |
|----|-------|--------|
| US-106 | Two-factor setup | 5 |
| US-107 | Session management | 3 |
```

## Technical Roadmap

### Quarterly Planning

```markdown
# Q1 2024 Technical Roadmap

## Theme: Foundation & Scale

### January
- [ ] Database migration to PostgreSQL 15
- [ ] Implement connection pooling
- [ ] Set up monitoring (Datadog)

### February
- [ ] API rate limiting
- [ ] Caching layer (Redis)
- [ ] Performance baseline

### March
- [ ] Horizontal scaling (K8s)
- [ ] CDN integration
- [ ] Load testing

## Key Metrics
| Metric | Current | Target |
|--------|---------|--------|
| API p95 | 450ms | < 200ms |
| Uptime | 99.5% | 99.9% |
| Deploys/week | 2 | 10 |

## Dependencies
- DevOps team for K8s setup
- Security review for rate limiting
- Budget approval for Datadog
```

### Release Planning

```markdown
# Release Plan: v2.0

## Release Date: 2024-03-15

### Features
1. **User Dashboard Redesign** (Epic-101)
   - New layout with widgets
   - Customizable sections
   - Performance improvements

2. **Team Management** (Epic-102)
   - Invite team members
   - Role-based permissions
   - Team analytics

3. **API v2** (Epic-103)
   - GraphQL endpoint
   - Improved pagination
   - Webhook support

### Technical Requirements
- Database migrations for teams
- New auth scopes
- API versioning infrastructure

### Rollout Plan
1. Week -2: Feature freeze, testing
2. Week -1: Beta release to 10% users
3. Week 0: Full rollout
4. Week +1: Monitoring, hotfixes

### Rollback Plan
- Feature flags for instant disable
- Database migration rollback scripts
- Previous version deployment ready
```

## Task Breakdown

### Epic to Story Breakdown

```markdown
# Epic: User Authentication

## User Stories

### US-001: Email/Password Login (8 pts)
Tasks:
- [ ] Create login form component (2 pts)
- [ ] Implement login API endpoint (2 pts)
- [ ] Add form validation (1 pt)
- [ ] Add error handling (1 pt)
- [ ] Write tests (2 pts)

### US-002: OAuth Login (5 pts)
Tasks:
- [ ] Integrate Google OAuth (2 pts)
- [ ] Integrate GitHub OAuth (2 pts)
- [ ] Handle OAuth callbacks (1 pt)

### US-003: Password Reset (5 pts)
Tasks:
- [ ] Password reset request form (1 pt)
- [ ] Send reset email (2 pts)
- [ ] Reset password form (1 pt)
- [ ] Update password API (1 pt)

### US-004: Remember Me (3 pts)
Tasks:
- [ ] Extend session duration option (1 pt)
- [ ] Secure token storage (1 pt)
- [ ] Auto-refresh tokens (1 pt)
```

### Definition of Done

```markdown
## Definition of Done

### Code
- [ ] Code reviewed and approved
- [ ] Unit tests written (80% coverage)
- [ ] Integration tests for APIs
- [ ] No linting errors
- [ ] No TypeScript errors

### Documentation
- [ ] API documentation updated
- [ ] README updated if needed
- [ ] ADR created for architectural changes

### Quality
- [ ] Manual QA passed
- [ ] No P1/P2 bugs
- [ ] Performance benchmarks met
- [ ] Accessibility checked

### Deployment
- [ ] Feature flag configured
- [ ] Monitoring alerts set up
- [ ] Rollback plan documented
- [ ] Deployed to staging
```

## Risk Management

### Technical Risk Assessment

```markdown
## Risk Register

### R-001: Database Migration Failure
**Probability:** Medium
**Impact:** High
**Score:** High

**Mitigation:**
- Backup before migration
- Test on staging with prod data copy
- Off-hours migration window
- Rollback scripts ready

**Contingency:**
- Restore from backup
- Notify stakeholders
- Post-mortem

### R-002: Third-party API Downtime
**Probability:** Low
**Impact:** High
**Score:** Medium

**Mitigation:**
- Circuit breakers
- Graceful degradation
- Cached responses

**Contingency:**
- Switch to backup provider
- Manual processing queue
```

## Velocity Tracking

```markdown
## Sprint Velocity

| Sprint | Committed | Completed | Velocity |
|--------|-----------|-----------|----------|
| 8 | 35 | 32 | 32 |
| 9 | 35 | 35 | 35 |
| 10 | 38 | 36 | 36 |
| 11 | 36 | 38 | 38 |
| 12 | 38 | 35 | 35 |

**Average Velocity:** 35.2 points
**Standard Deviation:** 2.1 points
**Recommended Commitment:** 33-37 points
```

## Integration

Used by:
- `tech-lead` agent
- `requirements-analyst` agent
- `system-architect` agent
