---
name: component-architecture-css-modules
description: Use CSS Modules for scoped component styling with a flat component structure. This skill guides creating components following the project's architecture.
---

# Component Architecture with CSS Modules

When creating components in this project, use CSS Modules for scoped styling with a flat component structure.

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

### Use Nested Pseudo-Classes

```css
/* components/Button/Button.module.css */
.button {
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--color-primary-dark);
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.primary {
  background-color: var(--color-primary);
  color: var(--color-background-card);
}
```

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
- [ ] Create stylesheet: `ComponentName.module.css` with nested pseudo-classes
- [ ] Create index file: `index.ts` with named exports
- [ ] Use CSS variables from design tokens
- [ ] Use TypeScript for component props
- [ ] NO `displayName` - export inline instead
- [ ] NO default exports - use named exports only
