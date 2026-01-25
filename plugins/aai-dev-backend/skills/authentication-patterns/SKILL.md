---
name: authentication-patterns
description: Patterns for implementing authentication and authorization in backend applications
user-invocable: false
---

# Authentication Patterns Skill

Patterns for implementing secure authentication and authorization.

## Authentication Methods

### JWT (JSON Web Tokens)

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

// Generate tokens
function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

// Verify token
function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

// Refresh token endpoint
app.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  try {
    const payload = verifyToken(refreshToken);

    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Check if refresh token is still valid in database
    const storedToken = await getStoredRefreshToken(refreshToken);
    if (!storedToken || storedToken.revoked) {
      throw new Error('Token revoked');
    }

    // Generate new tokens
    const tokens = generateTokens(payload.userId);

    // Revoke old refresh token
    await revokeRefreshToken(refreshToken);

    // Store new refresh token
    await storeRefreshToken(tokens.refreshToken, payload.userId);

    res.json(tokens);
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

### API Keys

```typescript
// Generate API key
function generateApiKey(): string {
  return `sk_${crypto.randomBytes(32).toString('hex')}`;
}

// Hash API key for storage
function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

// Validate API key
async function validateApiKey(key: string) {
  const hash = hashApiKey(key);
  const apiKey = await prisma.apiKey.findUnique({
    where: { hash },
    include: { user: true },
  });

  if (!apiKey || apiKey.revoked || apiKey.expiresAt < new Date()) {
    return null;
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return apiKey;
}

// API key middleware
async function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const key = req.headers['x-api-key'] as string;

  if (!key) {
    return res.status(401).json({ error: 'API key required' });
  }

  const apiKey = await validateApiKey(key);

  if (!apiKey) {
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.user = apiKey.user;
  req.apiKey = apiKey;
  next();
}
```

### OAuth2

```typescript
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: profile.id,
          email: profile.emails?.[0].value,
          name: profile.displayName,
        },
      });
    }

    done(null, user);
  } catch (error) {
    done(error);
  }
}));

// Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const tokens = generateTokens(req.user.id);
    res.redirect(`/auth/callback?token=${tokens.accessToken}`);
  }
);
```

## Authorization Patterns

### Role-Based Access Control (RBAC)

```typescript
// Define roles and permissions
const PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'manage-users'],
  editor: ['read', 'write'],
  viewer: ['read'],
} as const;

type Role = keyof typeof PERMISSIONS;
type Permission = (typeof PERMISSIONS)[Role][number];

// Check permission middleware
function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role;

    if (!userRole || !PERMISSIONS[userRole]?.includes(permission)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

// Usage
app.delete('/users/:id',
  authenticate,
  requirePermission('delete'),
  userController.delete
);
```

### Attribute-Based Access Control (ABAC)

```typescript
// Policy definition
interface Policy {
  action: string;
  resource: string;
  condition: (user: User, resource: any) => boolean;
}

const policies: Policy[] = [
  {
    action: 'update',
    resource: 'post',
    condition: (user, post) => post.authorId === user.id || user.role === 'admin',
  },
  {
    action: 'delete',
    resource: 'post',
    condition: (user, post) => post.authorId === user.id || user.role === 'admin',
  },
];

// Check policy
function can(user: User, action: string, resource: string, resourceData?: any): boolean {
  const policy = policies.find(p => p.action === action && p.resource === resource);

  if (!policy) {
    return false;
  }

  return policy.condition(user, resourceData);
}

// Middleware
function authorize(action: string, resource: string, getResource: (req: Request) => Promise<any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const resourceData = await getResource(req);

    if (!can(req.user, action, resource, resourceData)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    req.resource = resourceData;
    next();
  };
}

// Usage
app.put('/posts/:id',
  authenticate,
  authorize('update', 'post', (req) => prisma.post.findUnique({ where: { id: req.params.id } })),
  postController.update
);
```

### Resource Ownership

```typescript
// Check ownership middleware
async function checkOwnership(req: Request, res: Response, next: NextFunction) {
  const resource = await prisma.post.findUnique({
    where: { id: req.params.id },
  });

  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }

  // Allow if owner or admin
  if (resource.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  req.resource = resource;
  next();
}
```

## Security Best Practices

### Password Hashing

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Secure Headers

```typescript
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  },
}));
```

### CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key'],
}));
```

### Rate Limiting by User

```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: { error: 'Too many login attempts' },
  keyGenerator: (req) => req.body.email || req.ip,
});

app.post('/auth/login', authLimiter, authController.login);
```

## Session Management

```typescript
// Secure session configuration
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict',
  },
}));
```

## Integration

Used by:
- `backend-developer` agent
- All backend stack skills
