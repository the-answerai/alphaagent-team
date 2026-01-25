---
name: tailwind-patterns
description: Tailwind CSS utility patterns and best practices
user-invocable: false
---

# Tailwind Patterns Skill

Patterns for using Tailwind CSS effectively.

## Layout Patterns

### Flexbox

```html
<!-- Center content -->
<div class="flex items-center justify-center h-screen">
  <div>Centered content</div>
</div>

<!-- Space between items -->
<div class="flex justify-between items-center">
  <div>Left</div>
  <div>Right</div>
</div>

<!-- Flex direction and wrap -->
<div class="flex flex-col md:flex-row flex-wrap gap-4">
  <div class="flex-1">Item 1</div>
  <div class="flex-1">Item 2</div>
  <div class="flex-1">Item 3</div>
</div>

<!-- Flex grow/shrink -->
<div class="flex">
  <div class="flex-shrink-0 w-16">Fixed</div>
  <div class="flex-grow">Grows</div>
</div>
```

### Grid

```html
<!-- Basic grid -->
<div class="grid grid-cols-3 gap-4">
  <div>1</div>
  <div>2</div>
  <div>3</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
  <div>Card 4</div>
</div>

<!-- Grid spanning -->
<div class="grid grid-cols-4 gap-4">
  <div class="col-span-2">Wide</div>
  <div>Normal</div>
  <div>Normal</div>
</div>

<!-- Auto-fit grid -->
<div class="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <div>Auto-sized card</div>
</div>
```

### Container

```html
<!-- Centered container -->
<div class="container mx-auto px-4">
  Content with max-width and horizontal padding
</div>

<!-- Custom max-width -->
<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  Content with specific max-width
</div>
```

## Typography

### Text Styles

```html
<!-- Headings -->
<h1 class="text-4xl font-bold text-gray-900">Heading 1</h1>
<h2 class="text-3xl font-semibold text-gray-800">Heading 2</h2>
<h3 class="text-2xl font-medium text-gray-700">Heading 3</h3>

<!-- Body text -->
<p class="text-base text-gray-600 leading-relaxed">
  Body text with comfortable line height
</p>

<!-- Small text -->
<span class="text-sm text-gray-500">Caption text</span>

<!-- Text decoration -->
<p class="underline decoration-blue-500 decoration-2">Underlined</p>
<p class="line-through text-gray-400">Strikethrough</p>

<!-- Text overflow -->
<p class="truncate">Long text that gets truncated...</p>
<p class="line-clamp-3">Text clamped to 3 lines...</p>
```

### Font Weights and Sizes

```html
<p class="font-thin">100</p>
<p class="font-light">300</p>
<p class="font-normal">400</p>
<p class="font-medium">500</p>
<p class="font-semibold">600</p>
<p class="font-bold">700</p>
<p class="font-extrabold">800</p>
```

## Spacing

### Padding and Margin

```html
<!-- All sides -->
<div class="p-4 m-4">...</div>

<!-- Horizontal/Vertical -->
<div class="px-4 py-2">...</div>
<div class="mx-auto my-8">...</div>

<!-- Individual sides -->
<div class="pt-4 pr-2 pb-4 pl-2">...</div>
<div class="mt-4 mr-2 mb-4 ml-2">...</div>

<!-- Negative margin -->
<div class="-mt-4 -mx-2">...</div>

<!-- Space between children -->
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

## Colors

### Background and Text

```html
<!-- Solid colors -->
<div class="bg-blue-500 text-white">...</div>
<div class="bg-gray-100 text-gray-900">...</div>

<!-- With opacity -->
<div class="bg-blue-500/50">50% opacity background</div>
<div class="text-gray-900/75">75% opacity text</div>

<!-- Gradients -->
<div class="bg-gradient-to-r from-blue-500 to-purple-500">
  Gradient background
</div>

<div class="bg-gradient-to-b from-gray-900 via-gray-700 to-gray-900">
  Three-stop gradient
</div>
```

### Borders

```html
<!-- Border color and width -->
<div class="border border-gray-300">...</div>
<div class="border-2 border-blue-500">...</div>

<!-- Individual borders -->
<div class="border-b border-gray-200">Bottom border only</div>
<div class="border-l-4 border-blue-500">Left accent</div>

<!-- Border radius -->
<div class="rounded">Small radius</div>
<div class="rounded-lg">Large radius</div>
<div class="rounded-full">Full (pill/circle)</div>
<div class="rounded-t-lg rounded-b-none">Top only</div>
```

## Responsive Design

### Breakpoints

```html
<!-- Mobile-first responsive -->
<div class="text-sm md:text-base lg:text-lg">
  Responsive text size
</div>

<div class="hidden md:block">
  Hidden on mobile, visible on tablet+
</div>

<div class="block md:hidden">
  Visible on mobile only
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  ...
</div>

<!-- Responsive padding -->
<div class="p-4 md:p-6 lg:p-8">
  ...
</div>
```

### Breakpoint Reference

```
sm:  640px   @media (min-width: 640px)
md:  768px   @media (min-width: 768px)
lg:  1024px  @media (min-width: 1024px)
xl:  1280px  @media (min-width: 1280px)
2xl: 1536px  @media (min-width: 1536px)
```

## States

### Hover, Focus, Active

```html
<!-- Hover -->
<button class="bg-blue-500 hover:bg-blue-600">
  Hover me
</button>

<!-- Focus -->
<input class="border focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />

<!-- Active -->
<button class="bg-blue-500 active:bg-blue-700">
  Click me
</button>

<!-- Group hover -->
<div class="group">
  <div class="group-hover:text-blue-500">
    Changes when parent is hovered
  </div>
</div>

<!-- Peer states -->
<input class="peer" type="checkbox" />
<label class="peer-checked:text-blue-500">
  Checked label
</label>
```

### Disabled and Dark Mode

```html
<!-- Disabled state -->
<button class="bg-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed">
  Submit
</button>

<!-- Dark mode -->
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Dark mode aware
</div>
```

## Animation

### Transitions

```html
<!-- Basic transition -->
<button class="transition-colors duration-200 hover:bg-blue-600">
  Smooth color change
</button>

<!-- Transform transition -->
<div class="transition-transform duration-300 hover:scale-105">
  Grows on hover
</div>

<!-- All properties -->
<div class="transition-all duration-300 ease-in-out">
  ...
</div>
```

### Built-in Animations

```html
<div class="animate-spin">Spinning</div>
<div class="animate-ping">Pinging</div>
<div class="animate-pulse">Pulsing</div>
<div class="animate-bounce">Bouncing</div>
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
