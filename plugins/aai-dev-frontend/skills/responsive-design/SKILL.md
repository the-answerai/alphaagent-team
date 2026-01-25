---
name: responsive-design
description: Patterns for building responsive, mobile-first user interfaces
user-invocable: false
---

# Responsive Design Skill

Patterns for building responsive user interfaces that work across all device sizes.

## Mobile-First Approach

Design for mobile first, then enhance for larger screens.

```css
/* Mobile first (default) */
.container {
  padding: 1rem;
  display: flex;
  flex-direction: column;
}

/* Tablet and up */
@media (min-width: 768px) {
  .container {
    padding: 2rem;
    flex-direction: row;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

## Breakpoint System

### Standard Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Small phones
  md: '768px',   // Tablets
  lg: '1024px',  // Small laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px' // Large screens
};
```

### Tailwind CSS Usage

```html
<!-- Mobile: stack, Tablet: 2 columns, Desktop: 3 columns -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card />
  <Card />
  <Card />
</div>

<!-- Hide on mobile, show on tablet+ -->
<nav class="hidden md:block">
  <DesktopNavigation />
</nav>

<!-- Show on mobile, hide on tablet+ -->
<button class="md:hidden">
  <MenuIcon />
</button>
```

## Responsive Patterns

### Responsive Grid

```typescript
// CSS Grid with auto-fit
function ResponsiveGrid({ children, minWidth = '300px' }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minWidth}, 1fr))`,
        gap: '1rem',
      }}
    >
      {children}
    </div>
  );
}
```

### Responsive Typography

```css
/* Fluid typography */
.heading {
  font-size: clamp(1.5rem, 4vw, 3rem);
  line-height: 1.2;
}

/* Responsive scale */
:root {
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
}

@media (min-width: 768px) {
  :root {
    --text-base: 1.125rem;
    --text-lg: 1.25rem;
    --text-xl: 1.5rem;
  }
}
```

### Responsive Navigation

```typescript
function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav>
      {/* Mobile menu button */}
      <button
        className="md:hidden"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Toggle menu"
      >
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {/* Navigation links */}
      <div className={`
        ${isOpen ? 'block' : 'hidden'}
        md:block
        absolute md:relative
        top-full left-0 right-0
        bg-white md:bg-transparent
      `}>
        <NavLinks />
      </div>
    </nav>
  );
}
```

### Responsive Images

```typescript
function ResponsiveImage({ src, alt, sizes }) {
  return (
    <picture>
      {/* WebP for modern browsers */}
      <source
        type="image/webp"
        srcSet={`
          ${src}?w=400&format=webp 400w,
          ${src}?w=800&format=webp 800w,
          ${src}?w=1200&format=webp 1200w
        `}
        sizes={sizes}
      />
      {/* Fallback */}
      <img
        src={`${src}?w=800`}
        srcSet={`
          ${src}?w=400 400w,
          ${src}?w=800 800w,
          ${src}?w=1200 1200w
        `}
        sizes={sizes}
        alt={alt}
        loading="lazy"
      />
    </picture>
  );
}

// Usage
<ResponsiveImage
  src="/hero.jpg"
  alt="Hero image"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

## Layout Patterns

### Sidebar Layout

```typescript
function SidebarLayout({ sidebar, content }) {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar: Full width on mobile, fixed width on desktop */}
      <aside className="w-full md:w-64 lg:w-80 shrink-0">
        {sidebar}
      </aside>

      {/* Content: Takes remaining space */}
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        {content}
      </main>
    </div>
  );
}
```

### Card Grid

```typescript
function CardGrid({ items }) {
  return (
    <div className="
      grid gap-4
      grid-cols-1
      sm:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
    ">
      {items.map(item => (
        <Card key={item.id} {...item} />
      ))}
    </div>
  );
}
```

### Hero Section

```typescript
function Hero() {
  return (
    <section className="
      min-h-[50vh] md:min-h-[70vh]
      flex items-center justify-center
      px-4 md:px-8 lg:px-16
      text-center
    ">
      <div className="max-w-3xl">
        <h1 className="
          text-3xl md:text-5xl lg:text-6xl
          font-bold
          mb-4 md:mb-6
        ">
          Welcome
        </h1>
        <p className="
          text-lg md:text-xl
          text-gray-600
          mb-6 md:mb-8
        ">
          Description text
        </p>
        <div className="
          flex flex-col sm:flex-row
          gap-4
          justify-center
        ">
          <Button size="lg">Primary</Button>
          <Button size="lg" variant="outline">Secondary</Button>
        </div>
      </div>
    </section>
  );
}
```

## Responsive Hooks

### useMediaQuery

```typescript
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Usage
function Component() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return isMobile ? <MobileView /> : <DesktopView />;
}
```

### useBreakpoint

```typescript
function useBreakpoint() {
  const isSm = useMediaQuery('(min-width: 640px)');
  const isMd = useMediaQuery('(min-width: 768px)');
  const isLg = useMediaQuery('(min-width: 1024px)');
  const isXl = useMediaQuery('(min-width: 1280px)');

  if (isXl) return 'xl';
  if (isLg) return 'lg';
  if (isMd) return 'md';
  if (isSm) return 'sm';
  return 'xs';
}
```

## Touch Considerations

```css
/* Larger touch targets on mobile */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 0.75rem 1rem;
}

/* Disable hover effects on touch */
@media (hover: none) {
  .button:hover {
    background-color: inherit;
  }
}

/* Smooth scrolling */
.scroll-container {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
```

## Testing Responsive Designs

1. **Browser DevTools**: Test all breakpoints
2. **Real Devices**: Test on actual phones/tablets
3. **Viewport Units**: Test with different font sizes
4. **Orientation**: Test landscape and portrait

## Integration

Used by:
- `frontend-developer` agent
- All frontend stack skills
