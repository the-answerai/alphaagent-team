---
name: system-design-patterns
description: Common system design patterns and architectures
---

# System Design Patterns Skill

Common patterns for designing scalable systems.

## Architectural Patterns

### Layered Architecture

```
┌─────────────────────────────┐
│     Presentation Layer      │  UI, API endpoints
├─────────────────────────────┤
│      Application Layer      │  Business logic, use cases
├─────────────────────────────┤
│        Domain Layer         │  Entities, business rules
├─────────────────────────────┤
│     Infrastructure Layer    │  Database, external services
└─────────────────────────────┘
```

```typescript
// Presentation Layer
@Controller('users')
class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.userService.findById(id)
  }
}

// Application Layer
class UserService {
  constructor(private userRepository: UserRepository) {}

  async findById(id: string): Promise<User> {
    return this.userRepository.findById(id)
  }
}

// Domain Layer
class User {
  constructor(
    public id: string,
    public email: string,
    public name: string
  ) {}

  updateEmail(newEmail: string) {
    // Business validation
    if (!this.isValidEmail(newEmail)) {
      throw new ValidationError('Invalid email')
    }
    this.email = newEmail
  }
}

// Infrastructure Layer
class TypeOrmUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } })
  }
}
```

### Microservices

```
                    ┌─────────────┐
                    │ API Gateway │
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │   User     │  │   Order    │  │  Payment   │
    │  Service   │  │  Service   │  │  Service   │
    └────────────┘  └────────────┘  └────────────┘
           │               │               │
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  User DB   │  │  Order DB  │  │ Payment DB │
    └────────────┘  └────────────┘  └────────────┘
```

### Event-Driven Architecture

```typescript
// Event definition
interface OrderCreatedEvent {
  orderId: string
  userId: string
  items: OrderItem[]
  total: number
  createdAt: Date
}

// Publisher
class OrderService {
  async createOrder(data: CreateOrderDTO): Promise<Order> {
    const order = await this.repository.save(data)

    await this.eventBus.publish('order.created', {
      orderId: order.id,
      userId: order.userId,
      items: order.items,
      total: order.total,
      createdAt: order.createdAt
    })

    return order
  }
}

// Subscribers
class InventoryService {
  @OnEvent('order.created')
  async reserveInventory(event: OrderCreatedEvent) {
    for (const item of event.items) {
      await this.inventory.reserve(item.productId, item.quantity)
    }
  }
}

class NotificationService {
  @OnEvent('order.created')
  async sendConfirmation(event: OrderCreatedEvent) {
    const user = await this.userService.findById(event.userId)
    await this.email.send(user.email, 'Order Confirmation', { order: event })
  }
}
```

## Data Patterns

### CQRS (Command Query Responsibility Segregation)

```typescript
// Commands (Write side)
class CreateUserCommand {
  constructor(public email: string, public name: string) {}
}

class CreateUserHandler {
  async execute(command: CreateUserCommand) {
    const user = new User(uuid(), command.email, command.name)
    await this.writeRepository.save(user)
    await this.eventBus.publish(new UserCreatedEvent(user))
  }
}

// Queries (Read side)
class GetUserQuery {
  constructor(public userId: string) {}
}

class GetUserHandler {
  async execute(query: GetUserQuery) {
    return this.readRepository.findById(query.userId)
  }
}

// Read model updated by events
class UserProjection {
  @OnEvent('user.created')
  async onUserCreated(event: UserCreatedEvent) {
    await this.readModel.insert({
      id: event.userId,
      email: event.email,
      name: event.name,
      createdAt: event.createdAt
    })
  }
}
```

### Event Sourcing

```typescript
// Events are the source of truth
interface Event {
  id: string
  aggregateId: string
  type: string
  data: any
  timestamp: Date
  version: number
}

// Account aggregate
class Account {
  private balance: number = 0
  private events: Event[] = []

  deposit(amount: number) {
    this.apply(new MoneyDepositedEvent(this.id, amount))
  }

  withdraw(amount: number) {
    if (this.balance < amount) {
      throw new InsufficientFundsError()
    }
    this.apply(new MoneyWithdrawnEvent(this.id, amount))
  }

  // Rebuild state from events
  static fromEvents(events: Event[]): Account {
    const account = new Account()
    for (const event of events) {
      account.applyEvent(event)
    }
    return account
  }

  private applyEvent(event: Event) {
    switch (event.type) {
      case 'MoneyDeposited':
        this.balance += event.data.amount
        break
      case 'MoneyWithdrawn':
        this.balance -= event.data.amount
        break
    }
  }
}
```

## Integration Patterns

### API Gateway

```typescript
// Route requests to appropriate services
const routes = {
  '/api/users/*': 'http://user-service:3001',
  '/api/orders/*': 'http://order-service:3002',
  '/api/products/*': 'http://product-service:3003'
}

// Gateway middleware
app.use('/api/*', async (req, res) => {
  const service = matchRoute(req.path, routes)

  // Authentication
  const user = await authenticate(req.headers.authorization)

  // Rate limiting
  await rateLimiter.check(user.id)

  // Proxy request
  const response = await proxy(service, {
    ...req,
    headers: {
      ...req.headers,
      'x-user-id': user.id
    }
  })

  res.status(response.status).json(response.data)
})
```

### Circuit Breaker

```typescript
class CircuitBreaker {
  private failures = 0
  private lastFailure: Date | null = null
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  async call<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (this.shouldReset()) {
        this.state = 'half-open'
      } else {
        throw new CircuitOpenError()
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess() {
    this.failures = 0
    this.state = 'closed'
  }

  private onFailure() {
    this.failures++
    this.lastFailure = new Date()
    if (this.failures >= this.threshold) {
      this.state = 'open'
    }
  }

  private shouldReset(): boolean {
    return Date.now() - this.lastFailure!.getTime() > this.timeout
  }
}
```

### Saga Pattern

```typescript
// Distributed transaction coordination
class OrderSaga {
  async execute(orderData: CreateOrderDTO) {
    const steps = [
      { action: () => this.reserveInventory(orderData), compensate: () => this.releaseInventory(orderData) },
      { action: () => this.processPayment(orderData), compensate: () => this.refundPayment(orderData) },
      { action: () => this.createOrder(orderData), compensate: () => this.cancelOrder(orderData) },
      { action: () => this.sendConfirmation(orderData), compensate: () => {} }
    ]

    const completed: typeof steps = []

    try {
      for (const step of steps) {
        await step.action()
        completed.push(step)
      }
    } catch (error) {
      // Compensate in reverse order
      for (const step of completed.reverse()) {
        await step.compensate()
      }
      throw error
    }
  }
}
```

## Scalability Patterns

### Horizontal Scaling

```yaml
# Kubernetes deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-service
  template:
    spec:
      containers:
        - name: api
          image: api-service:latest
          resources:
            requests:
              cpu: 100m
              memory: 256Mi
            limits:
              cpu: 500m
              memory: 512Mi
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

### Caching

```typescript
class CacheService {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttl) {
      await this.redis.setex(key, ttl, serialized)
    } else {
      await this.redis.set(key, serialized)
    }
  }

  async getOrSet<T>(
    key: string,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached) return cached

    const value = await fn()
    await this.set(key, value, ttl)
    return value
  }
}

// Usage
const user = await cache.getOrSet(
  `user:${id}`,
  () => userRepository.findById(id),
  3600  // 1 hour TTL
)
```

## Integration

Used by:
- `system-architect` agent
- `tech-lead` agent
