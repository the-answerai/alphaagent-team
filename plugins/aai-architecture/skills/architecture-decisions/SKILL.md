---
name: architecture-decisions
description: Architecture Decision Records (ADR) patterns
user-invocable: false
---

# Architecture Decisions Skill

Patterns for documenting architecture decisions.

## ADR Template

```markdown
# ADR-{number}: {title}

## Status
{Proposed | Accepted | Deprecated | Superseded by ADR-XXX}

## Date
YYYY-MM-DD

## Context
What is the issue that we're seeing that is motivating this decision?
What constraints exist? What forces are at play?

## Decision
What is the change that we're proposing and/or doing?

## Consequences
What becomes easier or more difficult because of this change?

### Positive
- Benefit 1
- Benefit 2

### Negative
- Drawback 1
- Drawback 2

### Risks
- Risk 1 and mitigation
- Risk 2 and mitigation

## Alternatives Considered
What other options were evaluated?

### Option A: {name}
- Pros: ...
- Cons: ...

### Option B: {name}
- Pros: ...
- Cons: ...

## References
- Link to relevant documentation
- Link to related ADRs
```

## Example ADRs

### Database Selection

```markdown
# ADR-001: Use PostgreSQL as Primary Database

## Status
Accepted

## Date
2024-01-15

## Context
We need to select a primary database for our application. The application
requires:
- Complex relational data with joins
- ACID transactions
- Strong consistency
- JSON support for flexible schemas
- Full-text search capabilities

Our team has experience with PostgreSQL and MySQL. We expect to handle
10,000 concurrent users with ~1M total records initially.

## Decision
We will use PostgreSQL 15 as our primary database.

## Consequences

### Positive
- Strong ACID guarantees for financial transactions
- Native JSON/JSONB support for flexible document storage
- Full-text search without external dependencies
- Extensive ecosystem and community support
- Team familiarity reduces learning curve

### Negative
- More complex scaling than NoSQL alternatives
- Requires careful connection pool management
- Higher operational overhead than managed NoSQL

### Risks
- Scaling beyond single instance requires read replicas
  - Mitigation: Design for read/write splitting from start
- Connection exhaustion under high load
  - Mitigation: Use PgBouncer connection pooling

## Alternatives Considered

### MongoDB
- Pros: Easier horizontal scaling, flexible schema
- Cons: Weaker consistency, no native joins, learning curve

### MySQL
- Pros: Team familiarity, simple replication
- Cons: Weaker JSON support, inferior full-text search

## References
- [PostgreSQL 15 Release Notes](https://www.postgresql.org/docs/15/release-15.html)
- ADR-005: Database Connection Pooling (pending)
```

### API Design

```markdown
# ADR-002: Use REST with OpenAPI for External API

## Status
Accepted

## Date
2024-01-20

## Context
We need to expose an API for third-party integrations. Requirements:
- Easy to understand for external developers
- Strong documentation
- Language-agnostic client generation
- Caching at CDN level

Internal services may have different requirements.

## Decision
Use REST with OpenAPI 3.0 specification for all external APIs.
Internal services may use gRPC where appropriate.

## Consequences

### Positive
- Industry standard, well understood
- Auto-generated documentation via Swagger UI
- Client SDK generation for multiple languages
- HTTP caching works out of the box
- Easy debugging with standard HTTP tools

### Negative
- Multiple round trips for complex queries
- Over-fetching/under-fetching of data
- Less efficient than binary protocols

### Risks
- Version management complexity
  - Mitigation: URL versioning (/v1/, /v2/)

## Alternatives Considered

### GraphQL
- Pros: Flexible queries, single endpoint
- Cons: Caching complexity, learning curve for partners

### gRPC
- Pros: High performance, strong typing
- Cons: Not browser-friendly, harder debugging

## References
- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.3)
- ADR-003: Internal Service Communication (pending)
```

### Authentication

```markdown
# ADR-003: Use Auth0 for Authentication

## Status
Accepted

## Date
2024-01-25

## Context
We need authentication for our web application and API. Requirements:
- OAuth 2.0 / OIDC support
- Social login (Google, GitHub)
- Multi-factor authentication
- Organization/team management
- SAML for enterprise SSO

Team size: 5 engineers, limited security expertise.
Timeline: 3 months to launch.

## Decision
Use Auth0 as our identity provider.

## Consequences

### Positive
- Battle-tested security (SOC 2, HIPAA compliant)
- All required features out of the box
- Reduces development time significantly
- Offloads security liability
- Excellent documentation and SDKs

### Negative
- Monthly cost (~$500-2000/month at scale)
- Vendor lock-in concerns
- Less control over authentication flow
- External dependency for critical path

### Risks
- Auth0 outage affects all users
  - Mitigation: Token caching, graceful degradation
- Cost growth with user count
  - Mitigation: Monitor usage, evaluate alternatives at scale

## Alternatives Considered

### Keycloak (Self-hosted)
- Pros: No vendor lock-in, free
- Cons: Operational overhead, security responsibility

### Firebase Auth
- Pros: Google integration, generous free tier
- Cons: Limited enterprise features, less flexible

## References
- [Auth0 Pricing](https://auth0.com/pricing)
- [Auth0 SOC 2 Report](https://auth0.com/security)
```

## ADR Organization

### File Structure

```
docs/
└── architecture/
    └── decisions/
        ├── README.md           # Index and guidelines
        ├── 0001-database.md
        ├── 0002-api-design.md
        ├── 0003-authentication.md
        └── template.md         # ADR template
```

### Index README

```markdown
# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for the project.

## What is an ADR?
An ADR is a document that captures an important architectural decision
made along with its context and consequences.

## How to Create an ADR
1. Copy `template.md` to `NNNN-title.md`
2. Fill in the template
3. Submit PR for review
4. Update status after team approval

## ADR Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| 001 | Use PostgreSQL | Accepted | 2024-01-15 |
| 002 | REST with OpenAPI | Accepted | 2024-01-20 |
| 003 | Auth0 Authentication | Accepted | 2024-01-25 |
| 004 | Redis for Caching | Proposed | 2024-02-01 |
```

## ADR Lifecycle

```
                    ┌─────────────┐
                    │  Proposed   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │ Accepted │  │ Rejected │  │ Deferred │
       └────┬─────┘  └──────────┘  └──────────┘
            │
            ├────────────────┐
            ▼                ▼
     ┌────────────┐   ┌─────────────────┐
     │ Deprecated │   │ Superseded by X │
     └────────────┘   └─────────────────┘
```

## Decision Criteria

### When to Create an ADR

- Choosing a technology stack component
- Defining API contracts
- Setting coding standards
- Establishing deployment strategies
- Making security architecture decisions
- Defining data storage approaches

### When NOT to Create an ADR

- Minor implementation details
- Temporary solutions
- Team preferences without architectural impact
- Decisions that can easily be reversed

## Integration

Used by:
- `system-architect` agent
- `tech-lead` agent
- `requirements-analyst` agent
