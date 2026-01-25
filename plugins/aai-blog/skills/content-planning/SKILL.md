---
name: content-planning
description: Content strategy and planning patterns
user-invocable: false
---

# Content Planning Skill

Patterns for content strategy and editorial planning.

## Content Calendar

### Monthly Planning

```markdown
# Content Calendar - [Month] [Year]

## Theme: [Monthly Focus]

### Week 1

| Day | Type | Title | Author | Status |
|-----|------|-------|--------|--------|
| Mon | Blog | [Title] | @author | Draft |
| Wed | Tutorial | [Title] | @author | Planned |
| Fri | Social | [Topic] | @author | Scheduled |

### Week 2

| Day | Type | Title | Author | Status |
|-----|------|-------|--------|--------|
| Tue | Feature Launch | [Title] | @author | Planned |
| Thu | Case Study | [Title] | @author | In Review |

### Week 3

...

### Week 4

...

## Upcoming
- [Title 1] - needs research
- [Title 2] - waiting on data
```

### Content Pipeline

```markdown
## Content Pipeline

### Backlog (Prioritized)
1. [Topic] - High demand, medium effort
2. [Topic] - Product launch tie-in
3. [Topic] - SEO opportunity

### In Progress

| Title | Stage | Author | Due |
|-------|-------|--------|-----|
| [Title] | Writing | @jane | Jan 15 |
| [Title] | Review | @john | Jan 12 |
| [Title] | Design | @sara | Jan 14 |

### Scheduled

| Title | Publish Date | Channels |
|-------|-------------|----------|
| [Title] | Jan 20 | Blog, Email |
| [Title] | Jan 25 | Blog, Social |

### Published This Month
- [Title] - [Date] - [Metrics]
```

## Content Types

### Content Mix

```markdown
## Recommended Mix

### By Purpose (Monthly)
- 40% Educational (tutorials, guides)
- 30% Product (features, updates)
- 20% Thought Leadership (insights, trends)
- 10% Community (case studies, spotlights)

### By Format
- 60% Blog posts
- 20% Tutorials
- 10% Videos
- 10% Infographics

### By Funnel Stage
- 40% Awareness (SEO, social)
- 35% Consideration (comparisons, deep dives)
- 25% Decision (case studies, demos)
```

### Content Templates

```markdown
## Template Library

### Tutorial Template
- Time: 2-4 hours to write
- Word count: 1500-2500
- Structure: What/Why/How
- Assets: Screenshots, code

### Feature Announcement
- Time: 1-2 hours
- Word count: 500-800
- Structure: Problem/Solution/CTA
- Assets: GIFs, screenshots

### Technical Deep Dive
- Time: 4-8 hours
- Word count: 2500-4000
- Structure: Problem/Approach/Results
- Assets: Diagrams, code

### Case Study
- Time: 3-5 hours
- Word count: 1000-1500
- Structure: Challenge/Solution/Results
- Assets: Quotes, metrics
```

## Topic Research

### Idea Generation

```markdown
## Topic Sources

### Internal
- Product roadmap features
- Support ticket themes
- Sales objections
- Team expertise

### External
- Competitor content
- Industry trends
- Community questions
- Search trends

### User Research
- Survey feedback
- Interview insights
- Feature requests
- Community discussions
```

### Topic Prioritization

```markdown
## Prioritization Matrix

### Criteria (1-5 each)
- Business Impact: Does it drive goals?
- Audience Interest: Is there demand?
- Competitive Gap: Is it differentiated?
- Effort Required: Can we execute?
- Timeliness: Is there urgency?

### Example Evaluation

| Topic | Impact | Interest | Gap | Effort | Time | Score |
|-------|--------|----------|-----|--------|------|-------|
| [Topic A] | 5 | 4 | 3 | 3 | 4 | 19 |
| [Topic B] | 3 | 5 | 4 | 4 | 2 | 18 |
| [Topic C] | 4 | 3 | 5 | 2 | 3 | 17 |
```

## Editorial Workflow

### Stages

```markdown
## Content Workflow

### 1. Ideation
- Topic proposal
- Outline draft
- Stakeholder input
→ Approval required

### 2. Creation
- First draft
- Asset creation
- Code examples
→ Self-review

### 3. Review
- Peer review
- Technical review
- Legal review (if needed)
→ Feedback incorporated

### 4. Polish
- Copy editing
- SEO optimization
- Asset finalization
→ Final approval

### 5. Publish
- CMS upload
- Schedule/publish
- Distribution
→ Promotion begins

### 6. Measure
- Track metrics
- Gather feedback
- Update as needed
→ Learnings captured
```

### Review Checklist

```markdown
## Review Checklist

### Technical Review
- [ ] Code examples work
- [ ] Technical accuracy verified
- [ ] API/version references correct
- [ ] Security best practices followed

### Editorial Review
- [ ] Clear and well-structured
- [ ] Grammar and spelling correct
- [ ] Consistent terminology
- [ ] Links verified

### SEO Review
- [ ] Target keyword in title
- [ ] Meta description compelling
- [ ] Headers include keywords
- [ ] Internal links added

### Brand Review
- [ ] Tone matches brand voice
- [ ] Visuals on-brand
- [ ] Legal requirements met
```

## Metrics

### Key Metrics

```markdown
## Content Metrics

### Traffic
- Page views
- Unique visitors
- Time on page
- Bounce rate

### Engagement
- Scroll depth
- Social shares
- Comments
- Backlinks

### Conversion
- Email signups
- Trial starts
- Demo requests
- Documentation visits

### SEO
- Keyword rankings
- Organic traffic
- SERP features
- Domain authority
```

### Reporting Template

```markdown
## Monthly Content Report

### Summary
- Articles published: X
- Total views: X
- Top performer: [Title]

### Performance by Type

| Type | Count | Avg Views | Avg Time |
|------|-------|-----------|----------|
| Tutorial | 4 | 2,500 | 5:30 |
| Feature | 2 | 1,200 | 2:15 |
| Blog | 6 | 800 | 3:00 |

### Top Performers

1. [Title] - 5,000 views
2. [Title] - 3,200 views
3. [Title] - 2,800 views

### Learnings
- [What worked]
- [What to improve]
- [Opportunities identified]

### Next Month Focus
- [Priority 1]
- [Priority 2]
```

## Integration

Used by:
- `blog-writer` agent
- `tutorial-writer` agent
- `announcement-writer` agent
