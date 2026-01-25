---
name: component-architecture-css-modules
description: Use CSS Modules for scoped component styling with nested CSS syntax for pseudo-classes and child selectors. This skill guides creating components following the project's architecture.
---

# Component Architecture with CSS Modules

When creating components in this project, use CSS Modules for scoped styling with a flat component structure. **Always use nested CSS syntax** for pseudo-classes, pseudo-elements, and child selectors to keep styles organized and maintainable.

## When to Use This Skill

- Creating new components
- Styling components with CSS Modules
- Following the project's component architecture

## Directory Structure

```
src/components/
└── ComponentName/
    ├── ComponentName.tsx
    ├── ComponentName.module.css
    └── index.ts
```

All components live in a flat `components/` folder structure with their own subfolder.

## File Naming Convention

```
ComponentName/
├── ComponentName.tsx          # Component implementation
├── ComponentName.module.css   # CSS Modules stylesheet
└── index.ts                   # Re-exports
```

## Component Export Pattern

**IMPORTANT:** Always export the component inline with the const definition. Never use `displayName`.

### Standard Component

```typescript
// components/Button/Button.tsx
export const Button = ({ variant = 'primary', children, ...props }: ButtonProps) => {
  return <button {...props}>{children}</button>;
};
```

### ForwardRef Component

```typescript
// components/Input/Input.tsx
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...props }, ref) => {
    return <input ref={ref} className={className} {...props} />;
  }
);
```

### Index File

```typescript
// components/Button/index.ts
export { Button } from './Button';
export type { ButtonProps, ButtonVariant } from './Button';
```

## CSS Modules

CSS Modules provide scoped styling by automatically generating unique class names.

### CSS Nesting and Pseudo-Classes

**Always use nested CSS syntax** for pseudo-classes, pseudo-elements, and nested selectors. This project uses PostCSS with `postcss-nesting` plugin, which enables native CSS nesting syntax.

#### Basic Pseudo-Classes

```css
/* components/Button/Button.module.css */
.button {
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  /* Hover states */
  &:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
    transform: translateY(-1px);
  }

  /* Focus states for accessibility */
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  /* Disabled states */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Active states */
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
}
```

#### Nested Selectors with Modifiers

```css
/* components/PlayerCard/PlayerCard.module.css */
.card {
  display: flex;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all 0.2s ease-in-out;

  /* Nested pseudo-classes */
  &:hover {
    box-shadow: var(--shadow-card);
    border-color: var(--color-primary);
  }

  /* Data attribute selectors */
  &[data-priority='true'] {
    border-color: var(--color-priority);
    background-color: var(--color-priority-light);
  }

  /* Nested child elements */
  .content {
    display: flex;
    gap: var(--spacing-md);
    flex: 1;

    .name {
      font-weight: 500;
    }
  }

  /* Nested with pseudo-classes */
  .actions {
    display: flex;
    gap: var(--spacing-xs);

    button {
      border: none;
      background: transparent;
      cursor: pointer;

      &:hover {
        background-color: var(--color-background-main);
      }

      &:focus-visible {
        outline: 2px solid var(--color-primary);
        outline-offset: 2px;
      }
    }
  }
}
```

#### Pseudo-Elements

```css
/* components/Input/Input.module.css */
.input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);

  /* Placeholder styling */
  &::placeholder {
    color: var(--color-text-secondary);
    opacity: 0.7;
  }

  /* Focus state with pseudo-element */
  &:focus {
    border-color: var(--color-primary);
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;

    &::placeholder {
      opacity: 0.5;
    }
  }
}
```

#### Complex Nested Patterns

```css
/* components/TeamCard/TeamCard.module.css */
.card {
  display: flex;
  flex-direction: column;
  border: 2px solid var(--team-color, var(--color-primary));
  border-radius: var(--radius-xl);
  transition: all 0.2s ease-in-out;

  /* Hover effect */
  &:hover {
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-2px);
  }

  /* Header section */
  .header {
    padding: var(--spacing-md) var(--spacing-lg);
    background-color: var(--team-color, var(--color-primary));

    .titleRow {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);

      .iconWrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: var(--radius-full);
      }
    }
  }

  /* Players section */
  .players {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);

    /* Empty state */
    .emptyMessage {
      text-align: center;
      color: var(--color-text-secondary);
    }
  }
}
```

#### Media Queries with Nesting

```css
/* components/Button/Button.module.css */
.button {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: 1rem;
  min-height: 44px;

  /* Mobile-first: base styles for mobile */
  @media (max-width: 480px) {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: 0.875rem;
    min-height: 44px;
  }

  /* Tablet and up */
  @media (min-width: 481px) {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: 1rem;
  }

  /* Desktop */
  @media (min-width: 768px) {
    padding: var(--spacing-lg) var(--spacing-xl);
    font-size: 1.125rem;
    min-height: 48px;
  }
}
```

#### Combining Modifiers and Pseudo-Classes

```css
/* components/Button/Button.module.css */
.button {
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease-in-out;

  /* Variant modifiers */
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

  &.danger {
    background-color: var(--color-error);
    color: var(--color-background-card);

    &:hover:not(:disabled) {
      background-color: var(--color-error-dark);
    }
  }
}
```

### Best Practices for CSS Nesting

1. **Always nest pseudo-classes** - Use `&:hover`, `&:focus`, etc. instead of separate selectors
2. **Use `&` for parent reference** - The `&` symbol refers to the parent selector
3. **Nest child elements** - Keep related styles together by nesting child selectors
4. **Group related states** - Keep hover, focus, active, disabled states nested under the base class
5. **Use data attributes** - Use `&[data-attribute='value']` for conditional styling
6. **Mobile-first media queries** - Nest media queries within the component for better organization
7. **Avoid deep nesting** - Keep nesting to 2-3 levels maximum for maintainability
8. **Import tokens first** - Always import design tokens at the top of the file

### Combining Classes

```typescript
const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
```

### Using Design Tokens

```css
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}
```

## Full Example

```typescript
// components/Badge/Badge.tsx
import styles from './Badge.module.css';

export type BadgeVariant = 'default' | 'priority' | 'success' | 'error';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge = ({ variant = 'default', className = '', children, ...props }: BadgeProps) => {
  const badgeClasses = [styles.badge, styles[variant], className].filter(Boolean).join(' ');

  return (
    <span className={badgeClasses} {...props}>
      {children}
    </span>
  );
};
```

```typescript
// components/Badge/index.ts
export { Badge } from './Badge';
export type { BadgeProps, BadgeVariant } from './Badge';
```

## Implementation Checklist

- [ ] Create component folder: `ComponentName/`
- [ ] Create component file: `ComponentName.tsx` with inline export
- [ ] Create stylesheet: `ComponentName.module.css` with nested CSS syntax
- [ ] Use nested pseudo-classes (`&:hover`, `&:focus`, etc.) instead of separate selectors
- [ ] Nest child element selectors within parent classes
- [ ] Use `&` for parent reference in nested selectors
- [ ] Nest media queries within component classes
- [ ] Create index file: `index.ts` with named exports
- [ ] Import design tokens at the top: `@import '../../styles/tokens.css'`
- [ ] Use CSS variables from design tokens
- [ ] Use TypeScript for component props
- [ ] NO `displayName` - export inline instead
- [ ] NO default exports - use named exports only
