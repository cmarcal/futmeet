---
name: error-handling-strategy
description: Implement error handling with Error Boundaries and form validation. This skill guides error handling for client-side only MVP.
---

# Error Handling Strategy

When implementing error handling in this project, use a multi-layer approach covering React Error Boundaries and form validation.

## When to Use This Skill

- Setting up Error Boundaries
- Handling form validation errors
- Creating user-friendly error messages

## Key Principles

1. **Error Boundaries**: Catch unexpected runtime errors
2. **Form Validation**: Handle validation errors gracefully
3. **User-Friendly Messages**: Clear, actionable error messages
4. **Recovery Options**: Always provide ways to recover from errors
5. **Accessibility**: Proper ARIA attributes for error states

## Error Handling Layers

### 1. React Error Boundaries (Global)

Catches unexpected runtime errors in component tree.

#### Installation

```bash
npm install react-error-boundary
```

#### Error Boundary Setup

```typescript
// components/ErrorBoundary/ErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.href = '/';
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

#### Error Fallback Component

```typescript
// components/ErrorBoundary/ErrorFallback.tsx
import { FallbackProps } from 'react-error-boundary';
import { Button } from '../base-elements/Button';
import styles from './ErrorFallback.module.css';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className={styles.errorFallback} role="alert">
      <h2 className={styles.title}>Something went wrong</h2>
      <p className={styles.message}>
        We're sorry, but something unexpected happened.
      </p>
      {process.env.NODE_ENV === 'development' && (
        <pre className={styles.errorDetails}>{error.message}</pre>
      )}
      <div className={styles.actions}>
        <Button onClick={resetErrorBoundary} variant="primary">
          Try Again
        </Button>
        <Button onClick={() => window.location.href = '/'} variant="secondary">
          Go Home
        </Button>
      </div>
    </div>
  );
}
```

### 2. Form Validation Errors

Handle validation errors from React Hook Form + Zod.

#### FormError Component

```typescript
// components/components/FormError/FormError.tsx
import styles from './FormError.module.css';

interface FormErrorProps {
  error?: string | { message?: string };
  className?: string;
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' 
    ? error 
    : error.message || 'An error occurred';

  return (
    <span className={`${styles.error} ${className || ''}`} role="alert">
      {errorMessage}
    </span>
  );
}
```

#### Usage in Forms

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormError } from '@/components/components/FormError';

function PlayerInput() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addPlayerSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input {...register('name')} aria-invalid={!!errors.name} />
        <FormError error={errors.name} />
      </div>
    </form>
  );
}
```

### 3. User-Facing Error Messages

Display clear, actionable error messages.

#### Alert Component

```typescript
// components/base-elements/Alert/Alert.tsx
import styles from './Alert.module.css';

interface AlertProps {
  variant?: 'error' | 'warning' | 'success' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ variant = 'info', children, onClose }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[variant]}`} role="alert">
      <span>{children}</span>
      {onClose && (
        <button onClick={onClose} aria-label="Close alert">×</button>
      )}
    </div>
  );
}
```

## Best Practices

1. **Always Provide Recovery**: Give users ways to fix or retry
2. **Clear Messages**: Use plain language, avoid technical jargon
3. **Accessibility**: Use `role="alert"` for error messages
4. **Don't Crash**: Error Boundaries should catch everything, not let app crash

## Related Files

- `adr/frontend/01-frontend-architecture/error-handling-strategy.md` - Full error handling documentation

## Checklist

- [ ] Install `react-error-boundary`
- [ ] Set up Error Boundary in App
- [ ] Create ErrorFallback component
- [ ] Create FormError component
- [ ] Create Alert component for user messages
