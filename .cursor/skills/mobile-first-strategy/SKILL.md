---
name: mobile-first-strategy
description: Implement mobile-first design and development approach. This skill guides responsive design, touch targets, and progressive enhancement for larger screens.
---

# Mobile-First Strategy

When designing and developing components in this project, use a mobile-first approach. Start with mobile styles as the base, then progressively enhance for larger screens.

## When to Use This Skill

- Writing CSS styles
- Designing component layouts
- Setting up responsive breakpoints
- Ensuring touch-friendly interactions
- Optimizing for mobile performance

## Key Principles

1. **Mobile-First**: Base styles target mobile (no media query)
2. **Progressive Enhancement**: Enhance for larger screens with `min-width` media queries
3. **Touch Targets**: Minimum 44px touch targets
4. **Performance**: Lighter initial CSS for mobile
5. **Content-First**: Prioritize content over decoration

## Why Mobile-First?

### Use Case Context

- **Users at the field**: Most players use mobile devices during games
- **On-the-go usage**: Quick access needed
- **Portrait orientation**: Phones in pockets, quick to pull out

### Benefits

- **Performance**: Lighter initial CSS, faster page loads
- **User Experience**: Better touch targets, optimized for small screens
- **Development**: Forces focus on essential features
- **Statistics**: 60-70% of web traffic is mobile

## Implementation Pattern

### CSS Approach

#### Mobile-First Breakpoints

```css
/* Base: Mobile (default, no media query) */
.button {
  padding: 12px 16px;
  font-size: 14px;
  width: 100%;
}

/* Tablet: 768px and up */
@media (min-width: 768px) {
  .button {
    padding: 14px 20px;
    font-size: 16px;
    width: auto;
  }
}

/* Desktop: 1024px and up */
@media (min-width: 1024px) {
  .button {
    padding: 16px 24px;
    font-size: 18px;
  }
}
```

#### CSS Variables for Responsive Values

```css
/* styles/variables.css */
:root {
  /* Mobile first (default) */
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

### Touch Targets

#### Minimum Touch Target Sizes

```css
/* Mobile-first: Large touch targets */
.button,
.input,
.link,
.icon-button {
  min-height: 44px;  /* iOS minimum */
  min-width: 44px;
  padding: 12px 16px; /* Generous padding */
}
```

#### Spacing Between Touch Targets

```css
/* Adequate spacing between interactive elements */
.button + .button {
  margin-left: 16px; /* Prevent accidental taps */
}
```

### Viewport Configuration

#### HTML Meta Tag

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0">
```

#### Responsive Images

```typescript
<img
  src="image-mobile.jpg"
  srcSet="image-mobile.jpg 320w, image-tablet.jpg 768w, image-desktop.jpg 1024w"
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  alt="Football field"
/>
```

## Breakpoint Strategy

### Standard Breakpoints

```css
/* Mobile: 0-767px (default, no media query) */
.container {
  padding: 16px;
  width: 100%;
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .container {
    padding: 24px;
    max-width: 768px;
    margin: 0 auto;
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
  }
}
```

## Component Design Principles

### 1. Progressive Enhancement

Start with mobile functionality, enhance for larger screens:

```typescript
// Mobile: Stack vertically (default)
// Desktop: Grid layout (enhanced via CSS)
<div className={styles.playerList}>
  {players.map(player => <PlayerCard key={player.id} player={player} />)}
</div>
```

```css
/* Mobile: Stack */
.playerList {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Desktop: Grid */
@media (min-width: 1024px) {
  .playerList {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}
```

### 2. Content-First

Prioritize content over decoration:

- Essential information first
- Progressive disclosure for secondary info
- Collapsible sections on mobile

### 3. Thumb-Friendly Navigation

Design for one-handed use:

- Primary actions at bottom
- Navigation at top
- Easy reach zones (bottom 1/3 of screen)

## Common Patterns

### Responsive Typography

```css
/* Mobile first */
.text {
  font-size: 14px;
  line-height: 1.5;
}

@media (min-width: 768px) {
  .text {
    font-size: 16px;
  }
}

@media (min-width: 1024px) {
  .text {
    font-size: 18px;
  }
}
```

### Responsive Spacing

```css
/* Mobile: Tight spacing */
.section {
  padding: 16px;
  margin-bottom: 16px;
}

/* Desktop: More breathing room */
@media (min-width: 1024px) {
  .section {
    padding: 32px;
    margin-bottom: 32px;
  }
}
```

## Best Practices

1. **Start Mobile**: Write mobile styles first (no media query)
2. **Enhance Upward**: Use `min-width` media queries only
3. **Touch-Friendly**: 44px minimum touch targets
4. **Performance**: Keep mobile CSS lightweight
5. **Test on Devices**: Test on actual mobile devices, not just browser resize

## Related Files

- `adr/frontend/01-frontend-architecture/mobile-first-strategy.md` - Full mobile-first documentation
- `adr/frontend/01-frontend-architecture/final-decisions.md` - Mobile-first decision

## Checklist

- [ ] Write mobile styles first (no media query)
- [ ] Use `min-width` media queries for enhancements
- [ ] Ensure 44px minimum touch targets
- [ ] Test on actual mobile devices
- [ ] Optimize for mobile performance
