---
name: component-architecture-css-modules
description: Use when creating React components, structuring component files, or writing CSS Modules styles.
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

Flat `components/` folder, one subfolder per component.

## Export Conventions

- Export inline with the `const` definition; `displayName` only for `forwardRef`
- Named exports only, no default exports
- `index.ts` re-exports the component and its types

```typescript
export const Button = ({ variant = 'primary', children, ...props }: ButtonProps) => {
  return <button {...props}>{children}</button>;
};

// index.ts
export { Button } from './Button';
export type { ButtonProps, ButtonVariant } from './Button';
```

## CSS Nesting

PostCSS with `postcss-nesting` is active. Nest everything under the component class.

1. Nest pseudo-classes (`&:hover`, `&:focus-visible`, `&:disabled`)
2. Nest pseudo-elements (`&::placeholder`, `&::before`)
3. Nest child element selectors inside the parent class
4. Nest media queries inside the component class (mobile-first, see `mobile-first-strategy`)
5. Max nesting depth: 3 levels
6. Use `&[data-attribute='value']` for conditional styling

```css
.button {
  border-radius: var(--radius-md);

  &:hover:not(:disabled) { background-color: var(--color-primary-dark); }
  &:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }

  &.primary { background-color: var(--color-primary); }
}
```

## Combining Classes

```typescript
const classes = [styles.button, styles[variant], className].filter(Boolean).join(' ');
```

## Design Tokens

Import tokens and use `var()` for every color, spacing and radius value. Token catalog: `design-tokens-strategy` skill.

```css
@import '../../styles/tokens.css';
```

## References

Read `references/examples.md` for nested child elements, pseudo-elements, nested media queries, `forwardRef` and a full Badge component.
