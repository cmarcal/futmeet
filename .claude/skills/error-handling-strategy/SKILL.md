---
name: error-handling-strategy
description: Use when setting up React Error Boundaries, handling form validation errors, or creating user-facing error UI components (Alert, FormError, ErrorFallback).
---

# Error Handling Strategy

Use a multi-layer approach: Error Boundaries for unexpected runtime errors, form validation errors via React Hook Form + Zod, and Alert components for user-facing messages.

Install: `npm install react-error-boundary`

## Layer 1: React Error Boundary (Global)

```typescript
// components/ErrorBoundary/ErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';

export function AppErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => { window.location.href = '/'; }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

```typescript
// components/ErrorBoundary/ErrorFallback.tsx
import { FallbackProps } from 'react-error-boundary';
import { Button } from '../base-elements/Button';
import styles from './ErrorFallback.module.css';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className={styles.errorFallback} role="alert">
      <h2 className={styles.title}>Something went wrong</h2>
      <p className={styles.message}>We're sorry, but something unexpected happened.</p>
      {process.env.NODE_ENV === 'development' && (
        <pre className={styles.errorDetails}>{error.message}</pre>
      )}
      <div className={styles.actions}>
        <Button onClick={resetErrorBoundary} variant="primary">Try Again</Button>
        <Button onClick={() => window.location.href = '/'} variant="secondary">Go Home</Button>
      </div>
    </div>
  );
}
```

## Layer 2: Form Validation Errors

```typescript
// components/components/FormError/FormError.tsx
interface FormErrorProps {
  error?: string | { message?: string };
  className?: string;
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null;
  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';
  return (
    <span className={`${styles.error} ${className || ''}`} role="alert">
      {errorMessage}
    </span>
  );
}
```

```typescript
// Usage in form
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(addPlayerSchema),
});

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('name')} aria-invalid={!!errors.name} />
    <FormError error={errors.name} />
  </form>
);
```

## Layer 3: Alert Component for User Messages

```typescript
// components/base-elements/Alert/Alert.tsx
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

- Always use `role="alert"` on error messages for screen reader accessibility
- Show error details (`error.message`) only in development — never in production
- Always provide recovery actions (retry button, navigate home)
- Use plain language in user-facing error messages — avoid technical jargon
- Error Boundaries catch rendering errors — API/async errors must be handled separately at the call site
