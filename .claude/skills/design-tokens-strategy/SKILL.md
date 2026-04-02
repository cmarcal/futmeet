---
name: design-tokens-strategy
description: Use when referencing or defining design tokens (colors, spacing, typography, border radius) in CSS Modules. Covers the token catalog and import convention for src/styles/tokens.css.
---

# Design Tokens Strategy

Define all design tokens as CSS variables in `src/styles/tokens.css`. Import in CSS Modules with `@import` and reference via `var()`. Never use hardcoded values.

## Token Catalog

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

  &:hover {
    background-color: var(--color-primary-container);
    color: var(--color-on-primary-container);
  }
}
```

## Rules

- Always use semantic token names: `--color-primary` not `--color-green`
- Import `tokens.css` at the top of every CSS Module file
- Add new tokens to `tokens.css` first — never define one-off variables in module files
- Document any new tokens added
