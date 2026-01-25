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
└── ComponentName.tsx
└── ComponentName.module.css
```

All components live in a flat `components/` folder structure.

## File Naming Convention

```
ComponentName.tsx          # Component implementation
ComponentName.module.css    # CSS Modules stylesheet
```

## CSS Modules

CSS Modules provide scoped styling by automatically generating unique class names. Each `.module.css` file creates a local scope for its styles, preventing naming conflicts.

### Example: Button Component

```typescript
// components/Button.tsx
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export const Button = ({ 
  variant = 'primary', 
  size = 'medium', 
  className,
  children,
  ...props 
}: ButtonProps) => {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
```

```css
/* components/Button.module.css */
.button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.secondary {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
}

.small {
  padding: 4px 12px;
  font-size: 14px;
}

.medium {
  padding: 8px 16px;
  font-size: 16px;
}

.large {
  padding: 12px 24px;
  font-size: 18px;
}
```

## Usage Pattern

### Importing Styles

```typescript
import styles from './Component.module.css';

// Use in className
<div className={styles.container}>
  <p className={styles.text}>Content</p>
</div>
```

### Combining Classes

```typescript
const classes = [
  styles.base,
  variant && styles[variant],
  className, // Allow external className
].filter(Boolean).join(' ');

<div className={classes} />
```

### Using Design Tokens

```css
/* Use CSS variables from design tokens */
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
}
```

## Implementation Checklist

- [ ] Create component file: `ComponentName.tsx`
- [ ] Create stylesheet: `ComponentName.module.css`
- [ ] Use CSS Modules for scoped styling
- [ ] Reference design tokens via CSS variables
- [ ] Use TypeScript for component props
