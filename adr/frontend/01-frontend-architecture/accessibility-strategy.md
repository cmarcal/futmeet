# Accessibility Strategy

## Overview
Comprehensive accessibility strategy targeting WCAG 2.1 Level AA compliance for the FutMeet MVP.

---

## Decision: WCAG 2.1 Level AA Compliance

### What is WCAG?
Web Content Accessibility Guidelines - international standards for web accessibility.

**Levels:**
- **Level A**: Minimum (basic accessibility)
- **Level AA**: Target (standard compliance) ✅
- **Level AAA**: Enhanced (highest level)

---

## Core Principles

### 1. **Keyboard Navigation**
All interactive elements must be keyboard accessible.

**Implementation:**
- Tab order follows visual flow
- All buttons, links, inputs accessible via keyboard
- Skip to content link for navigation
- Focus indicators clearly visible
- No keyboard traps

**Example:**
```typescript
// Proper keyboard handling
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
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

---

### 2. **Screen Reader Support**
Content must be readable by screen readers.

**Implementation:**
- Semantic HTML (use `<button>`, not `<div>`)
- ARIA labels for icon-only buttons
- ARIA live regions for dynamic content
- Proper heading hierarchy (h1 → h2 → h3)

**Example:**
```typescript
// Good: Semantic HTML + ARIA
<button aria-label="Delete player">
  <Trash2 aria-hidden="true" />
</button>

// Bad: Non-semantic
<div onClick={handleDelete}>
  <Trash2 />
</div>

// Dynamic content with ARIA live
<div role="status" aria-live="polite">
  {playerCount} players added
</div>
```

---

### 3. **Color Contrast**
Text must meet contrast requirements.

**WCAG AA Requirements:**
- **Normal text**: 4.5:1 contrast ratio
- **Large text**: 3:1 contrast ratio (18pt+ or 14pt+ bold)

**Tools:**
- Browser DevTools
- axe DevTools extension
- WebAIM Contrast Checker

**Example:**
```css
/* Good contrast */
.button {
  background-color: #2E7D32; /* Primary green */
  color: #FFFFFF; /* White - 4.5:1+ ratio */
}

/* Bad contrast */
.button {
  background-color: #E0E0E0; /* Light gray */
  color: #F5F5F5; /* Very light gray - low contrast */
}
```

---

### 4. **Focus Management**
Focus must be visible and logical.

**Implementation:**
- Visible focus indicators (outline)
- Logical tab order
- Focus management in modals (trap focus)
- Return focus after modal closes

**Example:**
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

---

### 5. **Semantic HTML**
Use correct HTML elements for meaning.

**Examples:**
- `<button>` for actions
- `<nav>` for navigation
- `<main>` for main content
- `<article>` for content sections
- `<form>` for forms
- Proper heading hierarchy

**Example:**
```html
<!-- Good: Semantic structure -->
<main>
  <h1>FutMeet</h1>
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/game">Game</a>
  </nav>
  <section>
    <h2>Players</h2>
    <!-- Player list -->
  </section>
</main>

<!-- Bad: Non-semantic -->
<div>
  <div>FutMeet</div>
  <div>
    <div>Home</div>
  </div>
</div>
```

---

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

---

## Testing Accessibility

### Automated Testing
```typescript
// Using @axe-core/react
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Component Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<MyComponent />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### Manual Testing
1. **Keyboard Only**: Use Tab, Enter, Space, Arrow keys
2. **Screen Reader**: NVDA (Windows), VoiceOver (Mac)
3. **Color Contrast**: Use browser DevTools
4. **Zoom**: Test at 200% zoom

### Tools
- **axe DevTools**: Browser extension
- **Lighthouse**: Accessibility audit
- **WAVE**: Web accessibility evaluation
- **NVDA/JAWS**: Screen reader testing

---

## Common Accessibility Patterns

### Accessible Form
```typescript
<FormField
  label="Player Name"
  required
  error={errors.name}
>
  <Input
    {...register('name')}
    aria-required="true"
    aria-invalid={!!errors.name}
    aria-describedby={errors.name ? 'name-error' : undefined}
  />
  {errors.name && (
    <span id="name-error" role="alert">
      {errors.name.message}
    </span>
  )}
</FormField>
```

### Accessible Modal
```typescript
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-modal="true"
>
  <h2 id="modal-title">Confirm Action</h2>
  <button onClick={onClose} aria-label="Close dialog">
    <X />
  </button>
  {/* Modal content */}
</div>
```

### Skip to Content Link
```typescript
// Add at the top of the page
<a href="#main-content" className={styles.skipLink}>
  Skip to main content
</a>

<main id="main-content">
  {/* Main content */}
</main>
```

```css
.skipLink {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  padding: 8px;
  text-decoration: none;
  z-index: 100;
}

.skipLink:focus {
  top: 0;
}
```

---

## Integration with Design Tokens

### Accessible Color Tokens
```css
/* Design tokens ensure contrast */
:root {
  --md-sys-color-primary: #2E7D32; /* WCAG AA compliant */
  --md-sys-color-on-primary: #FFFFFF; /* High contrast */
  --md-sys-color-error: #D32F2F; /* Accessible error color */
  --md-sys-color-on-error: #FFFFFF;
}
```

### Accessible Spacing
```css
/* Touch targets meet 44x44px minimum */
.button {
  min-height: 44px; /* Accessible touch target */
  min-width: 44px;
}
```

### Accessible Typography
```css
/* Ensure readable font sizes */
.body-text {
  font-size: 16px; /* Minimum readable size */
  line-height: 1.5; /* Adequate line spacing */
}
```

---

## WCAG 2.1 Level AA Checklist

### Perceivable
- [ ] All non-text content has alt text or labels
- [ ] Color is not the only means of conveying information
- [ ] Text has sufficient contrast (4.5:1 for normal, 3:1 for large)
- [ ] Text can be resized up to 200% without loss of functionality

### Operable
- [ ] All functionality available via keyboard
- [ ] No keyboard traps
- [ ] Sufficient time limits (if applicable)
- [ ] No content that flashes more than 3 times per second
- [ ] Skip navigation links available
- [ ] Page titles are descriptive

### Understandable
- [ ] Language of page is identified
- [ ] Navigation is consistent
- [ ] Form labels are clear and associated
- [ ] Error messages are descriptive and helpful

### Robust
- [ ] Valid HTML
- [ ] Proper use of ARIA where needed
- [ ] Component names and roles are clear

---

## Decision Summary

✅ **WCAG 2.1 Level AA Compliance**

**Core Principles:**
- Keyboard navigation
- Screen reader support
- Color contrast compliance
- Semantic HTML
- Focus management

**Implementation:**
- Built into component design from start
- Automated and manual testing
- Integration with design tokens

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**Status**: ✅ **Strategy Defined**  
**Next Steps**: Implement in Phase 1 foundation, test throughout development
