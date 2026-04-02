---
name: accessibility-wcag
description: Use when building interactive components, adding ARIA attributes, implementing keyboard navigation, handling focus management, or ensuring color contrast meets WCAG 2.1 Level AA.
---

# Accessibility (WCAG 2.1 Level AA)

Target: WCAG 2.1 Level AA. Every interactive element must be keyboard accessible with proper ARIA semantics and sufficient color contrast.

## Keyboard Navigation

```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
};

<button onClick={handleClick} onKeyDown={handleKeyDown} aria-label="Add player">
  Add Player
</button>
```

Requirements: tab order follows visual flow; all buttons/links/inputs keyboard accessible; no keyboard traps; focus indicators clearly visible.

## Screen Reader Support

```typescript
// Icon-only button — always requires aria-label
<button aria-label="Delete player" onClick={handleDelete}>
  <Trash2 size={16} aria-hidden="true" />
</button>

// Icon with text — hide icon from screen readers
<button>
  <Plus size={16} aria-hidden="true" />
  <span>Add Player</span>
</button>

// Dynamic content announcements
<div role="status" aria-live="polite" aria-atomic="true">
  {playerCount} players added
</div>
```

## Color Contrast (WCAG AA)

- Normal text: 4.5:1 minimum
- Large text (18pt+ or 14pt+ bold): 3:1 minimum

```css
/* Good */
.button { background-color: #2E7D32; color: #FFFFFF; } /* 4.5:1+ */

/* Bad */
.button { background-color: #E0E0E0; color: #F5F5F5; } /* too low */
```

Tools: browser DevTools, axe DevTools extension, WebAIM Contrast Checker.

## Focus Management

```css
.button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}
```

```typescript
// Skip to content link
<a href="#main-content" className={styles.skipLink}>
  Skip to main content
</a>
<main id="main-content">{/* content */}</main>
```

## Semantic HTML

Use `<button>` for actions, `<nav>` for navigation, `<main>` for main content, `<form>` for forms. Maintain heading hierarchy h1 → h2 → h3.

```html
<!-- Good -->
<main>
  <h1>FutMeet</h1>
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/game">Game</a>
  </nav>
  <section>
    <h2>Players</h2>
  </section>
</main>
```

## Accessible Form Fields

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

## Automated Accessibility Testing

```typescript
// npm install -D @axe-core/react vitest-axe
import { axe, toHaveNoViolations } from 'vitest-axe';
expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  expect(await axe(container)).toHaveNoViolations();
});
```

## Manual Testing Checklist

- Keyboard only (Tab, Enter, Space, Arrow keys)
- Screen reader: NVDA (Windows), VoiceOver (Mac)
- Color contrast via DevTools or axe
- 200% zoom test
