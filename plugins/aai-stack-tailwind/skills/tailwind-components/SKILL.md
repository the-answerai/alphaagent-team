---
name: tailwind-components
description: Common Tailwind component patterns
user-invocable: false
---

# Tailwind Components Skill

Common component patterns built with Tailwind CSS.

## Buttons

### Button Variants

```html
<!-- Primary button -->
<button class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg
               hover:bg-blue-700 focus:outline-none focus:ring-2
               focus:ring-blue-500 focus:ring-offset-2 transition-colors">
  Primary
</button>

<!-- Secondary button -->
<button class="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg
               hover:bg-gray-300 focus:outline-none focus:ring-2
               focus:ring-gray-500 focus:ring-offset-2 transition-colors">
  Secondary
</button>

<!-- Outline button -->
<button class="px-4 py-2 border-2 border-blue-600 text-blue-600 font-medium
               rounded-lg hover:bg-blue-50 focus:outline-none focus:ring-2
               focus:ring-blue-500 focus:ring-offset-2 transition-colors">
  Outline
</button>

<!-- Ghost button -->
<button class="px-4 py-2 text-blue-600 font-medium rounded-lg
               hover:bg-blue-50 focus:outline-none focus:ring-2
               focus:ring-blue-500 focus:ring-offset-2 transition-colors">
  Ghost
</button>

<!-- Destructive button -->
<button class="px-4 py-2 bg-red-600 text-white font-medium rounded-lg
               hover:bg-red-700 focus:outline-none focus:ring-2
               focus:ring-red-500 focus:ring-offset-2 transition-colors">
  Delete
</button>
```

### Button Sizes

```html
<!-- Small -->
<button class="px-3 py-1.5 text-sm">Small</button>

<!-- Medium (default) -->
<button class="px-4 py-2 text-base">Medium</button>

<!-- Large -->
<button class="px-6 py-3 text-lg">Large</button>
```

### Button with Icon

```html
<button class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600
               text-white rounded-lg hover:bg-blue-700">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 4v16m8-8H4" />
  </svg>
  Add Item
</button>
```

## Cards

### Basic Card

```html
<div class="bg-white rounded-lg shadow-md p-6">
  <h3 class="text-lg font-semibold text-gray-900">Card Title</h3>
  <p class="mt-2 text-gray-600">Card description text goes here.</p>
</div>
```

### Card with Image

```html
<div class="bg-white rounded-lg shadow-md overflow-hidden">
  <img src="image.jpg" alt="" class="w-full h-48 object-cover" />
  <div class="p-6">
    <h3 class="text-lg font-semibold text-gray-900">Card Title</h3>
    <p class="mt-2 text-gray-600">Card description.</p>
    <button class="mt-4 text-blue-600 hover:text-blue-700 font-medium">
      Learn more →
    </button>
  </div>
</div>
```

### Interactive Card

```html
<div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg
            transition-shadow cursor-pointer border border-gray-200
            hover:border-blue-500">
  <h3 class="text-lg font-semibold text-gray-900">Interactive Card</h3>
  <p class="mt-2 text-gray-600">Click me!</p>
</div>
```

## Forms

### Input Field

```html
<div>
  <label class="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input type="email"
         class="w-full px-3 py-2 border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-blue-500
                focus:border-blue-500 placeholder-gray-400"
         placeholder="you@example.com" />
</div>
```

### Input with Error

```html
<div>
  <label class="block text-sm font-medium text-gray-700 mb-1">
    Email
  </label>
  <input type="email"
         class="w-full px-3 py-2 border border-red-500 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-red-500
                focus:border-red-500 bg-red-50"
         value="invalid-email" />
  <p class="mt-1 text-sm text-red-600">Please enter a valid email address.</p>
</div>
```

### Select

```html
<div>
  <label class="block text-sm font-medium text-gray-700 mb-1">
    Country
  </label>
  <select class="w-full px-3 py-2 border border-gray-300 rounded-lg
                 focus:outline-none focus:ring-2 focus:ring-blue-500
                 focus:border-blue-500 bg-white">
    <option>United States</option>
    <option>Canada</option>
    <option>Mexico</option>
  </select>
</div>
```

### Checkbox

```html
<label class="flex items-center gap-2 cursor-pointer">
  <input type="checkbox"
         class="w-4 h-4 text-blue-600 border-gray-300 rounded
                focus:ring-blue-500 focus:ring-2" />
  <span class="text-sm text-gray-700">Accept terms and conditions</span>
</label>
```

### Radio Group

```html
<div class="space-y-2">
  <label class="flex items-center gap-2 cursor-pointer">
    <input type="radio" name="plan" value="free"
           class="w-4 h-4 text-blue-600 border-gray-300
                  focus:ring-blue-500 focus:ring-2" />
    <span class="text-sm text-gray-700">Free</span>
  </label>
  <label class="flex items-center gap-2 cursor-pointer">
    <input type="radio" name="plan" value="pro"
           class="w-4 h-4 text-blue-600 border-gray-300
                  focus:ring-blue-500 focus:ring-2" />
    <span class="text-sm text-gray-700">Pro</span>
  </label>
</div>
```

## Navigation

### Navbar

```html
<nav class="bg-white border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16 items-center">
      <div class="flex items-center gap-8">
        <a href="/" class="text-xl font-bold text-gray-900">Logo</a>
        <div class="hidden md:flex gap-6">
          <a href="#" class="text-gray-600 hover:text-gray-900">Home</a>
          <a href="#" class="text-gray-600 hover:text-gray-900">Products</a>
          <a href="#" class="text-gray-600 hover:text-gray-900">About</a>
        </div>
      </div>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Sign Up
      </button>
    </div>
  </div>
</nav>
```

### Sidebar

```html
<aside class="w-64 bg-gray-900 text-white min-h-screen">
  <div class="p-4">
    <h2 class="text-xl font-bold">Dashboard</h2>
  </div>
  <nav class="mt-4">
    <a href="#" class="flex items-center gap-3 px-4 py-3 bg-gray-800
                       text-white hover:bg-gray-700">
      <svg class="w-5 h-5">...</svg>
      Overview
    </a>
    <a href="#" class="flex items-center gap-3 px-4 py-3
                       text-gray-300 hover:bg-gray-800 hover:text-white">
      <svg class="w-5 h-5">...</svg>
      Analytics
    </a>
  </nav>
</aside>
```

## Modals

### Basic Modal

```html
<!-- Overlay -->
<div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <!-- Modal -->
  <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b">
      <h3 class="text-lg font-semibold text-gray-900">Modal Title</h3>
      <button class="text-gray-400 hover:text-gray-600">
        <svg class="w-6 h-6">...</svg>
      </button>
    </div>
    <!-- Body -->
    <div class="p-4">
      <p class="text-gray-600">Modal content goes here.</p>
    </div>
    <!-- Footer -->
    <div class="flex justify-end gap-3 p-4 border-t">
      <button class="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
        Cancel
      </button>
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg">
        Confirm
      </button>
    </div>
  </div>
</div>
```

## Alerts

### Alert Variants

```html
<!-- Info -->
<div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <div class="flex items-start gap-3">
    <svg class="w-5 h-5 text-blue-500 mt-0.5">...</svg>
    <div>
      <h4 class="font-medium text-blue-800">Information</h4>
      <p class="text-sm text-blue-700 mt-1">This is an info message.</p>
    </div>
  </div>
</div>

<!-- Success -->
<div class="p-4 bg-green-50 border border-green-200 rounded-lg">
  <div class="flex items-start gap-3">
    <svg class="w-5 h-5 text-green-500 mt-0.5">...</svg>
    <div>
      <h4 class="font-medium text-green-800">Success</h4>
      <p class="text-sm text-green-700 mt-1">Operation completed.</p>
    </div>
  </div>
</div>

<!-- Warning -->
<div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
  <div class="flex items-start gap-3">
    <svg class="w-5 h-5 text-yellow-500 mt-0.5">...</svg>
    <div>
      <h4 class="font-medium text-yellow-800">Warning</h4>
      <p class="text-sm text-yellow-700 mt-1">Please review this.</p>
    </div>
  </div>
</div>

<!-- Error -->
<div class="p-4 bg-red-50 border border-red-200 rounded-lg">
  <div class="flex items-start gap-3">
    <svg class="w-5 h-5 text-red-500 mt-0.5">...</svg>
    <div>
      <h4 class="font-medium text-red-800">Error</h4>
      <p class="text-sm text-red-700 mt-1">Something went wrong.</p>
    </div>
  </div>
</div>
```

## Badges

```html
<!-- Solid badges -->
<span class="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
  New
</span>
<span class="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
  Active
</span>
<span class="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
  Urgent
</span>

<!-- Pill badges -->
<span class="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
  Label
</span>
```

## Integration

Used by:
- `frontend-developer` agent
- `fullstack-developer` agent
