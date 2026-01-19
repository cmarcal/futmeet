---
name: accessibility-wcag
description: Implement WCAG 2.1 Level AA accessibility standards. This skill guides implementing accessible components, keyboard navigation, screen reader support, and color contrast.
---

# Accessibility (WCAG 2.1 Level AA)

When building components in this project, ensure WCAG 2.1 Level AA compliance. This ensures the app is accessible to all users, including those using assistive technologies.

## When to Use This Skill

- Creating interactive components
- Implementing keyboard navigation
- Adding ARIA attributes
- Ensuring color contrast
- Testing with screen readers

## Key Principles

1. **WCAG 2.1 Level AA** is the target standard
2. **Keyboard Navigation**: All interactive elements keyboard accessible
3. **Screen Reader Support**: Proper ARIA labels and semantic HTML
4. **Color Contrast**: 4.5:1 for normal text, 3:1 for large text
5. **Focus Management**: Visible focus indicators and logical tab order

## Core Requirements

### 1. Keyboard Navigation

All interactive elements must be keyboard accessible.

#### Implementation

```typescript
// Proper keyboard handling
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
};

<button
  onClick={handleClick}
  onKeyDown={handleKeyDown}
  aria-label="Add player"
>
  Add Player
</button>
```

#### Requirements

- Tab order follows visual flow
- All buttons, links, inputs accessible via keyboard
- Skip to content link for navigation
- Focus indicators clearly visible
- No keyboard traps

### 2. Screen Reader Support

Content must be readable by screen readers.

#### Semantic HTML

```typescript
// ✅ Good: Semantic HTML + ARIA
<button aria-label="Delete player">
  <Trash2 aria-hidden="true" />
</button>

// ❌ Bad: Non-semantic
<div onClick={handleDelete}>
  <Trash2 />
</div>
```

#### ARIA Labels for Icon-Only Buttons

```typescript
// Icon-only button requires aria-label
<button aria-label="Delete player" onClick={handleDelete}>
  <Trash2 size={16} aria-hidden="true" />
</button>
```

#### ARIA Live Regions for Dynamic Content

```typescript
// Announce dynamic content changes
<div role="status" aria-live="polite" aria-atomic="true">
  {playerCount} players added
</div>
```

#### Proper Heading Hierarchy

```html
<h1>FutMeet</h1>
  <h2>Players</h2>
    <h3>Player List</h3>
```

### 3. Color Contrast

Text must meet contrast requirements.

#### WCAG AA Requirements

- **Normal text**: 4.5:1 contrast ratio
- **Large text** (18pt+ or 14pt+ bold): 3:1 contrast ratio

#### Tools

- Browser DevTools
- axe DevTools extension
- WebAIM Contrast Checker

#### Example

```css
/* ✅ Good contrast */
.button {
  background-color: #2E7D32; /* Primary green */
  color: #FFFFFF; /* White - 4.5:1+ ratio */
}

/* ❌ Bad contrast */
.button {
  background-color: #E0E0E0; /* Light gray */
  color: #F5F5F5; /* Very light gray - low contrast */
}
```

### 4. Focus Management

Focus must be visible and logical.

#### Visible Focus Indicators

```css
/* Visible focus indicator */
.button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

/* Remove default focus, add custom */
*:focus:not(:focus-visible) {
  outline: none;
}
```

#### Focus Trapping in Modals

```typescript
// Use focus trap library or custom implementation
// Example: react-focus-lock or similar
```

#### Skip to Content Link

```typescript
// Skip to main content link
<a href="#main-content" className={styles.skipLink}>
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>
```

### 5. Semantic HTML

Use correct HTML elements.

#### Use Semantic Elements

- `<button>` for actions
- `<nav>` for navigation
- `<main>` for main content
- `<article>` for content sections
- `<form>` for forms
- Proper heading hierarchy (h1 → h2 → h3)

#### Example

```html
<!-- ✅ Good: Semantic structure -->
<main>
  <h1>FutMeet</h1>
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/game">Game</a>
  </nav>
  <section>
    <h2>Players</h2>
    {/* Player list */}
  </section>
</main>

<!-- ❌ Bad: Non-semantic -->
<div>
  <div>FutMeet</div>
  <div>
    <div>Home</div>
  </div>
</div>
```

## Implementation Checklist

### Phase 1: Foundation

- [ ] Use semantic HTML throughout
- [ ] Add ARIA labels to icon-only buttons
- [ ] Ensure keyboard navigation works
- [ ] Verify color contrast (use tools)
- [ ] Add visible focus indicators

### Phase 2: Enhancement

- [ ] Add skip to content link
- [ ] Implement focus trapping in modals
- [ ] Add ARIA live regions for dynamic content
- [ ] Test with screen readers

### Phase 3: Advanced

- [ ] Full WCAG AA audit
- [ ] Keyboard shortcuts for common actions
- [ ] Reduced motion support
- [ ] High contrast mode support (future)

## Testing Accessibility

### Automated Testing

```typescript
// Install: npm install -D @axe-core/react vitest-axe
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'vitest-axe';
import { Button } from '../Button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing

1. **Keyboard Only**: Use Tab, Enter, Space, Arrow keys
2. **Screen Reader**: NVDA (Windows), VoiceOver (Mac), JAWS
3. **Color Contrast**: Use browser DevTools or axe DevTools
4. **Zoom**: Test at 200% zoom

## Common Patterns

### Accessible Form Fields

```typescript
<label htmlFor="player-name">Player Name</label>
<input
  id="player-name"
  aria-invalid={!!errors.name}
  aria-describedby={errors.name ? "name-error" : undefined}
/>
{errors.name && (
  <span id="name-error" role="alert">
    {errors.name.message}
  </span>
)}
```

### Accessible Icon Buttons

```typescript
<button
  aria-label="Delete player"
  onClick={handleDelete}
  type="button"
>
  <Trash2 size={16} aria-hidden="true" />
</button>
```

## Related Files

- `adr/frontend/01-frontend-architecture/accessibility-strategy.md` - Full accessibility documentation
- `adr/frontend/01-frontend-architecture/final-decisions.md` - Accessibility decision

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)

## Checklist

- [ ] Use semantic HTML throughout
- [ ] Add ARIA labels to icon-only buttons
- [ ] Ensure keyboard navigation works
- [ ] Verify color contrast meets WCAG AA
- [ ] Add visible focus indicators
- [ ] Test with screen readers
- [ ] Run accessibility audits
