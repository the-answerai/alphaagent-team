---
name: quality-metrics
description: Software quality metrics and measurement
---

# Quality Metrics Skill

Patterns for measuring software quality.

## Code Quality Metrics

### Coverage Metrics

```markdown
## Coverage Types

### Line Coverage
Percentage of code lines executed by tests.

Formula: (Executed Lines / Total Lines) × 100

Target: ≥ 80%

### Branch Coverage
Percentage of decision branches tested.

Formula: (Executed Branches / Total Branches) × 100

Target: ≥ 70%

### Function Coverage
Percentage of functions called by tests.

Formula: (Called Functions / Total Functions) × 100

Target: ≥ 85%

### Statement Coverage
Percentage of statements executed by tests.

Formula: (Executed Statements / Total Statements) × 100

Target: ≥ 80%
```

### Complexity Metrics

```markdown
## Complexity Measurements

### Cyclomatic Complexity
Number of linearly independent paths through code.

Calculation: E - N + 2P
- E = edges in flow graph
- N = nodes in flow graph
- P = connected components

| Score | Complexity | Risk |
|-------|------------|------|
| 1-10 | Simple | Low |
| 11-20 | Moderate | Medium |
| 21-50 | Complex | High |
| 50+ | Very Complex | Very High |

### Cognitive Complexity
Measures how difficult code is to understand.

Factors:
- Nesting depth
- Control flow breaks
- Multiple conditions

Target: ≤ 15 per function

### Maintainability Index
Composite metric for maintainability.

Formula: 171 - 5.2×ln(V) - 0.23×(G) - 16.2×ln(LOC)
- V = Halstead Volume
- G = Cyclomatic Complexity
- LOC = Lines of Code

| Score | Maintainability |
|-------|-----------------|
| 0-9 | Low |
| 10-19 | Moderate |
| 20+ | High |
```

## Defect Metrics

### Defect Density

```markdown
## Defect Measurements

### Defect Density
Defects per unit of code.

Formula: Total Defects / KLOC (thousands of lines)

Target: < 5 defects/KLOC

### Defect Escape Rate
Defects found after release.

Formula: (Production Bugs / Total Bugs) × 100

Target: < 5%

### Mean Time to Detect (MTTD)
Average time to discover defects.

Formula: Σ(Detection Time - Introduction Time) / Number of Defects

Target: < 1 sprint

### Mean Time to Repair (MTTR)
Average time to fix defects.

Formula: Σ(Fix Time - Report Time) / Number of Defects

Target: < 2 days for P1
```

### Defect Classification

```markdown
## Severity Levels

### Critical (P1)
- System down
- Data loss
- Security breach
- No workaround

SLA: 4 hours

### High (P2)
- Major feature broken
- Significant impact
- Workaround available

SLA: 24 hours

### Medium (P3)
- Feature partially broken
- Moderate impact
- Easy workaround

SLA: 1 week

### Low (P4)
- Minor issue
- Cosmetic
- Enhancement

SLA: Next release
```

## Performance Metrics

### Response Time

```markdown
## Latency Metrics

### Percentile Latencies
- P50 (Median): Typical user experience
- P95: Worst case for most users
- P99: Worst case experience

Targets:
- P50: < 100ms
- P95: < 200ms
- P99: < 500ms

### Throughput
Requests per second the system handles.

Formula: Total Requests / Time Period

### Error Rate
Percentage of failed requests.

Formula: (Failed Requests / Total Requests) × 100

Target: < 0.1%
```

### Availability

```markdown
## Availability Metrics

### Uptime
Percentage of time system is available.

| Nines | Uptime | Downtime/Year |
|-------|--------|---------------|
| 2 | 99% | 3.65 days |
| 3 | 99.9% | 8.76 hours |
| 4 | 99.99% | 52.6 minutes |
| 5 | 99.999% | 5.26 minutes |

### MTBF (Mean Time Between Failures)
Average time between system failures.

Formula: Total Uptime / Number of Failures

### MTTR (Mean Time To Recovery)
Average time to restore service.

Formula: Total Downtime / Number of Failures
```

## Process Metrics

### Velocity

```markdown
## Team Velocity

### Sprint Velocity
Story points completed per sprint.

Calculation: Sum of completed story points

Use: Capacity planning, predictability

### Lead Time
Time from request to delivery.

Formula: Delivery Date - Request Date

Target: < 2 weeks

### Cycle Time
Time from work start to delivery.

Formula: Delivery Date - Work Start Date

Target: < 1 week

### Deployment Frequency
How often code is deployed.

Target: Multiple times per day
```

## Reporting

### Quality Dashboard

```yaml
# Grafana dashboard definition
panels:
  - title: "Code Coverage"
    type: gauge
    thresholds:
      - value: 70
        color: red
      - value: 80
        color: yellow
      - value: 90
        color: green

  - title: "Defect Trend"
    type: graph
    queries:
      - metric: defects_open
      - metric: defects_closed

  - title: "Response Time (P95)"
    type: timeseries
    thresholds:
      - value: 200
        color: yellow
      - value: 500
        color: red
```

### Weekly Report

```markdown
## Weekly Quality Report

### Coverage
- Current: 85.2% (+1.2%)
- Target: 80% ✅

### Defects
- Open: 12 (-3)
- Critical: 0
- New this week: 5
- Fixed this week: 8

### Performance
- P95 Latency: 145ms ✅
- Error Rate: 0.02% ✅
- Uptime: 99.98% ✅

### Trends
📈 Coverage improving
📉 Defects decreasing
➡️ Performance stable
```

## Integration

Used by:
- `quality-analyst` agent
- `evaluation-specialist` agent
