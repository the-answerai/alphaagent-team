---
name: docker-patterns
description: Docker containerization patterns
user-invocable: false
---

# Docker Patterns Skill

Patterns for building and running Docker containers.

## Multi-Stage Builds

### Node.js Application

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Next.js Application

```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

## Optimization Patterns

### Layer Caching

```dockerfile
# Bad: Copies everything, invalidates cache on any change
COPY . .
RUN npm install && npm run build

# Good: Separate dependency and code layers
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```

### Reduce Image Size

```dockerfile
# Use Alpine base images
FROM node:20-alpine

# Clean up in same layer
RUN apk add --no-cache \
      git \
      curl \
    && npm install -g pnpm \
    && rm -rf /var/cache/apk/*

# Use multi-stage to exclude build tools
FROM node:20-alpine AS builder
RUN npm install -g typescript
COPY . .
RUN tsc

FROM node:20-alpine
COPY --from=builder /app/dist ./dist
```

### .dockerignore

```
# .dockerignore
node_modules
.git
.gitignore
*.md
.env*
.vscode
coverage
.nyc_output
dist
.next
Dockerfile*
docker-compose*
```

## Security Patterns

### Non-Root User

```dockerfile
# Create user in base image
RUN addgroup -g 1001 -S app && \
    adduser -S -u 1001 -G app app

# Set ownership
COPY --chown=app:app . .

# Switch to non-root
USER app
```

### Read-Only Filesystem

```dockerfile
# In Dockerfile
USER app

# In docker-compose.yml
services:
  app:
    read_only: true
    tmpfs:
      - /tmp
      - /var/run
```

### Scan for Vulnerabilities

```yaml
# GitHub Actions
- name: Scan image
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:latest
    format: 'table'
    exit-code: '1'
    severity: 'CRITICAL,HIGH'
```

## Health Checks

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Alternative with curl
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```

## Environment Configuration

### Build Arguments

```dockerfile
ARG NODE_ENV=production
ARG BUILD_DATE
ARG VERSION

ENV NODE_ENV=${NODE_ENV}

LABEL org.opencontainers.image.created=${BUILD_DATE}
LABEL org.opencontainers.image.version=${VERSION}
```

### Runtime Environment

```dockerfile
# Default values
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Values from docker run -e
# docker run -e DATABASE_URL=postgres://...
```

## Docker Compose Patterns

### Development

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      target: deps
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    command: npm run dev
```

### Production

```yaml
version: '3.8'

services:
  app:
    image: myapp:${VERSION:-latest}
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Service Dependencies

```yaml
services:
  app:
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started

  db:
    image: postgres:15
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
```

## Networking

```yaml
services:
  frontend:
    networks:
      - frontend

  backend:
    networks:
      - frontend
      - backend

  database:
    networks:
      - backend

networks:
  frontend:
  backend:
    internal: true  # No external access
```

## Integration

Used by:
- `infrastructure-engineer` agent
- `cicd-engineer` agent
