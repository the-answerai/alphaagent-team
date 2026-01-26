---
name: github-actions
description: GitHub Actions workflow patterns
---

# GitHub Actions Skill

Patterns for GitHub Actions workflows.

## Workflow Triggers

### Common Triggers

```yaml
on:
  # Push events
  push:
    branches: [main, develop]
    paths:
      - 'src/**'
      - 'package.json'
    paths-ignore:
      - '**.md'
      - 'docs/**'

  # Pull requests
  pull_request:
    branches: [main]
    types: [opened, synchronize, reopened]

  # Manual trigger
  workflow_dispatch:
    inputs:
      environment:
        description: 'Deploy environment'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production

  # Scheduled
  schedule:
    - cron: '0 0 * * *'  # Daily at midnight

  # Release
  release:
    types: [published]
```

### Conditional Execution

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' || github.event.pull_request.draft == false

  deploy:
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

## Job Patterns

### Parallel Jobs

```yaml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build
```

### Sequential Jobs

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run build

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh
```

### Matrix Builds

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node: [18, 20]
        exclude:
          - os: windows-latest
            node: 18
      fail-fast: false
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node }}
      - run: npm test
```

## Caching

### NPM Cache

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'

# Or manual cache
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

### Build Cache

```yaml
- uses: actions/cache@v4
  with:
    path: |
      .next/cache
      node_modules/.cache
    key: build-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.ts', '**/*.tsx') }}
    restore-keys: |
      build-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}-
      build-${{ runner.os }}-
```

## Artifacts

### Upload Artifacts

```yaml
- name: Build
  run: npm run build

- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/
    retention-days: 7
```

### Download Artifacts

```yaml
- uses: actions/download-artifact@v4
  with:
    name: build-output
    path: dist/
```

## Secrets and Environments

### Using Secrets

```yaml
steps:
  - name: Deploy
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: ./deploy.sh

  - name: AWS Deploy
    uses: aws-actions/configure-aws-credentials@v4
    with:
      aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
      aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
      aws-region: us-east-1
```

### Environments

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://app.example.com
    steps:
      - name: Deploy
        env:
          DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        run: ./deploy.sh
```

## Reusable Workflows

### Creating Reusable Workflow

```yaml
# .github/workflows/reusable-deploy.yml
name: Reusable Deploy

on:
  workflow_call:
    inputs:
      environment:
        required: true
        type: string
    secrets:
      deploy-key:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        env:
          DEPLOY_KEY: ${{ secrets.deploy-key }}
        run: ./deploy.sh ${{ inputs.environment }}
```

### Using Reusable Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: staging
    secrets:
      deploy-key: ${{ secrets.STAGING_DEPLOY_KEY }}

  deploy-production:
    needs: deploy-staging
    uses: ./.github/workflows/reusable-deploy.yml
    with:
      environment: production
    secrets:
      deploy-key: ${{ secrets.PRODUCTION_DEPLOY_KEY }}
```

## Composite Actions

```yaml
# .github/actions/setup-node/action.yml
name: Setup Node.js
description: Setup Node.js with caching

inputs:
  node-version:
    description: Node.js version
    required: false
    default: '20'

runs:
  using: composite
  steps:
    - uses: actions/setup-node@v4
      with:
        node-version: ${{ inputs.node-version }}
        cache: 'npm'

    - name: Install dependencies
      shell: bash
      run: npm ci

# Usage
- uses: ./.github/actions/setup-node
  with:
    node-version: '20'
```

## Common Patterns

### Release Workflow

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build
        run: npm run build

      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            dist/*.js
            dist/*.map
          generate_release_notes: true
```

### PR Checks

```yaml
name: PR Checks

on:
  pull_request:

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm run build

  size-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: preactjs/compressed-size-action@v2
```

## Integration

Used by:
- `cicd-engineer` agent
- `deployment-specialist` agent
