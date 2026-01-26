---
name: deployment-strategies
description: Deployment strategies and patterns
---

# Deployment Strategies Skill

Patterns for deploying applications safely.

## Strategy Comparison

| Strategy | Downtime | Risk | Rollback | Complexity |
|----------|----------|------|----------|------------|
| Recreate | Yes | High | Slow | Low |
| Rolling | No | Medium | Medium | Low |
| Blue-Green | No | Low | Instant | Medium |
| Canary | No | Low | Fast | High |
| A/B Testing | No | Low | Fast | High |

## Rolling Deployment

### Kubernetes Configuration

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Extra pods during update
      maxUnavailable: 0  # No downtime
  template:
    spec:
      containers:
        - name: app
          image: app:v2
          readinessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
```

### Rollout Commands

```bash
# Start rollout
kubectl set image deployment/app app=app:v2

# Watch rollout progress
kubectl rollout status deployment/app

# Pause rollout
kubectl rollout pause deployment/app

# Resume rollout
kubectl rollout resume deployment/app

# Rollback
kubectl rollout undo deployment/app
```

## Blue-Green Deployment

### Architecture

```
                    ┌─────────────┐
                    │   Router    │
                    │ (Service)   │
                    └──────┬──────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
    ┌─────────────┐                 ┌─────────────┐
    │    Blue     │                 │   Green     │
    │   (v1.0)    │                 │   (v1.1)    │
    │   Active    │                 │   Standby   │
    └─────────────┘                 └─────────────┘
```

### Implementation

```yaml
# Blue deployment (current)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
        - name: app
          image: app:v1.0

---
# Green deployment (new)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
        - name: app
          image: app:v1.1

---
# Service (switch selector to route traffic)
apiVersion: v1
kind: Service
metadata:
  name: app
spec:
  selector:
    app: myapp
    version: blue  # Change to 'green' to switch
  ports:
    - port: 80
      targetPort: 8080
```

### Switch Script

```bash
#!/bin/bash
set -e

NEW_VERSION=$1
CURRENT=$(kubectl get svc app -o jsonpath='{.spec.selector.version}')

echo "Current version: $CURRENT"
echo "Switching to: $NEW_VERSION"

# Verify new deployment is ready
kubectl rollout status deployment/app-$NEW_VERSION

# Switch traffic
kubectl patch svc app -p "{\"spec\":{\"selector\":{\"version\":\"$NEW_VERSION\"}}}"

# Verify switch
sleep 5
curl -s https://app.example.com/health

echo "Switch complete"
```

## Canary Deployment

### Progressive Rollout

```yaml
# Istio VirtualService for traffic splitting
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: app
spec:
  hosts:
    - app.example.com
  http:
    - route:
        - destination:
            host: app-stable
          weight: 90
        - destination:
            host: app-canary
          weight: 10
```

### Automated Canary

```bash
#!/bin/bash
set -e

CANARY_IMAGE=$1
WEIGHTS=(10 25 50 75 100)

# Deploy canary
kubectl set image deployment/app-canary app=$CANARY_IMAGE
kubectl rollout status deployment/app-canary

for weight in "${WEIGHTS[@]}"; do
  echo "Setting canary weight to $weight%"

  # Update traffic split
  kubectl patch virtualservice app --type=merge -p "
  spec:
    http:
    - route:
      - destination:
          host: app-stable
        weight: $((100 - weight))
      - destination:
          host: app-canary
        weight: $weight
  "

  # Wait and monitor
  sleep 300

  # Check metrics
  ERROR_RATE=$(curl -s "prometheus/api/v1/query?query=http_errors_total{version='canary'}/http_requests_total{version='canary'}" | jq -r '.data.result[0].value[1]')

  if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
    echo "Error rate $ERROR_RATE exceeds threshold, rolling back"
    kubectl patch virtualservice app --type=merge -p "
    spec:
      http:
      - route:
        - destination:
            host: app-stable
          weight: 100
    "
    exit 1
  fi

  echo "Canary at $weight% healthy"
done

# Promote canary to stable
kubectl set image deployment/app-stable app=$CANARY_IMAGE
kubectl rollout status deployment/app-stable

echo "Canary promoted successfully"
```

## Feature Flags

### Integration with Deployment

```typescript
// Feature flag service
import { LaunchDarkly } from 'launchdarkly-node-server-sdk'

const client = LaunchDarkly.init(process.env.LD_SDK_KEY)

// In route handler
app.get('/api/feature', async (req, res) => {
  const useNewFeature = await client.variation(
    'new-feature',
    { key: req.user.id },
    false
  )

  if (useNewFeature) {
    return newFeatureHandler(req, res)
  }
  return legacyHandler(req, res)
})
```

### Deployment with Flags

```yaml
# Deploy code with flag disabled
- name: Deploy
  run: kubectl apply -f deployment.yaml

# Enable flag for internal users
- name: Enable flag for testing
  run: |
    curl -X PATCH "https://app.launchdarkly.com/api/v2/flags/project/new-feature" \
      -H "Authorization: $LD_API_KEY" \
      -d '{"patch":[{"op":"replace","path":"/environments/production/targets/0","value":{"variation":0,"values":["internal-user-1"]}}]}'

# Gradual rollout via flag
- name: Enable for 10% of users
  run: |
    curl -X PATCH "https://app.launchdarkly.com/api/v2/flags/project/new-feature" \
      -H "Authorization: $LD_API_KEY" \
      -d '{"patch":[{"op":"replace","path":"/environments/production/fallthrough","value":{"rollout":{"variations":[{"variation":1,"weight":10000},{"variation":0,"weight":90000}]}}}]}'
```

## Rollback Patterns

### Immediate Rollback

```bash
# Kubernetes
kubectl rollout undo deployment/app

# With specific revision
kubectl rollout undo deployment/app --to-revision=2

# Check history
kubectl rollout history deployment/app
```

### Database-Safe Rollback

```markdown
## Safe Rollback Strategy

1. **Deploy backward-compatible changes**
   - New code handles old AND new schema

2. **Run database migration**
   - Add new columns (nullable or with defaults)
   - Never delete columns in same release

3. **Deploy new code using new schema**
   - Old code still works with new schema

4. **Clean up old columns (separate release)**
   - Only after rollback window passes
```

## Integration

Used by:
- `deployment-specialist` agent
- `cicd-engineer` agent
