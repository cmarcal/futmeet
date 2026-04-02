---
name: component-architecture-css-modules
description: Use when creating new React components, structuring component files, or writing CSS Modules styles. Covers directory layout, export conventions, CSS nesting syntax, and design token usage.
---

# Component Architecture with CSS Modules

## Directory Structure

```
src/components/
└── ComponentName/
    ├── ComponentName.tsx
    ├── ComponentName.module.css
    └── index.ts
```

All components live in a flat `components/` folder — each in its own subfolder.

## Export Conventions

- Export inline with the `const` definition — never use `displayName` except for `forwardRef`
- Named exports only — no default exports

```typescript
// ComponentName.tsx
export const Button = ({ variant = 'primary', children, ...props }: ButtonProps) => {
  return <button {...props}>{children}</button>;
};

// ForwardRef
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...props }, ref) => (
    <input ref={ref} className={className} {...props} />
  )
);

// index.ts
export { Button } from './Button';
export type { ButtonProps, ButtonVariant } from './Button';
```

## CSS Modules with Nesting

This project uses PostCSS with `postcss-nesting`. Always use nested CSS syntax — never write flat separate selectors for pseudo-classes or child elements.

```css
/* Button.module.css */
.button {
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &.primary {
    background-color: var(--color-primary);
    color: var(--color-background-card);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-dark);
      box-shadow: var(--shadow-button-hover);
    }
  }

  &.secondary {
    background-color: var(--color-background-card);
    color: var(--color-primary);
    border: 1px solid var(--color-primary);

    &:hover:not(:disabled) {
      background-color: var(--color-primary-container);
    }
  }
}
```

### Nested Child Elements

```css
.card {
  display: flex;
  padding: var(--spacing-md);

  &:hover {
    box-shadow: var(--shadow-card);
  }

  &[data-priority='true'] {
    border-color: var(--color-priority);
  }

  .content {
    display: flex;
    gap: var(--spacing-md);

    .name { font-weight: 500; }
  }

  .actions {
    button {
      border: none;
      background: transparent;

      &:hover { background-color: var(--color-background-main); }
      &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
    }
  }
}
```

### Pseudo-Elements

```css
.input {
  &::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.7;
  }

  &:focus {
    border-color: var(--color-primary);

    &::placeholder { opacity: 0.5; }
  }
}
```

### Media Queries (Mobile-First, Nested)

```css
.button {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.875rem;
  min-height: 44px;

  @media (min-width: 481px) {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 1rem;
  }

  @media (min-width: 768px) {
    padding: var(--spacing-lg) var(--spacing-xl);
    font-size: 1.125rem;
    min-height: 48px;
  }
}
```

## Combining Classes

```typescript
const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
```

## Design Tokens

Always import tokens and use `var()`:

```css
@import '../../styles/tokens.css';

.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}
```

## Full Example

```typescript
// Badge.tsx
import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'priority' | 'success' | 'error';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({ variant = 'default', className = '', children, ...props }: BadgeProps) => {
  const badgeClasses = [styles.badge, styles[variant], className].filter(Boolean).join(' ');
  return <span className={badgeClasses} {...props}>{children}</span>;
};
```

## CSS Nesting Rules

1. Always nest pseudo-classes (`&:hover`, `&:focus-visible`, `&:disabled`)
2. Always nest pseudo-elements (`&::placeholder`, `&::before`)
3. Nest child element selectors within parent classes
4. Nest media queries within the component class
5. Max nesting depth: 3 levels
6. Use `&[data-attribute='value']` for conditional styling
