---
name: mobile-first-strategy
description: Use when writing CSS, designing layouts, or setting responsive breakpoints.
---

# Mobile-First Strategy

Mobile styles are the base with no media query; enhance upward with `min-width` queries only. `max-width` queries never undo styles.

FutMeet users stand on football fields with phones: performance and touch-friendly interaction come first.

## Breakpoints

| Range | Query |
|-------|-------|
| Mobile (base) | no media query |
| Tablet | `@media (min-width: 768px)` |
| Desktop | `@media (min-width: 1024px)` |

## Base Pattern

```css
.button {
  padding: 12px 16px;
  font-size: 14px;
  width: 100%;

  @media (min-width: 768px) {
    padding: 14px 20px;
    font-size: 16px;
    width: auto;
  }
}
```

Nest media queries inside the component class (see `component-architecture-css-modules`).

## Touch Targets

Every interactive element is at least 44px by 44px, with 16px between adjacent tap targets:

```css
.button, .input, .link, .icon-button {
  min-height: 44px;
  min-width: 44px;
}
```

## Viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
```

## Design Principles

- Primary actions at the bottom (thumb zone), navigation at the top
- Essential content first; secondary info behind progressive disclosure
- Keep mobile CSS lightweight; decorative enhancements live in desktop overrides
- Test on real devices, not only browser resize

## References

Read `references/examples.md` for responsive layout, container, typography and CSS-variable patterns.
