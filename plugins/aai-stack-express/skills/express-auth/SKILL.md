---
name: express-auth
description: Authentication patterns for Express.js
user-invocable: false
---

# Express Auth Skill

Authentication implementation patterns for Express.js applications.

## JWT Authentication

### Token Generation

```typescript
import jwt from 'jsonwebtoken'

interface TokenPayload {
  userId: string
  email: string
  role: string
}

const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'

function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  })
}

function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  })
}

function generateTokenPair(user: User) {
  const payload = { userId: user.id, email: user.email, role: user.role }
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  }
}
```

### Token Verification

```typescript
function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload
}

function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload
}
```

### Auth Middleware

```typescript
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing authorization header' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' })
    }
    return res.status(401).json({ error: 'Invalid token' })
  }
}
```

## Login Flow

### Login Endpoint

```typescript
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await userService.findByEmail(email)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate tokens
    const tokens = generateTokenPair(user)

    // Store refresh token
    await tokenService.storeRefreshToken(user.id, tokens.refreshToken)

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

    res.json({
      accessToken: tokens.accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    next(error)
  }
})
```

### Refresh Token Endpoint

```typescript
router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' })
    }

    // Verify refresh token
    let payload: TokenPayload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    // Check if token is in storage (not revoked)
    const storedToken = await tokenService.getRefreshToken(payload.userId)
    if (storedToken !== refreshToken) {
      return res.status(401).json({ error: 'Token revoked' })
    }

    // Get fresh user data
    const user = await userService.findById(payload.userId)
    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Generate new tokens
    const tokens = generateTokenPair(user)

    // Rotate refresh token
    await tokenService.storeRefreshToken(user.id, tokens.refreshToken)

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({ accessToken: tokens.accessToken })
  } catch (error) {
    next(error)
  }
})
```

### Logout Endpoint

```typescript
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    // Remove refresh token from storage
    await tokenService.removeRefreshToken(req.user!.userId)

    // Clear cookie
    res.clearCookie('refreshToken')

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
})
```

## Password Handling

### Password Hashing

```typescript
import bcrypt from 'bcrypt'

const SALT_ROUNDS = 12

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
```

### Password Reset Flow

```typescript
import crypto from 'crypto'

// Request password reset
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body

    const user = await userService.findByEmail(email)
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If the email exists, a reset link was sent' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex')

    // Store with expiry
    await userService.setPasswordResetToken(user.id, hashedToken, Date.now() + 3600000)

    // Send email
    await emailService.sendPasswordReset(email, resetToken)

    res.json({ message: 'If the email exists, a reset link was sent' })
  } catch (error) {
    next(error)
  }
})

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body

    // Hash the token for comparison
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    // Find user with valid token
    const user = await userService.findByResetToken(hashedToken)
    if (!user || user.resetTokenExpiry < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired token' })
    }

    // Update password
    const passwordHash = await hashPassword(password)
    await userService.updatePassword(user.id, passwordHash)

    // Clear reset token
    await userService.clearResetToken(user.id)

    // Revoke all refresh tokens
    await tokenService.removeAllRefreshTokens(user.id)

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    next(error)
  }
})
```

## OAuth Integration

### Passport Setup

```typescript
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await userService.findByGoogleId(profile.id)

    if (!user) {
      user = await userService.create({
        email: profile.emails![0].value,
        name: profile.displayName,
        googleId: profile.id,
        avatar: profile.photos?.[0]?.value,
      })
    }

    done(null, user)
  } catch (error) {
    done(error as Error)
  }
}))
```

### OAuth Routes

```typescript
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
)

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    const user = req.user as User
    const tokens = generateTokenPair(user)

    await tokenService.storeRefreshToken(user.id, tokens.refreshToken)

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    })

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${tokens.accessToken}`)
  }
)
```

## Session Authentication

### Session Setup

```typescript
import session from 'express-session'
import RedisStore from 'connect-redis'
import { createClient } from 'redis'

const redisClient = createClient({ url: process.env.REDIS_URL })
redisClient.connect()

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
}))
```

### Session Auth Middleware

```typescript
function requireSession(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  next()
}

// Login with session
router.post('/login', async (req, res) => {
  const user = await authenticate(req.body.email, req.body.password)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  req.session.userId = user.id
  req.session.role = user.role

  res.json({ user })
})

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' })
    }
    res.clearCookie('connect.sid')
    res.json({ message: 'Logged out' })
  })
})
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
