---
name: accessibility-patterns
description: Patterns for building accessible web applications following WCAG guidelines
user-invocable: false
---

# Accessibility Patterns Skill

Patterns for building accessible web applications that work for all users.

## Core Principles (POUR)

- **Perceivable**: Content can be perceived by all senses
- **Operable**: Interface can be operated by all users
- **Understandable**: Content and operation are clear
- **Robust**: Works with current and future technologies

## Semantic HTML

### Use Appropriate Elements

```html
<!-- Bad: Div soup -->
<div class="header">
  <div class="nav">
    <div class="link">Home</div>
  </div>
</div>

<!-- Good: Semantic elements -->
<header>
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
  </nav>
</header>
```

### Heading Hierarchy

```html
<!-- Maintain proper heading order -->
<h1>Page Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
  <h2>Another Section</h2>
    <h3>Subsection</h3>

<!-- Never skip levels -->
<!-- Bad: h1 → h3 -->
<!-- Good: h1 → h2 → h3 -->
```

### Landmarks

```html
<header role="banner">
  <nav role="navigation" aria-label="Main">...</nav>
</header>

<main role="main">
  <article>...</article>
  <aside role="complementary">...</aside>
</main>

<footer role="contentinfo">...</footer>
```

## Keyboard Navigation

### Focus Management

```typescript
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocus.current = document.activeElement as HTMLElement;
      // Focus modal
      modalRef.current?.focus();
    } else {
      // Restore focus on close
      previousFocus.current?.focus();
    }
  }, [isOpen]);

  // Trap focus inside modal
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Tab') {
      // Focus trap logic
    }
  };

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      {children}
    </div>
  );
}
```

### Skip Links

```typescript
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:absolute focus:top-4 focus:left-4
        focus:z-50 focus:p-4
        focus:bg-white focus:text-black
      "
    >
      Skip to main content
    </a>
  );
}
```

### Focus Visible

```css
/* Custom focus styles */
:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}

/* Remove default only if custom is applied */
:focus:not(:focus-visible) {
  outline: none;
}
```

## ARIA Patterns

### Buttons

```typescript
// Interactive element that looks like text
<button
  type="button"
  aria-pressed={isActive}  // Toggle button
  aria-expanded={isOpen}   // Disclosure button
  aria-haspopup="menu"     // Menu button
  aria-label="Close"       // Icon-only button
>
  <CloseIcon aria-hidden="true" />
</button>
```

### Form Controls

```typescript
function TextField({ label, error, hint, ...props }) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div>
      <label htmlFor={id}>{label}</label>

      {hint && (
        <span id={hintId} className="text-sm text-gray-500">
          {hint}
        </span>
      )}

      <input
        id={id}
        aria-describedby={`${hint ? hintId : ''} ${error ? errorId : ''}`}
        aria-invalid={!!error}
        {...props}
      />

      {error && (
        <span id={errorId} role="alert" className="text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
```

### Live Regions

```typescript
// Announce dynamic content changes
function Notification({ message }) {
  return (
    <div
      role="status"
      aria-live="polite"  // Waits for pause
      aria-atomic="true"  // Announces entire region
    >
      {message}
    </div>
  );
}

// For urgent messages
function Alert({ message }) {
  return (
    <div
      role="alert"
      aria-live="assertive"  // Interrupts immediately
    >
      {message}
    </div>
  );
}
```

### Tabs

```typescript
function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div>
      <div role="tablist" aria-label="Content tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleArrowKeys(e, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabs.map(tab => (
        <div
          key={tab.id}
          role="tabpanel"
          id={`panel-${tab.id}`}
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeTab !== tab.id}
          tabIndex={0}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
```

## Color & Contrast

### Minimum Contrast Ratios

- **Normal text**: 4.5:1
- **Large text (18px+ or 14px+ bold)**: 3:1
- **UI components and graphics**: 3:1

### Don't Rely on Color Alone

```typescript
// Bad: Color only indicates error
<input className={error ? 'border-red-500' : 'border-gray-300'} />

// Good: Color + icon + text
<div>
  <input
    className={error ? 'border-red-500' : 'border-gray-300'}
    aria-invalid={!!error}
    aria-describedby={error ? 'error-message' : undefined}
  />
  {error && (
    <span id="error-message" className="text-red-600 flex items-center gap-1">
      <ErrorIcon aria-hidden="true" />
      {error}
    </span>
  )}
</div>
```

## Images & Media

### Alt Text

```html
<!-- Informative images -->
<img src="chart.png" alt="Sales increased 25% in Q4 2024" />

<!-- Decorative images -->
<img src="decoration.png" alt="" aria-hidden="true" />

<!-- Complex images -->
<figure>
  <img src="diagram.png" alt="System architecture diagram" />
  <figcaption>
    Detailed description of the architecture...
  </figcaption>
</figure>
```

### Video Captions

```html
<video controls>
  <source src="video.mp4" type="video/mp4" />
  <track
    kind="captions"
    src="captions.vtt"
    srclang="en"
    label="English"
    default
  />
  <track
    kind="descriptions"
    src="descriptions.vtt"
    srclang="en"
    label="Audio descriptions"
  />
</video>
```

## Testing Accessibility

### Automated Tools

```bash
# Install axe-core for React
npm install @axe-core/react

# Add to development
import React from 'react';
import ReactDOM from 'react-dom';
if (process.env.NODE_ENV !== 'production') {
  import('@axe-core/react').then(axe => {
    axe.default(React, ReactDOM, 1000);
  });
}
```

### Manual Testing Checklist

- [ ] Navigate with keyboard only (Tab, Enter, Escape, Arrow keys)
- [ ] Test with screen reader (VoiceOver, NVDA)
- [ ] Check color contrast (WebAIM Contrast Checker)
- [ ] Zoom to 200% - content still usable
- [ ] Disable images - content still understandable
- [ ] Disable CSS - content still readable

## Common Mistakes

1. **Missing alt text** on images
2. **Non-focusable interactive elements** (div with onClick)
3. **Missing form labels**
4. **Low color contrast**
5. **Missing skip links**
6. **Keyboard traps** in modals
7. **Auto-playing media** without controls
8. **Time limits** without extensions

## Integration

Used by:
- `frontend-developer` agent
- All frontend stack skills
