---
name: express-validation
description: Input validation patterns for Express.js
user-invocable: false
---

# Express Validation Skill

Patterns for validating request input in Express.js applications.

## Zod Validation

### Basic Schema

```typescript
import { z } from 'zod'

// User schema
const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  age: z.number().int().positive().optional(),
})

const updateUserSchema = createUserSchema.partial()

// Product schema
const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  price: z.number().positive(),
  category: z.enum(['electronics', 'clothing', 'books', 'other']),
  tags: z.array(z.string()).default([]),
})
```

### Validation Middleware Factory

```typescript
import { z, ZodSchema } from 'zod'
import { Request, Response, NextFunction } from 'express'

type RequestLocation = 'body' | 'query' | 'params'

function validate(schema: ZodSchema, location: RequestLocation = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[location])

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.flatten().fieldErrors,
      })
    }

    req[location] = result.data
    next()
  }
}

// Usage
router.post('/users', validate(createUserSchema), createUser)
router.get('/users', validate(paginationSchema, 'query'), listUsers)
router.get('/users/:id', validate(idParamSchema, 'params'), getUser)
```

### Combined Validation

```typescript
interface ValidationSchemas {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}

function validateAll(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: Record<string, unknown> = {}

    for (const [location, schema] of Object.entries(schemas)) {
      if (schema) {
        const result = schema.safeParse(req[location as RequestLocation])
        if (!result.success) {
          errors[location] = result.error.flatten().fieldErrors
        } else {
          req[location as RequestLocation] = result.data
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      })
    }

    next()
  }
}

// Usage
router.get('/posts/:postId/comments',
  validateAll({
    params: z.object({ postId: z.string().uuid() }),
    query: z.object({
      page: z.coerce.number().positive().default(1),
      limit: z.coerce.number().min(1).max(100).default(20),
    }),
  }),
  getComments
)
```

## Common Schemas

### Pagination

```typescript
const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})
```

### ID Parameters

```typescript
const uuidParamSchema = z.object({
  id: z.string().uuid('Invalid ID format'),
})

const slugParamSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Invalid slug format'),
})
```

### Date Ranges

```typescript
const dateRangeSchema = z.object({
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine(
  (data) => data.endDate >= data.startDate,
  { message: 'End date must be after start date' }
)
```

### File Upload

```typescript
const fileUploadSchema = z.object({
  fieldname: z.string(),
  originalname: z.string(),
  mimetype: z.string().regex(/^image\/(jpeg|png|gif|webp)$/),
  size: z.number().max(5 * 1024 * 1024, 'File too large (max 5MB)'),
})

function validateFile(req: Request, res: Response, next: NextFunction) {
  if (!req.file) {
    return res.status(400).json({ error: 'File is required' })
  }

  const result = fileUploadSchema.safeParse(req.file)
  if (!result.success) {
    return res.status(400).json({
      error: 'Invalid file',
      details: result.error.flatten().fieldErrors,
    })
  }

  next()
}
```

## Custom Validators

### Password Strength

```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter')
  .regex(/[a-z]/, 'Password must contain a lowercase letter')
  .regex(/[0-9]/, 'Password must contain a number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain a special character')
```

### Phone Number

```typescript
const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')

// Or with libphonenumber-js
import { parsePhoneNumberFromString } from 'libphonenumber-js'

const phoneNumberSchema = z.string().transform((val, ctx) => {
  const phoneNumber = parsePhoneNumberFromString(val)
  if (!phoneNumber?.isValid()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid phone number',
    })
    return z.NEVER
  }
  return phoneNumber.format('E.164')
})
```

### Unique Field

```typescript
const uniqueEmailSchema = z.string().email().refine(
  async (email) => {
    const exists = await userService.emailExists(email)
    return !exists
  },
  { message: 'Email already in use' }
)

// Usage with async validation
async function validateUniqueEmail(req: Request, res: Response, next: NextFunction) {
  const result = await uniqueEmailSchema.safeParseAsync(req.body.email)
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten().formErrors,
    })
  }
  next()
}
```

## Error Formatting

### Structured Error Response

```typescript
interface ValidationError {
  field: string
  message: string
  code: string
}

function formatZodError(error: z.ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code,
  }))
}

function validateWithFormat(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        errors: formatZodError(result.error),
      })
    }

    req.body = result.data
    next()
  }
}
```

## Sanitization

### Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify'

const sanitizedStringSchema = z.string().transform((val) => {
  return DOMPurify.sanitize(val.trim())
})

const blogPostSchema = z.object({
  title: z.string().min(1).max(200).transform(val => val.trim()),
  content: z.string().transform(val => DOMPurify.sanitize(val)),
  tags: z.array(z.string().toLowerCase().trim()),
})
```

### SQL Injection Prevention

```typescript
// Zod handles most cases by parsing to expected types
// Additional layer with parameterized queries

const searchSchema = z.object({
  query: z.string()
    .max(100)
    .transform(val => val.replace(/[%_]/g, '\\$&')), // Escape SQL wildcards
})
```

## Conditional Validation

```typescript
const paymentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('credit_card'),
    cardNumber: z.string().regex(/^\d{16}$/),
    expiryMonth: z.number().min(1).max(12),
    expiryYear: z.number().min(new Date().getFullYear()),
    cvv: z.string().regex(/^\d{3,4}$/),
  }),
  z.object({
    type: z.literal('bank_transfer'),
    accountNumber: z.string(),
    routingNumber: z.string(),
  }),
  z.object({
    type: z.literal('paypal'),
    email: z.string().email(),
  }),
])
```

## Integration

Used by:
- `backend-developer` agent
- `fullstack-developer` agent
