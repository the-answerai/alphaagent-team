---
name: express-routing
description: Express.js routing patterns and organization
user-invocable: false
---

# Express Routing Skill

Patterns for organizing routes in Express.js applications.

## Basic Routing

### Route Methods

```typescript
import express from 'express'

const app = express()

// HTTP methods
app.get('/users', (req, res) => { ... })
app.post('/users', (req, res) => { ... })
app.put('/users/:id', (req, res) => { ... })
app.patch('/users/:id', (req, res) => { ... })
app.delete('/users/:id', (req, res) => { ... })

// All methods
app.all('/secret', (req, res) => { ... })
```

### Route Parameters

```typescript
// Simple parameter
app.get('/users/:id', (req, res) => {
  const { id } = req.params
  res.json({ userId: id })
})

// Multiple parameters
app.get('/users/:userId/posts/:postId', (req, res) => {
  const { userId, postId } = req.params
  res.json({ userId, postId })
})

// Optional parameter
app.get('/users/:id?', (req, res) => {
  if (req.params.id) {
    // Specific user
  } else {
    // All users
  }
})

// Regex constraint
app.get('/users/:id(\\d+)', (req, res) => {
  // Only matches numeric IDs
})
```

### Query Parameters

```typescript
app.get('/search', (req, res) => {
  const { q, page = '1', limit = '10' } = req.query

  const pageNum = parseInt(page as string)
  const limitNum = parseInt(limit as string)

  res.json({ query: q, page: pageNum, limit: limitNum })
})
```

## Router Organization

### Modular Routers

```typescript
// routes/users.ts
import { Router } from 'express'

const router = Router()

router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.post('/', createUser)
router.put('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router

// routes/index.ts
import { Router } from 'express'
import usersRouter from './users'
import postsRouter from './posts'
import authRouter from './auth'

const router = Router()

router.use('/users', usersRouter)
router.use('/posts', postsRouter)
router.use('/auth', authRouter)

export default router

// app.ts
import routes from './routes'

app.use('/api/v1', routes)
```

### Route Grouping

```typescript
// routes/admin/index.ts
import { Router } from 'express'
import { requireAdmin } from '../../middleware/auth'

const router = Router()

// All admin routes require admin role
router.use(requireAdmin)

router.use('/users', adminUsersRouter)
router.use('/settings', adminSettingsRouter)
router.use('/logs', adminLogsRouter)

export default router
```

### Versioned API

```typescript
// routes/v1/index.ts
const v1Router = Router()
v1Router.use('/users', v1UsersRouter)
v1Router.use('/posts', v1PostsRouter)

// routes/v2/index.ts
const v2Router = Router()
v2Router.use('/users', v2UsersRouter)  // New user endpoints
v2Router.use('/posts', v2PostsRouter)

// app.ts
app.use('/api/v1', v1Router)
app.use('/api/v2', v2Router)
```

## RESTful Patterns

### Resource Routes

```typescript
// routes/posts.ts
import { Router } from 'express'
import * as controller from '../controllers/posts'
import { authenticate } from '../middleware/auth'
import { validatePost } from '../middleware/validation'

const router = Router()

// GET /posts - List all posts
router.get('/', controller.index)

// GET /posts/:id - Get single post
router.get('/:id', controller.show)

// POST /posts - Create post
router.post('/', authenticate, validatePost, controller.create)

// PUT /posts/:id - Update post
router.put('/:id', authenticate, validatePost, controller.update)

// DELETE /posts/:id - Delete post
router.delete('/:id', authenticate, controller.destroy)

export default router
```

### Nested Resources

```typescript
// routes/posts.ts
const router = Router()

// Posts
router.get('/', getAllPosts)
router.get('/:postId', getPost)

// Nested comments
router.get('/:postId/comments', getPostComments)
router.post('/:postId/comments', createComment)
router.delete('/:postId/comments/:commentId', deleteComment)

// Alternative: Separate router
const commentsRouter = Router({ mergeParams: true })
commentsRouter.get('/', getPostComments)
commentsRouter.post('/', createComment)
commentsRouter.delete('/:commentId', deleteComment)

router.use('/:postId/comments', commentsRouter)
```

## Controller Pattern

### Basic Controller

```typescript
// controllers/users.ts
import { Request, Response, NextFunction } from 'express'
import * as userService from '../services/users'

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await userService.findAll()
    res.json({ data: users })
  } catch (error) {
    next(error)
  }
}

export async function show(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ data: user })
  } catch (error) {
    next(error)
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.create(req.body)
    res.status(201).json({ data: user })
  } catch (error) {
    next(error)
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.update(req.params.id, req.body)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ data: user })
  } catch (error) {
    next(error)
  }
}

export async function destroy(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.remove(req.params.id)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
```

### Class-Based Controller

```typescript
// controllers/UserController.ts
import { Request, Response, NextFunction } from 'express'
import { UserService } from '../services/UserService'

export class UserController {
  constructor(private userService: UserService) {}

  index = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.findAll()
      res.json({ data: users })
    } catch (error) {
      next(error)
    }
  }

  show = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.findById(req.params.id)
      res.json({ data: user })
    } catch (error) {
      next(error)
    }
  }

  // ... other methods
}

// routes/users.ts
const userService = new UserService()
const controller = new UserController(userService)

router.get('/', controller.index)
router.get('/:id', controller.show)
```

## Route Chaining

```typescript
router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)

router.route('/posts')
  .get(listPosts)
  .post(authenticate, validatePost, createPost)
```

## Middleware per Route

```typescript
// Multiple middleware for single route
router.post('/upload',
  authenticate,
  upload.single('file'),
  validateFile,
  handleUpload
)

// Array of middleware
const createUserMiddleware = [
  authenticate,
  validateBody(createUserSchema),
  checkPermissions('users:create'),
]

router.post('/users', createUserMiddleware, createUser)
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
