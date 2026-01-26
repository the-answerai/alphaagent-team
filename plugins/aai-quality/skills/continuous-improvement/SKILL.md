---
name: continuous-improvement
description: Continuous improvement processes and patterns
---

# Continuous Improvement Skill

Patterns for implementing continuous improvement.

## PDCA Cycle

### Plan-Do-Check-Act

```markdown
## PDCA Framework

### Plan
1. Identify improvement opportunity
2. Analyze current state
3. Define target state
4. Create action plan

### Do
1. Implement change on small scale
2. Document what happens
3. Collect data
4. Note any problems

### Check
1. Analyze results
2. Compare to target
3. Identify what worked
4. Learn from failures

### Act
1. Standardize successful changes
2. Share learnings
3. Plan next cycle
4. Abandon what didn't work
```

### Example PDCA

```markdown
## PDCA: Reduce Code Review Time

### Plan
**Problem:** Code reviews take 3+ days on average
**Target:** Reduce to < 1 day
**Root Cause:** No SLA, large PRs, unclear ownership

**Actions:**
1. Set 24-hour review SLA
2. Limit PR size to 400 lines
3. Auto-assign reviewers

### Do
**Implementation:**
- Communicated new policy
- Added PR size linting
- Set up auto-assignment bot
- Tracked metrics for 2 weeks

### Check
**Results:**
- Average review time: 3.2 days → 0.8 days ✅
- PR size: 650 lines → 280 lines
- Review quality: Maintained
- Team satisfaction: Improved

### Act
**Standardize:**
- Added to team handbook
- Created onboarding material
- Set up monitoring dashboard
- Sharing with other teams
```

## Kaizen

### Continuous Small Improvements

```markdown
## Kaizen Principles

### 1. Question Everything
- Why do we do it this way?
- What problem does this solve?
- Is there a better way?

### 2. Eliminate Waste
- Remove unnecessary steps
- Automate repetitive tasks
- Reduce wait times

### 3. Empower Teams
- Everyone can suggest improvements
- No idea is too small
- Celebrate incremental progress

### 4. Go to Gemba
- Observe actual work
- Talk to people doing the work
- Understand real challenges
```

### Kaizen Board

```markdown
## Improvement Ideas Board

### Ideas (Anyone can add)
- [ ] Automate test data setup
- [ ] Add keyboard shortcuts to UI
- [ ] Simplify deployment script

### In Analysis
- [ ] Cache API responses (analyzing impact)

### In Progress
- [ ] Standardize error messages (@jane)

### Completed This Month
- [x] Add pre-commit hooks
- [x] Improve logging format
- [x] Automate dependency updates
```

## Retrospectives

### Sprint Retrospective

```markdown
## Retrospective Format

### Start-Stop-Continue
**Start:** What should we start doing?
**Stop:** What should we stop doing?
**Continue:** What should we keep doing?

### 4 Ls
**Liked:** What went well?
**Learned:** What did we learn?
**Lacked:** What was missing?
**Longed For:** What do we wish we had?

### Mad-Sad-Glad
**Mad:** What frustrated us?
**Sad:** What disappointed us?
**Glad:** What made us happy?
```

### Action Item Tracking

```markdown
## Retrospective Actions

### Current Sprint Actions
| Action | Owner | Due | Status |
|--------|-------|-----|--------|
| Set up code review SLA | @jane | Jan 20 | Done |
| Add staging parallelization | @bob | Jan 25 | In Progress |
| Update onboarding docs | @alice | Jan 18 | Not Started |

### Previous Sprint Actions (Carryover)
| Action | Owner | Original Due | Status |
|--------|-------|--------------|--------|
| Improve test coverage | @charlie | Jan 5 | Delayed |

### Metrics
- Actions completed: 75%
- Average completion time: 10 days
- Carryover rate: 15%
```

## Root Cause Analysis

### 5 Whys

```markdown
## 5 Whys Example

**Problem:** Production deployment failed

**Why 1:** The deployment script exited with error
**Why 2:** Database migration failed
**Why 3:** Column already existed
**Why 4:** Migration was already run manually
**Why 5:** No tracking of manual changes

**Root Cause:** No process for tracking database changes

**Solution:**
- All database changes must go through migrations
- Add migration status check before deploy
- Document in runbook
```

### Fishbone Diagram

```markdown
## Fishbone Analysis: Slow Deployments

```
                        ┌─────────────────┐
                        │ Slow Deploys    │
                        └────────┬────────┘
                                 │
    ┌────────────────────────────┼────────────────────────────┐
    │                            │                            │
┌───┴────┐                  ┌────┴────┐                  ┌────┴────┐
│ People │                  │ Process │                  │  Tools  │
├────────┤                  ├─────────┤                  ├─────────┤
│ Manual │                  │ Serial  │                  │ Old CI  │
│ steps  │                  │ stages  │                  │ system  │
│        │                  │         │                  │         │
│ Review │                  │ No      │                  │ No      │
│ delays │                  │ parallel│                  │ caching │
└────────┘                  └─────────┘                  └─────────┘
```

**Actions:**
- People: Automate manual steps, set review SLA
- Process: Parallelize independent stages
- Tools: Upgrade CI, implement caching
```

## Improvement Metrics

### Tracking Progress

```markdown
## Improvement Metrics

### Lead Time
Time from commit to production.

Baseline: 5 days
Target: 1 day
Current: 2 days

### Deployment Frequency
How often we deploy.

Baseline: Weekly
Target: Daily
Current: Every 2 days

### Change Failure Rate
Percentage of deploys causing issues.

Baseline: 15%
Target: 5%
Current: 8%

### Mean Time to Recovery
Time to restore service after failure.

Baseline: 4 hours
Target: 30 minutes
Current: 1 hour
```

### Trend Visualization

```markdown
## Improvement Trends (6 months)

### Lead Time (days)
Jan: █████████████████████████ 5.0
Feb: ████████████████████ 4.0
Mar: ███████████████ 3.0
Apr: ███████████ 2.2
May: ██████████ 2.0
Jun: █████████ 1.8

### Deployment Frequency (per week)
Jan: ██ 1
Feb: ███ 1.5
Mar: ████ 2
Apr: ██████ 3
May: █████████ 4.5
Jun: ██████████ 5
```

## Knowledge Sharing

### Lessons Learned

```markdown
## Lessons Learned Template

### Title
[Brief description of the learning]

### Context
What situation led to this learning?

### What Happened
What occurred? What was the outcome?

### Key Takeaway
What's the main lesson?

### Recommendations
What should we do differently?

### Applicable To
What other situations does this apply to?
```

### Best Practice Documentation

```markdown
## Best Practices Registry

### Development
- [ ] Feature flags for risky changes
- [ ] Trunk-based development
- [ ] Pair programming for complex features

### Testing
- [ ] Test pyramid approach
- [ ] Mutation testing for critical code
- [ ] Contract testing for APIs

### Deployment
- [ ] Blue-green deployments
- [ ] Automated rollbacks
- [ ] Gradual rollouts

### Monitoring
- [ ] SLOs with error budgets
- [ ] Distributed tracing
- [ ] Structured logging
```

## Integration

Used by:
- `improvement-coordinator` agent
- `quality-analyst` agent
