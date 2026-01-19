---
name: error-handling-strategy
description: Implement multi-layer error handling with Error Boundaries, form validation, and API error handling. This skill guides comprehensive error handling following the project's error strategy.
---

# Error Handling Strategy

When implementing error handling in this project, use a multi-layer approach covering React Error Boundaries, form validation, API errors, and user-facing messages.

## When to Use This Skill

- Setting up Error Boundaries
- Handling form validation errors
- Managing API error states
- Creating user-friendly error messages
- Handling async errors

## Key Principles

1. **Multi-Layer Approach**: Error Boundaries, Form Validation, API Errors, User Messages
2. **User-Friendly Messages**: Clear, actionable error messages
3. **Recovery Options**: Always provide ways to recover from errors
4. **Accessibility**: Proper ARIA attributes for error states
5. **Logging**: Log errors for debugging (development/production)

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

const logError = (error: Error, errorInfo: { componentStack: string }) => {
  console.error('Error caught by boundary:', error, errorInfo);
  // TODO: Send to error tracking service (Sentry, etc.)
};

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
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

#### Using useErrorHandler Hook

```typescript
// For catching errors in async code
import { useErrorHandler } from 'react-error-boundary';

function PlayerList() {
  const handleError = useErrorHandler();

  const handleAsyncOperation = async () => {
    try {
      await someAsyncOperation();
    } catch (error) {
      handleError(error); // Will be caught by ErrorBoundary
    }
  };

  return <div>{/* component content */}</div>;
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

### 3. API Errors (TanStack Query)

Handle API errors in queries and mutations.

#### Query Error Handling

```typescript
function PlayerList() {
  const { data, isLoading, error } = usePlayers(gameId);
  
  if (isLoading) return <div>Loading...</div>;
  
  if (error) {
    return (
      <div role="alert" className={styles.errorContainer}>
        <p>Failed to load players: {error.message}</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }
  
  return <div>{/* Player list */}</div>;
}
```

#### Mutation Error Handling

```typescript
function PlayerInput() {
  const { mutate: addPlayer, isPending, error } = useAddPlayer();
  
  const onSubmit = (data: AddPlayerInput) => {
    addPlayer(data, {
      onError: (error) => {
        // Handle mutation error
        console.error('Failed to add player:', error);
        // Show user notification
      },
    });
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && (
        <Alert variant="error" role="alert">
          Failed to add player: {error.message}
        </Alert>
      )}
      {/* Form fields */}
    </form>
  );
}
```

### 4. User-Facing Error Messages

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

#### Usage Examples

```typescript
// Error message
<Alert variant="error">
  Failed to save player. Please try again.
</Alert>

// Success message
<Alert variant="success">
  Player added successfully!
</Alert>
```

## Best Practices

1. **Always Provide Recovery**: Give users ways to fix or retry
2. **Clear Messages**: Use plain language, avoid technical jargon
3. **Accessibility**: Use `role="alert"` for error messages
4. **Logging**: Log errors for debugging (development only in console, production to service)
5. **Don't Crash**: Error Boundaries should catch everything, not let app crash

## Related Files

- `adr/frontend/01-frontend-architecture/error-handling-strategy.md` - Full error handling documentation
- `adr/frontend/01-frontend-architecture/final-decisions.md` - Error handling decision

## Checklist

- [ ] Install `react-error-boundary`
- [ ] Set up Error Boundary in App
- [ ] Create ErrorFallback component
- [ ] Create FormError component
- [ ] Handle API errors in queries/mutations
- [ ] Create Alert component for user messages
- [ ] Test error scenarios
