---
description: Set up CI/CD pipeline with GitHub Actions including testing, building, and deployment
argument-hint: [workflow type]
---

# /ci-setup - Set Up CI/CD Pipeline

Set up a CI/CD pipeline with GitHub Actions.

## Usage

```
/ci-setup
/ci-setup with deployment to Vercel
/ci-setup for monorepo
```

## Workflow

1. **Analyze Project**
   - Detect package manager and build tools
   - Identify test frameworks
   - Understand deployment targets

2. **Create Workflows**
   - PR checks (lint, test, build)
   - Main branch deployment
   - Release automation

3. **Configure Features**
   - Caching for faster builds
   - Matrix testing (multiple Node versions)
   - Artifact uploads
   - Code coverage reporting

4. **Security Setup**
   - Secret management guidance
   - Environment protection rules
   - Dependency scanning

5. **Documentation**
   - Workflow explanations
   - Required secrets list
   - Troubleshooting guide

## Output

- `.github/workflows/ci.yml` - PR checks
- `.github/workflows/deploy.yml` - Deployment
- `.github/workflows/release.yml` - Release automation
- Setup instructions
