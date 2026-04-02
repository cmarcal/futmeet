---
name: mobile-first-strategy
description: Use when writing CSS styles, designing layouts, or setting responsive breakpoints. Enforces mobile-first approach: base styles target mobile, progressive enhancement with min-width media queries only.
---

# Mobile-First Strategy

Write mobile styles as the base (no media query), then enhance upward with `min-width` queries. Never use `max-width` to "undo" styles.

Context: FutMeet users are at football fields on mobile devices. Performance and touch-friendly interactions are critical.

## Breakpoints

| Range | Query |
|-------|-------|
| Mobile (base) | no media query |
| Tablet | `@media (min-width: 768px)` |
| Desktop | `@media (min-width: 1024px)` |

## Base Pattern

```css
/* Mobile: base styles, no media query */
.button {
  padding: 12px 16px;
  font-size: 14px;
  width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .button {
    padding: 14px 20px;
    font-size: 16px;
    width: auto;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .button {
    padding: 16px 24px;
    font-size: 18px;
  }
}
```

## Touch Targets

Minimum 44px on all interactive elements (iOS requirement):

```css
.button,
.input,
.link,
.icon-button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* Spacing between adjacent tap targets */
.button + .button {
  margin-left: 16px;
}
```

## Viewport Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
```

## Responsive Layout Pattern

```css
/* Mobile: single column */
.playerList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Desktop: grid */
@media (min-width: 1024px) {
  .playerList {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}
```

## Container Pattern

```css
.container {
  padding: 16px;
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 768px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
  }
}
```

## Responsive Typography

```css
.text {
  font-size: 14px;
  line-height: 1.5;
}

@media (min-width: 768px) {
  .text { font-size: 16px; }
}

@media (min-width: 1024px) {
  .text { font-size: 18px; }
}
```

## CSS Variables for Responsive Values

```css
:root {
  --spacing-base: 16px;
  --font-size-base: 14px;
  --max-width: 100%;
}

@media (min-width: 768px) {
  :root {
    --spacing-base: 20px;
    --font-size-base: 16px;
    --max-width: 768px;
  }
}

@media (min-width: 1024px) {
  :root {
    --spacing-base: 24px;
    --font-size-base: 18px;
    --max-width: 1200px;
  }
}
```

## Design Principles

- Primary actions at the bottom (thumb zone)
- Navigation at the top
- Essential content first — progressive disclosure for secondary info
- Keep mobile CSS lightweight — decorative enhancements belong in desktop overrides
- Test on actual devices, not just browser resize
