---
description: Help containerize an application with Docker best practices and multi-stage builds
argument-hint: [application or service]
---

# /docker-help - Docker Containerization Help

Get help containerizing your application with Docker best practices.

## Usage

```
/docker-help
/docker-help node application
/docker-help optimize existing Dockerfile
```

## Workflow

1. **Analyze Application**
   - Detect application type and stack
   - Identify dependencies
   - Understand build process

2. **Create/Optimize Dockerfile**
   - Multi-stage builds for smaller images
   - Layer caching optimization
   - Security best practices (non-root user)
   - Health checks

3. **Docker Compose Setup**
   - Development configuration
   - Production configuration
   - Service dependencies

4. **Optimization**
   - .dockerignore configuration
   - Image size reduction
   - Build time optimization

5. **Documentation**
   - Usage instructions
   - Environment variables
   - Volume mounts

## Output

- Optimized Dockerfile
- docker-compose.yml (dev and prod)
- .dockerignore
- Build and run instructions
