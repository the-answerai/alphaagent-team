---
description: Analyze code quality including complexity, maintainability, and best practices adherence
argument-hint: [path or scope]
---

# /analyze-quality - Analyze Code Quality

Analyze code quality with metrics, patterns, and improvement recommendations.

## Usage

```
/analyze-quality
/analyze-quality src/services/
/analyze-quality --focus security
```

## Analysis Areas

1. **Code Complexity**
   - Cyclomatic complexity
   - Cognitive complexity
   - Function/file length

2. **Maintainability**
   - Code duplication
   - Dependency analysis
   - Module coupling

3. **Best Practices**
   - Design patterns usage
   - Error handling
   - Type safety

4. **Security**
   - Common vulnerabilities
   - Input validation
   - Authentication patterns

5. **Performance**
   - Potential bottlenecks
   - Memory considerations
   - Async patterns

## Output

- Quality score summary
- Issue breakdown by severity
- Specific files/functions needing attention
- Prioritized improvement recommendations
- Comparison to best practices
