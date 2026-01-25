---
name: design-tokens-strategy
description: Use simple CSS variables for design tokens. This skill guides implementing and using design tokens with CSS variables and CSS Modules.
---

# Design Tokens Strategy

Design tokens are design decisions stored as CSS variables. They represent the visual design atoms of the application — colors, spacing, typography, borders, etc. — in a centralized, maintainable way. Use CSS variables directly in `src/styles/tokens.css` and reference them in CSS Modules with `var()`.

## CSS Variable Categories

### Colors
```css
--color-primary: #2E7D32;
--color-primary-container: #C8E6C9;
--color-on-primary: #FFFFFF;
--color-background: #FFFFFF;
--color-on-background: #1C1B1F;
--color-surface: #FFFFFF;
--color-on-surface: #1C1B1F;
--color-surface-variant: #F5F5F5;
--color-error: #D32F2F;
--color-success: #388E3C;
--color-priority: #FFC107;
--color-accent: #FF6B35;
```

### Spacing
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
```

### Typography
```css
--font-family-brand: 'Poppins', sans-serif;
--font-family-body: 'Inter', sans-serif;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-size-headline: 32px;
--font-size-title: 16px;
--font-size-body: 16px;
--line-height-headline: 40px;
--line-height-title: 24px;
--line-height-body: 24px;
```

### Shape (Border Radius)
```css
--radius-none: 0;
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

## Usage in CSS Modules

Import tokens in your CSS Module file and use them with `var()`:

```css
/* components/Button/Button.module.css */
@import '../../styles/tokens.css';

.button {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  font-family: var(--font-family-brand);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-title);
  line-height: var(--line-height-title);
}

.button:hover {
  background-color: var(--color-primary-container);
  color: var(--color-on-primary-container);
}
```

## Checklist

- [ ] Define all CSS variables in `src/styles/tokens.css`
- [ ] Import tokens.css in CSS Modules using `@import`
- [ ] Replace hardcoded values with token variables in components
- [ ] Use semantic color names (e.g., `--color-primary` not `--color-green`)
- [ ] Document any new tokens added to the system
