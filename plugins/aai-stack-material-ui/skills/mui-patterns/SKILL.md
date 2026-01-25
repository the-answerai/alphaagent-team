---
name: mui-patterns
description: Material-UI component patterns and usage
user-invocable: false
---

# Material-UI Patterns Skill

Patterns for using Material-UI (MUI) components effectively.

## Setup

### Installation

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material  # Optional: icons
```

### Basic Configuration

```tsx
// App.tsx
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'

const theme = createTheme()

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your app */}
    </ThemeProvider>
  )
}
```

## Core Components

### Buttons

```tsx
import { Button, IconButton, ButtonGroup } from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'

// Button variants
<Button variant="contained">Primary</Button>
<Button variant="outlined">Secondary</Button>
<Button variant="text">Text</Button>

// Colors
<Button variant="contained" color="primary">Primary</Button>
<Button variant="contained" color="secondary">Secondary</Button>
<Button variant="contained" color="error">Error</Button>
<Button variant="contained" color="success">Success</Button>

// Sizes
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>

// With icons
<Button startIcon={<Add />}>Add Item</Button>
<Button endIcon={<Delete />}>Delete</Button>

// Icon buttons
<IconButton color="primary">
  <Edit />
</IconButton>

// Button group
<ButtonGroup variant="contained">
  <Button>One</Button>
  <Button>Two</Button>
  <Button>Three</Button>
</ButtonGroup>
```

### Typography

```tsx
import { Typography } from '@mui/material'

<Typography variant="h1">Heading 1</Typography>
<Typography variant="h2">Heading 2</Typography>
<Typography variant="h3">Heading 3</Typography>
<Typography variant="h4">Heading 4</Typography>
<Typography variant="h5">Heading 5</Typography>
<Typography variant="h6">Heading 6</Typography>
<Typography variant="subtitle1">Subtitle 1</Typography>
<Typography variant="subtitle2">Subtitle 2</Typography>
<Typography variant="body1">Body 1</Typography>
<Typography variant="body2">Body 2</Typography>
<Typography variant="caption">Caption</Typography>
<Typography variant="overline">Overline</Typography>

// With color
<Typography color="primary">Primary color</Typography>
<Typography color="secondary">Secondary color</Typography>
<Typography color="error">Error color</Typography>
<Typography color="text.secondary">Secondary text</Typography>

// With sx prop
<Typography sx={{ fontWeight: 'bold', mb: 2 }}>Bold with margin</Typography>
```

### Form Components

```tsx
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
  Switch,
} from '@mui/material'

// Text field
<TextField label="Email" variant="outlined" fullWidth />
<TextField label="Password" type="password" variant="outlined" />
<TextField
  label="Message"
  multiline
  rows={4}
  variant="outlined"
/>
<TextField
  error
  label="Error"
  helperText="This field has an error"
/>

// Select
<FormControl fullWidth>
  <InputLabel>Age</InputLabel>
  <Select value={age} label="Age" onChange={handleChange}>
    <MenuItem value={10}>Ten</MenuItem>
    <MenuItem value={20}>Twenty</MenuItem>
    <MenuItem value={30}>Thirty</MenuItem>
  </Select>
</FormControl>

// Checkbox
<FormControlLabel
  control={<Checkbox checked={checked} onChange={handleChange} />}
  label="Accept terms"
/>

// Radio group
<RadioGroup value={value} onChange={handleChange}>
  <FormControlLabel value="a" control={<Radio />} label="Option A" />
  <FormControlLabel value="b" control={<Radio />} label="Option B" />
</RadioGroup>

// Switch
<FormControlLabel
  control={<Switch checked={enabled} onChange={handleChange} />}
  label="Enable feature"
/>
```

### Cards

```tsx
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  CardHeader,
  Avatar,
  IconButton,
} from '@mui/material'
import { MoreVert } from '@mui/icons-material'

<Card>
  <CardHeader
    avatar={<Avatar>R</Avatar>}
    action={
      <IconButton>
        <MoreVert />
      </IconButton>
    }
    title="Card Title"
    subheader="September 14, 2024"
  />
  <CardMedia
    component="img"
    height="194"
    image="/image.jpg"
    alt="Description"
  />
  <CardContent>
    <Typography variant="body2" color="text.secondary">
      Card content goes here.
    </Typography>
  </CardContent>
  <CardActions>
    <Button size="small">Share</Button>
    <Button size="small">Learn More</Button>
  </CardActions>
</Card>
```

### Lists

```tsx
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
} from '@mui/material'
import { Inbox, Drafts, Person } from '@mui/icons-material'

<List>
  <ListItemButton>
    <ListItemIcon>
      <Inbox />
    </ListItemIcon>
    <ListItemText primary="Inbox" />
  </ListItemButton>
  <ListItemButton>
    <ListItemIcon>
      <Drafts />
    </ListItemIcon>
    <ListItemText primary="Drafts" />
  </ListItemButton>
  <Divider />
  <ListItem>
    <ListItemAvatar>
      <Avatar>
        <Person />
      </Avatar>
    </ListItemAvatar>
    <ListItemText primary="John Doe" secondary="john@example.com" />
  </ListItem>
</List>
```

## Layout Components

### Box and Container

```tsx
import { Box, Container, Stack } from '@mui/material'

// Box - basic layout
<Box sx={{ display: 'flex', gap: 2, p: 2 }}>
  <Box sx={{ flex: 1 }}>Item 1</Box>
  <Box sx={{ flex: 1 }}>Item 2</Box>
</Box>

// Container - centered content
<Container maxWidth="lg">
  Content with max-width
</Container>

// Stack - flex shorthand
<Stack direction="row" spacing={2}>
  <Item>Item 1</Item>
  <Item>Item 2</Item>
  <Item>Item 3</Item>
</Stack>

<Stack
  direction={{ xs: 'column', sm: 'row' }}
  spacing={2}
  divider={<Divider orientation="vertical" flexItem />}
>
  <Item>Item 1</Item>
  <Item>Item 2</Item>
</Stack>
```

### Grid

```tsx
import { Grid } from '@mui/material'

<Grid container spacing={2}>
  <Grid item xs={12} md={6} lg={4}>
    Full width mobile, half tablet, third desktop
  </Grid>
  <Grid item xs={12} md={6} lg={4}>
    Item 2
  </Grid>
  <Grid item xs={12} md={12} lg={4}>
    Item 3
  </Grid>
</Grid>

// Nested grid
<Grid container spacing={2}>
  <Grid item xs={12} md={8}>
    <Grid container spacing={1}>
      <Grid item xs={6}>Nested 1</Grid>
      <Grid item xs={6}>Nested 2</Grid>
    </Grid>
  </Grid>
  <Grid item xs={12} md={4}>
    Sidebar
  </Grid>
</Grid>
```

## Feedback Components

### Dialogs

```tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'

<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Confirm Action</DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to proceed?
    </DialogContentText>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm} variant="contained">
      Confirm
    </Button>
  </DialogActions>
</Dialog>
```

### Snackbar

```tsx
import { Snackbar, Alert } from '@mui/material'

<Snackbar
  open={open}
  autoHideDuration={6000}
  onClose={handleClose}
>
  <Alert severity="success" onClose={handleClose}>
    Operation completed successfully!
  </Alert>
</Snackbar>
```

### Progress

```tsx
import {
  CircularProgress,
  LinearProgress,
  Skeleton,
} from '@mui/material'

// Circular
<CircularProgress />
<CircularProgress variant="determinate" value={75} />

// Linear
<LinearProgress />
<LinearProgress variant="determinate" value={50} />

// Skeleton
<Skeleton variant="text" width={210} />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="rectangular" width={210} height={118} />
```

## Navigation

### App Bar

```tsx
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material'
import { Menu } from '@mui/icons-material'

<AppBar position="static">
  <Toolbar>
    <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
      <Menu />
    </IconButton>
    <Typography variant="h6" sx={{ flexGrow: 1 }}>
      App Title
    </Typography>
    <Button color="inherit">Login</Button>
  </Toolbar>
</AppBar>
```

### Tabs

```tsx
import { Tabs, Tab, Box } from '@mui/material'

<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
  <Tabs value={value} onChange={handleChange}>
    <Tab label="Item One" />
    <Tab label="Item Two" />
    <Tab label="Item Three" />
  </Tabs>
</Box>
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
