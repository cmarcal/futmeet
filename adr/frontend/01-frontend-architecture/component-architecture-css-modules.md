# CSS Modules Strategy

## Overview
Use CSS Modules for scoped styling in React components. This provides type-safe, maintainable styles without class name collisions.

---

## Why CSS Modules?

- ✅ **Scoped Styles**: No class name collisions
- ✅ **TypeScript Support**: Import CSS as modules with type safety
- ✅ **Maintainable**: Styles co-located with components
- ✅ **Performance**: Only loads styles for used components
- ✅ **No Runtime**: Compiled at build time

---

## Component Structure

### Flat Folder Structure
For an MVP with ~10 components, use a simple flat structure:

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   └── index.ts
│   ├── Input/
│   │   ├── Input.tsx
│   │   ├── Input.module.css
│   │   └── index.ts
│   └── PlayerCard/
│       ├── PlayerCard.tsx
│       ├── PlayerCard.module.css
│       └── index.ts
├── styles/
│   ├── global.css
│   ├── tokens.css
│   └── utilities.css
└── pages/
    ├── HomePage.tsx
    └── GamePage.tsx
```

### File Naming Convention
```
ComponentName.tsx
ComponentName.module.css    ← CSS Modules file
```

---

## Example Implementation

### Button Component

```typescript
// components/Button/Button.tsx
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
/* components/Button/Button.module.css */
.button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.primary {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.primary:hover {
  background-color: var(--md-sys-color-primary-hover);
}

.secondary {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
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

---

## Usage Pattern

1. **Import styles**: `import styles from './ComponentName.module.css'`
2. **Use class names**: `className={styles.className}`
3. **Combine classes**: Use template literals or array join for multiple classes
4. **Use design tokens**: Reference CSS variables from `tokens.css` in your CSS Modules

---

## Implementation Checklist

- [ ] Set up CSS Modules configuration in Vite
- [ ] Create flat `components/` folder structure
- [ ] Create first component (Button) with CSS Module
- [ ] Use design tokens (CSS variables) in CSS Modules
- [ ] Document component props with TypeScript interfaces

---

## Decision Summary

✅ **Use CSS Modules for component styling**

**Structure:**
- Flat `components/` folder (no hierarchy)
- CSS Modules for scoped styling
- CSS Variables for design tokens
- Co-located styles with components
