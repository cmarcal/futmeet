# Error Handling Strategy

## Overview
Simple error handling strategy for the FutMeet MVP covering React Error Boundaries, form validation errors, and user-facing error messaging. Client-side only with no backend API.

---

## Error Handling Layers

### 1. **React Error Boundaries** (Global Error Handling)
### 2. **Form Validation Errors** (React Hook Form + Zod)
### 3. **User-Facing Error Messages** (UI Feedback)

---

## 1. React Error Boundaries

### What It Is
React component that catches JavaScript errors anywhere in the child component tree and displays a fallback UI.

### Implementation

**Note**: Native React Error Boundaries require class components. We'll use the `react-error-boundary` library which provides a functional component API.

#### Installation
```bash
npm install react-error-boundary
```

#### Error Boundary Component
```typescript
// components/ErrorBoundary/ErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export function AppErrorBoundary({ children }: ErrorBoundaryProps) {
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

### Usage in App
```typescript
// App.tsx
import { AppErrorBoundary } from './components/ErrorBoundary';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <AppErrorBoundary>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/game" element={<GamePage />} />
      </Routes>
    </AppErrorBoundary>
  );
}
```

---

## 2. Form Validation Errors

### React Hook Form + Zod Integration

#### Form Error Component
```typescript
// components/molecules/FormError/FormError.tsx
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

#### Usage Example
```typescript
// Example: PlayerInput component
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormError } from '../molecules/FormError';

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
        <input {...register('name')} />
        <FormError error={errors.name} />
      </div>
    </form>
  );
}
```

---

## 3. User-Facing Error Messages

### Alert Component

```typescript
// components/molecules/Alert/Alert.tsx
import styles from './Alert.module.css';

interface AlertProps {
  variant?: 'error' | 'warning' | 'success' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
}

export function Alert({ variant = 'info', children, onClose }: AlertProps) {
  return (
    <div className={`${styles.alert} ${styles[variant]}`} role="alert">
      {children}
      {onClose && (
        <button onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}
```

---

## Best Practices

### 1. **User-Friendly Messages**
```typescript
// ❌ Bad
throw new Error('ERR_404_NOT_FOUND');

// ✅ Good
throw new Error('Player not found. Please check and try again.');
```

### 2. **Error Recovery Options**
Always provide a way to recover:
- Reset button in Error Boundary
- Clear form and try again
- Navigation back to safe state

### 3. **Accessibility**
```typescript
// Use ARIA attributes
<span role="alert" aria-live="polite">
  {errorMessage}
</span>
```

---

## Implementation Checklist

- [ ] Install `react-error-boundary` library
- [ ] Create ErrorBoundary and ErrorFallback components
- [ ] Add ErrorBoundary to App.tsx
- [ ] Create FormError component for form validation
- [ ] Create Alert component for user messages

---

## Decision Summary

✅ **Simple Multi-Layer Error Handling Strategy**

**Layers:**
1. **Error Boundaries** - Catch unexpected runtime errors
2. **Form Validation** - React Hook Form + Zod inline errors
3. **User Feedback** - Alert components for messages

**Principles:**
- User-friendly error messages
- Always provide recovery options
- Accessibility (ARIA attributes)

---

**Status**: Error handling strategy defined  
**Next Steps**: Implement Error Boundary and FormError components
