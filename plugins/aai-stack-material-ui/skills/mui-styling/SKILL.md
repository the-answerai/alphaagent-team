---
name: mui-styling
description: Material-UI styling approaches
user-invocable: false
---

# Material-UI Styling Skill

Patterns for styling Material-UI components.

## sx Prop

### Basic Usage

```tsx
import { Box, Button, Typography } from '@mui/material'

// Shorthand properties
<Box
  sx={{
    m: 2,           // margin: theme.spacing(2)
    p: 1,           // padding: theme.spacing(1)
    px: 3,          // paddingX
    py: 2,          // paddingY
    mt: 4,          // marginTop
    bgcolor: 'primary.main',
    color: 'white',
  }}
>
  Content
</Box>

// Sizing
<Box
  sx={{
    width: 1/2,     // 50%
    width: 1,       // 100%
    width: 300,     // 300px
    height: '100vh',
    minWidth: 100,
    maxWidth: 500,
  }}
/>

// Display & Flexbox
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 2,
  }}
/>
```

### Responsive Values

```tsx
<Box
  sx={{
    width: {
      xs: '100%',   // 0-600px
      sm: '50%',    // 600-900px
      md: '33%',    // 900-1200px
      lg: '25%',    // 1200-1536px
      xl: '20%',    // 1536px+
    },
    p: {
      xs: 1,
      sm: 2,
      md: 3,
    },
    display: {
      xs: 'none',
      md: 'block',
    },
  }}
/>
```

### Pseudo Selectors

```tsx
<Box
  sx={{
    '&:hover': {
      bgcolor: 'primary.light',
      cursor: 'pointer',
    },
    '&:active': {
      bgcolor: 'primary.dark',
    },
    '&:focus': {
      outline: '2px solid',
      outlineColor: 'primary.main',
    },
    '&::before': {
      content: '""',
      display: 'block',
    },
  }}
/>
```

### Nested Selectors

```tsx
<Box
  sx={{
    // Direct children
    '& > *': {
      mb: 2,
    },
    // Specific child elements
    '& .title': {
      fontWeight: 'bold',
    },
    // First/last child
    '& > *:first-of-type': {
      mt: 0,
    },
    '& > *:last-child': {
      mb: 0,
    },
  }}
/>
```

### Theme Access in sx

```tsx
<Box
  sx={(theme) => ({
    color: theme.palette.primary.main,
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(3),
    },
    ...(theme.palette.mode === 'dark' && {
      bgcolor: 'grey.900',
    }),
  })}
/>
```

## styled API

### Basic styled Components

```tsx
import { styled } from '@mui/material/styles'

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(1, 3),
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

// Usage
<StyledButton>Click Me</StyledButton>
```

### With Props

```tsx
interface StyledCardProps {
  variant?: 'elevated' | 'outlined'
}

const StyledCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<StyledCardProps>(({ theme, variant }) => ({
  borderRadius: 12,
  ...(variant === 'elevated' && {
    boxShadow: theme.shadows[4],
  }),
  ...(variant === 'outlined' && {
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
  }),
}))

// Usage
<StyledCard variant="elevated">Content</StyledCard>
```

### Extending Components

```tsx
const PrimaryButton = styled(Button)({
  backgroundColor: '#1976d2',
  color: 'white',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
})

const LargePrimaryButton = styled(PrimaryButton)({
  padding: '16px 32px',
  fontSize: '1.2rem',
})
```

### Component Slots

```tsx
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    '& fieldset': {
      borderColor: theme.palette.grey[300],
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.grey[600],
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}))
```

## CSS Utilities

### Using clsx

```tsx
import clsx from 'clsx'

function Component({ active, disabled }) {
  return (
    <Box
      className={clsx(
        'base-class',
        active && 'active-class',
        disabled && 'disabled-class'
      )}
    />
  )
}
```

### Combining sx Arrays

```tsx
const baseStyles = {
  p: 2,
  borderRadius: 1,
}

const activeStyles = {
  bgcolor: 'primary.main',
  color: 'white',
}

<Box
  sx={[
    baseStyles,
    isActive && activeStyles,
    // Conditional styles inline
    (theme) => ({
      '&:hover': {
        bgcolor: isActive
          ? theme.palette.primary.dark
          : theme.palette.grey[100],
      },
    }),
  ]}
/>
```

## CSS Modules Integration

```tsx
// Component.module.css
.card {
  border-radius: 8px;
  padding: 16px;
}

.card.active {
  border-color: var(--mui-palette-primary-main);
}

// Component.tsx
import styles from './Component.module.css'
import clsx from 'clsx'

function Component({ active }) {
  return (
    <Card
      className={clsx(styles.card, active && styles.active)}
      sx={{ boxShadow: 2 }}  // Can combine with sx
    />
  )
}
```

## Global Styles

### CssBaseline Customization

```tsx
const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#6b6b6b #2b2b2b',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#6b6b6b',
          },
        },
      },
    },
  },
})
```

### GlobalStyles Component

```tsx
import { GlobalStyles } from '@mui/material'

<GlobalStyles
  styles={{
    '*': {
      boxSizing: 'border-box',
    },
    'ul, ol': {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    },
    a: {
      textDecoration: 'none',
      color: 'inherit',
    },
  }}
/>
```

## Component Classes

### Accessing MUI Classes

```tsx
import { buttonClasses, inputClasses } from '@mui/material'

const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          [`&.${buttonClasses.disabled}`]: {
            opacity: 0.5,
          },
        },
      },
    },
  },
})

// Or in styled
const CustomInput = styled(TextField)({
  [`& .${inputClasses.input}`]: {
    padding: '12px 16px',
  },
})
```

## Performance Tips

### Avoid Inline Functions

```tsx
// BAD: Creates new object every render
<Box sx={{ color: 'primary.main' }} />

// GOOD: Extract static styles
const styles = { color: 'primary.main' }
<Box sx={styles} />

// GOOD: useMemo for computed styles
const styles = useMemo(() => ({
  color: isActive ? 'primary.main' : 'text.secondary',
}), [isActive])
<Box sx={styles} />
```

### Use styled for Complex Components

```tsx
// For components with many styles, styled is more performant
const StyledCard = styled(Card)(({ theme }) => ({
  // Complex styles here
}))

// Use instead of large sx objects
<StyledCard />
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
