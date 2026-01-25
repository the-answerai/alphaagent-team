---
name: mui-theming
description: Material-UI theme customization
user-invocable: false
---

# Material-UI Theming Skill

Patterns for customizing Material-UI themes.

## Creating Themes

### Basic Theme

```tsx
import { createTheme, ThemeProvider } from '@mui/material'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <YourApp />
    </ThemeProvider>
  )
}
```

### Custom Palette

```tsx
const theme = createTheme({
  palette: {
    primary: {
      light: '#4dabf5',
      main: '#2196f3',
      dark: '#1769aa',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#ff9800',
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
  },
})
```

### Color from Palette

```tsx
import { blue, purple } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    primary: {
      main: blue[500],
      light: blue[300],
      dark: blue[700],
    },
    secondary: {
      main: purple[500],
    },
  },
})
```

## Typography

### Custom Typography

```tsx
const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,

    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      textTransform: 'none',  // Remove uppercase
      fontWeight: 600,
    },
  },
})
```

### Responsive Typography

```tsx
const theme = createTheme({
  typography: {
    h1: {
      fontSize: '2rem',
      '@media (min-width:600px)': {
        fontSize: '2.5rem',
      },
      '@media (min-width:960px)': {
        fontSize: '3rem',
      },
    },
  },
})

// Or using responsiveFontSizes
import { responsiveFontSizes } from '@mui/material/styles'

let theme = createTheme()
theme = responsiveFontSizes(theme)
```

## Spacing

### Custom Spacing

```tsx
const theme = createTheme({
  spacing: 8,  // Default: 8px base unit
})

// Usage: theme.spacing(2) = 16px

// Custom spacing function
const theme = createTheme({
  spacing: (factor: number) => `${0.25 * factor}rem`,
})

// Usage: theme.spacing(4) = '1rem'
```

## Breakpoints

### Custom Breakpoints

```tsx
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
})

// Usage
<Box
  sx={{
    width: {
      xs: '100%',
      sm: '50%',
      md: '33.33%',
    },
  }}
/>
```

## Component Overrides

### Global Component Styles

```tsx
const theme = createTheme({
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
      defaultProps: {
        disableElevation: true,
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
})
```

### Variant Overrides

```tsx
const theme = createTheme({
  components: {
    MuiButton: {
      variants: [
        {
          props: { variant: 'dashed' },
          style: {
            border: '2px dashed',
          },
        },
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          },
        },
      ],
    },
  },
})

// Usage
<Button variant="dashed">Dashed Button</Button>
```

## Dark Mode

### Dark Theme

```tsx
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
})
```

### Theme Toggle

```tsx
import { useMemo, useState } from 'react'

function App() {
  const [mode, setMode] = useState<'light' | 'dark'>('light')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: { main: '#1976d2' },
                background: { default: '#fff', paper: '#f5f5f5' },
              }
            : {
                primary: { main: '#90caf9' },
                background: { default: '#121212', paper: '#1e1e1e' },
              }),
        },
      }),
    [mode]
  )

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Button onClick={toggleMode}>Toggle Mode</Button>
    </ThemeProvider>
  )
}
```

## Custom Theme Variables

### Extending Theme

```tsx
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string
    }
  }
  interface ThemeOptions {
    status?: {
      danger?: string
    }
  }
}

const theme = createTheme({
  status: {
    danger: '#f44336',
  },
})

// Usage
<Box sx={{ color: (theme) => theme.status.danger }} />
```

### Custom Palette Colors

```tsx
declare module '@mui/material/styles' {
  interface Palette {
    neutral: Palette['primary']
  }
  interface PaletteOptions {
    neutral?: PaletteOptions['primary']
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    neutral: true
  }
}

const theme = createTheme({
  palette: {
    neutral: {
      main: '#64748B',
      contrastText: '#fff',
    },
  },
})

// Usage
<Button color="neutral">Neutral Button</Button>
```

## Theme Access

### useTheme Hook

```tsx
import { useTheme } from '@mui/material/styles'

function Component() {
  const theme = useTheme()

  return (
    <div style={{ color: theme.palette.primary.main }}>
      Primary colored text
    </div>
  )
}
```

### sx Prop Theme Access

```tsx
<Box
  sx={{
    color: 'primary.main',
    bgcolor: 'background.paper',
    p: 2,  // theme.spacing(2)
    borderRadius: 1,  // theme.shape.borderRadius
    boxShadow: 1,  // theme.shadows[1]
  }}
>
  Content
</Box>

// With function for complex logic
<Box
  sx={(theme) => ({
    color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.800',
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(4),
    },
  })}
/>
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
