# Component and CSS Module Examples

## ForwardRef

```typescript
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, className = '', ...props }, ref) => (
    <input ref={ref} className={className} {...props} />
  )
);
```

## Variants and states

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

## Nested child elements

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

## Pseudo-elements

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

## Media queries (mobile-first, nested)

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

## Full component

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
