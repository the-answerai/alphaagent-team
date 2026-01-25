---
name: evaluation-frameworks
description: Evaluation frameworks and assessment methodologies
user-invocable: false
---

# Evaluation Frameworks Skill

Frameworks for evaluating software and AI systems.

## LLM Evaluation

### Response Quality

```markdown
## LLM Response Evaluation

### Accuracy
Does the response contain correct information?

Rubric (1-5):
5 - Completely accurate
4 - Mostly accurate, minor errors
3 - Partially accurate
2 - Significant errors
1 - Incorrect

### Relevance
Does the response address the question?

Rubric (1-5):
5 - Directly addresses all aspects
4 - Addresses main points
3 - Partially relevant
2 - Mostly off-topic
1 - Completely irrelevant

### Helpfulness
Does the response help the user?

Rubric (1-5):
5 - Extremely helpful, actionable
4 - Helpful with good guidance
3 - Somewhat helpful
2 - Minimally helpful
1 - Not helpful
```

### LLM-as-Judge

```typescript
// LLM-based evaluation
interface JudgePrompt {
  criteria: string
  rubric: string
  task: string
  response: string
}

const judgePrompt = `
You are evaluating an AI response. Score it 1-5 based on the criteria.

## Criteria
${criteria}

## Rubric
${rubric}

## Task
${task}

## Response to Evaluate
${response}

## Instructions
1. Consider each aspect of the rubric
2. Identify strengths and weaknesses
3. Provide a score from 1-5
4. Explain your reasoning

Output format:
Score: [1-5]
Reasoning: [explanation]
`

async function evaluateWithJudge(
  response: string,
  task: string,
  criteria: string
): Promise<EvaluationResult> {
  const judgeResponse = await llm.complete(
    judgePrompt.replace('${response}', response)
                .replace('${task}', task)
                .replace('${criteria}', criteria)
  )

  return parseJudgeResponse(judgeResponse)
}
```

## Code Quality Evaluation

### Code Review Rubric

```markdown
## Code Review Evaluation

### Correctness
- Logic is sound
- Handles edge cases
- No obvious bugs

### Design
- Follows SOLID principles
- Appropriate abstractions
- Clean architecture

### Security
- No vulnerabilities
- Input validation
- Proper authentication

### Performance
- Efficient algorithms
- No N+1 queries
- Appropriate caching

### Maintainability
- Clear naming
- Good documentation
- Easy to modify

### Testing
- Adequate coverage
- Meaningful tests
- Edge cases covered
```

### Automated Assessment

```typescript
// Code quality scoring
interface CodeQualityScore {
  overall: number
  dimensions: {
    complexity: number
    coverage: number
    duplication: number
    documentation: number
    security: number
  }
}

async function assessCodeQuality(
  filepath: string
): Promise<CodeQualityScore> {
  const [
    complexity,
    coverage,
    duplication,
    documentation,
    security
  ] = await Promise.all([
    analyzeComplexity(filepath),
    getCoverage(filepath),
    findDuplication(filepath),
    checkDocumentation(filepath),
    scanSecurity(filepath)
  ])

  const overall = calculateWeightedScore({
    complexity: { score: complexity, weight: 0.2 },
    coverage: { score: coverage, weight: 0.25 },
    duplication: { score: duplication, weight: 0.15 },
    documentation: { score: documentation, weight: 0.15 },
    security: { score: security, weight: 0.25 }
  })

  return { overall, dimensions: { complexity, coverage, duplication, documentation, security } }
}
```

## Agent Evaluation

### Task Completion

```markdown
## Agent Task Evaluation

### Success Rate
Percentage of tasks completed successfully.

Formula: Successful Tasks / Total Tasks × 100

### Accuracy
How correct are the results?

Assessment:
- Compare output to expected result
- Check for errors or omissions
- Validate against requirements

### Efficiency
Resources used to complete task.

Metrics:
- Time to complete
- Token usage
- API calls made
- Iterations needed
```

### Benchmark Suite

```typescript
// Agent benchmark definition
interface AgentBenchmark {
  name: string
  tasks: EvaluationTask[]
  evaluators: Evaluator[]
  passCriteria: PassCriteria
}

interface EvaluationTask {
  id: string
  input: string
  expectedBehavior: string
  category: string
  difficulty: 'easy' | 'medium' | 'hard'
}

// Run benchmark
async function runBenchmark(
  agent: Agent,
  benchmark: AgentBenchmark
): Promise<BenchmarkResult> {
  const results: TaskResult[] = []

  for (const task of benchmark.tasks) {
    const startTime = Date.now()
    const response = await agent.execute(task.input)
    const endTime = Date.now()

    const scores = await Promise.all(
      benchmark.evaluators.map(e => e.evaluate(task, response))
    )

    results.push({
      taskId: task.id,
      success: scores.every(s => s.passed),
      scores,
      latency: endTime - startTime,
      tokenUsage: response.usage
    })
  }

  return aggregateResults(results, benchmark.passCriteria)
}
```

## A/B Testing Framework

### Experiment Design

```markdown
## A/B Test Design

### Hypothesis
Clear statement of what you expect to change.

Example: "New prompt format will increase accuracy by 10%"

### Metrics
Primary: The main metric you're optimizing
Secondary: Supporting metrics to watch

### Sample Size
Calculate required sample size for statistical significance.

Formula: n = 2 × (Zα + Zβ)² × σ² / δ²

### Duration
Minimum time to run the experiment.

Consider: Traffic volume, conversion rates, seasonality

### Analysis
Statistical test to determine significance.

Common: Two-proportion z-test, t-test
```

### Statistical Analysis

```typescript
// A/B test analysis
interface ABTestResult {
  control: VariantStats
  treatment: VariantStats
  lift: number
  pValue: number
  significant: boolean
  confidenceInterval: [number, number]
}

function analyzeABTest(
  control: number[],
  treatment: number[]
): ABTestResult {
  const controlStats = calculateStats(control)
  const treatmentStats = calculateStats(treatment)

  const lift = (treatmentStats.mean - controlStats.mean) / controlStats.mean

  const { pValue, significant } = tTest(control, treatment)

  const confidenceInterval = calculateCI(
    controlStats,
    treatmentStats,
    0.95
  )

  return {
    control: controlStats,
    treatment: treatmentStats,
    lift,
    pValue,
    significant: pValue < 0.05,
    confidenceInterval
  }
}
```

## Continuous Evaluation

### Monitoring

```yaml
# Evaluation monitoring
metrics:
  - name: response_accuracy
    type: gauge
    description: Average accuracy score
    labels: [model, prompt_version]

  - name: task_success_rate
    type: gauge
    description: Percentage of successful tasks
    labels: [task_type, difficulty]

  - name: evaluation_latency
    type: histogram
    description: Time to evaluate responses
    buckets: [0.1, 0.5, 1, 5, 10]

alerts:
  - name: AccuracyDropped
    condition: response_accuracy < 0.8
    for: 10m
    severity: warning

  - name: SuccessRateLow
    condition: task_success_rate < 0.9
    for: 5m
    severity: critical
```

## Integration

Used by:
- `evaluation-specialist` agent
- `quality-analyst` agent
