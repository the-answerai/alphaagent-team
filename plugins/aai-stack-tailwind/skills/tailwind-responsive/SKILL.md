---
name: tailwind-responsive
description: Tailwind responsive design patterns
user-invocable: false
---

# Tailwind Responsive Skill

Patterns for responsive design with Tailwind CSS.

## Mobile-First Approach

### Breakpoint System

```html
<!-- Base styles apply to all sizes -->
<!-- Prefixed styles apply at that breakpoint and up -->

<div class="
  w-full      /* All sizes: full width */
  sm:w-1/2    /* 640px+: half width */
  md:w-1/3    /* 768px+: third width */
  lg:w-1/4    /* 1024px+: quarter width */
  xl:w-1/5    /* 1280px+: fifth width */
  2xl:w-1/6   /* 1536px+: sixth width */
">
  Responsive width
</div>
```

### Breakpoint Reference

```
sm:  640px   /* Small tablets, large phones */
md:  768px   /* Tablets */
lg:  1024px  /* Small laptops */
xl:  1280px  /* Desktops */
2xl: 1536px  /* Large desktops */
```

## Responsive Layouts

### Stacking to Row

```html
<!-- Stack on mobile, row on larger screens -->
<div class="flex flex-col md:flex-row gap-4">
  <div class="flex-1">Item 1</div>
  <div class="flex-1">Item 2</div>
  <div class="flex-1">Item 3</div>
</div>
```

### Responsive Grid

```html
<!-- 1 column mobile, 2 tablet, 3 desktop, 4 large -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
  <div>Card 4</div>
</div>
```

### Sidebar Layout

```html
<!-- Sidebar hidden on mobile, visible on desktop -->
<div class="flex">
  <aside class="hidden lg:block w-64 bg-gray-100">
    Sidebar
  </aside>
  <main class="flex-1 p-4">
    Main content
  </main>
</div>

<!-- Mobile: full width sidebar as overlay -->
<div class="relative">
  <aside class="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl
                transform -translate-x-full lg:translate-x-0 lg:static
                transition-transform duration-300">
    Sidebar
  </aside>
  <main class="lg:ml-64">
    Main content
  </main>
</div>
```

## Responsive Typography

### Text Sizes

```html
<h1 class="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
  Responsive Heading
</h1>

<p class="text-sm sm:text-base lg:text-lg">
  Responsive body text
</p>
```

### Line Clamp

```html
<!-- More lines on larger screens -->
<p class="line-clamp-2 sm:line-clamp-3 lg:line-clamp-none">
  Long text that gets truncated differently at each breakpoint...
</p>
```

### Text Alignment

```html
<h1 class="text-center md:text-left">
  Centered on mobile, left on desktop
</h1>
```

## Responsive Spacing

### Padding and Margin

```html
<!-- Increase spacing on larger screens -->
<div class="p-4 sm:p-6 lg:p-8 xl:p-12">
  Responsive padding
</div>

<div class="my-4 md:my-8 lg:my-12">
  Responsive vertical margin
</div>

<!-- Responsive gap -->
<div class="flex flex-col gap-2 sm:gap-4 lg:gap-6">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Container Widths

```html
<!-- Custom max-widths at breakpoints -->
<div class="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-4xl xl:max-w-6xl mx-auto">
  Content
</div>
```

## Show/Hide Elements

### Visibility Toggles

```html
<!-- Hidden on mobile, visible on desktop -->
<div class="hidden md:block">Desktop only</div>

<!-- Visible on mobile, hidden on desktop -->
<div class="md:hidden">Mobile only</div>

<!-- Show at specific range only -->
<div class="hidden sm:block lg:hidden">Tablet only</div>
```

### Mobile Menu Toggle

```html
<!-- Desktop navigation -->
<nav class="hidden md:flex gap-6">
  <a href="#">Home</a>
  <a href="#">About</a>
  <a href="#">Contact</a>
</nav>

<!-- Mobile menu button -->
<button class="md:hidden">
  <svg class="w-6 h-6">...</svg>
</button>
```

## Responsive Images

### Image Sizing

```html
<!-- Full width on mobile, constrained on desktop -->
<img src="hero.jpg"
     class="w-full md:w-1/2 lg:w-1/3 h-auto object-cover" />

<!-- Different aspect ratios -->
<div class="aspect-video md:aspect-square lg:aspect-[4/3]">
  <img src="image.jpg" class="w-full h-full object-cover" />
</div>
```

### Image Grid

```html
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
  <img src="1.jpg" class="aspect-square object-cover" />
  <img src="2.jpg" class="aspect-square object-cover" />
  <img src="3.jpg" class="aspect-square object-cover" />
  <img src="4.jpg" class="aspect-square object-cover" />
</div>
```

## Responsive Components

### Card Grid

```html
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <div class="bg-white rounded-lg shadow p-4 md:p-6">
    <h3 class="text-lg md:text-xl font-semibold">Card Title</h3>
    <p class="text-sm md:text-base text-gray-600 mt-2">Description</p>
  </div>
</div>
```

### Responsive Table

```html
<!-- Cards on mobile, table on desktop -->
<div class="md:hidden space-y-4">
  <!-- Mobile card view -->
  <div class="bg-white rounded-lg shadow p-4">
    <div class="font-semibold">Name: John Doe</div>
    <div class="text-gray-600">Email: john@example.com</div>
  </div>
</div>

<table class="hidden md:table w-full">
  <thead>
    <tr>
      <th class="text-left p-3">Name</th>
      <th class="text-left p-3">Email</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="p-3">John Doe</td>
      <td class="p-3">john@example.com</td>
    </tr>
  </tbody>
</table>
```

### Responsive Navigation

```html
<nav class="bg-white shadow">
  <div class="max-w-7xl mx-auto px-4">
    <div class="flex justify-between items-center h-16">
      <a href="/" class="text-xl font-bold">Logo</a>

      <!-- Desktop nav -->
      <div class="hidden md:flex items-center gap-6">
        <a href="#" class="text-gray-600 hover:text-gray-900">Home</a>
        <a href="#" class="text-gray-600 hover:text-gray-900">About</a>
        <button class="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Sign Up
        </button>
      </div>

      <!-- Mobile menu button -->
      <button class="md:hidden p-2">
        <svg class="w-6 h-6">...</svg>
      </button>
    </div>
  </div>

  <!-- Mobile nav (toggle visibility with JS) -->
  <div class="md:hidden border-t px-4 py-4 space-y-4">
    <a href="#" class="block text-gray-600">Home</a>
    <a href="#" class="block text-gray-600">About</a>
    <button class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg">
      Sign Up
    </button>
  </div>
</nav>
```

## Custom Breakpoints

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
  },
}
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
