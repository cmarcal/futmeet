# Error Handling Strategy

## Overview
Comprehensive error handling strategy for the FutMeet MVP covering React Error Boundaries, form validation errors, API errors, and user-facing error messaging.

---

## Error Handling Layers

### 1. **React Error Boundaries** (Global Error Handling)
### 2. **Form Validation Errors** (React Hook Form + Zod)
### 3. **API Errors** (TanStack Query)
### 4. **User-Facing Error Messages** (UI Feedback)

---

## 1. React Error Boundaries

### What It Is
React component that catches JavaScript errors anywhere in the child component tree, logs them, and displays a fallback UI.

### Implementation

**Note**: Native React Error Boundaries require class components. We'll use the `react-error-boundary` library which provides a functional component API and hooks.

#### Installation
```bash
npm install react-error-boundary
```

#### Error Boundary Component (Functional)
```typescript
// components/ErrorBoundary/ErrorBoundary.tsx
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './ErrorFallback';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

const logError = (error: Error, errorInfo: { componentStack: string }) => {
  // Log error to error reporting service
  console.error('Error caught by boundary:', error, errorInfo);
  // TODO: Send to error tracking service (Sentry, etc.)
};

export function AppErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Reset app state if needed
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

#### Using useErrorHandler Hook (Alternative Pattern)
```typescript
// For catching errors in async code or callbacks
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
        <Route path="/results" element={<ResultsPage />} />
      </Routes>
    </AppErrorBoundary>
  );
}
```

### Why react-error-boundary?

**Benefits:**
- ✅ Functional component API (aligns with modern React patterns)
- ✅ Built-in hooks (`useErrorHandler` for async errors)
- ✅ Better TypeScript support
- ✅ Flexible fallback components
- ✅ Reset functionality built-in
- ✅ Well-maintained library

**Alternative (Native Class Component):**
If you prefer not to add a dependency, native Error Boundaries require class components. However, `react-error-boundary` is lightweight (~2KB) and provides a much better developer experience.

---

## 2. Form Validation Errors

### React Hook Form + Zod Integration

#### Error Display Component
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

#### Form Field with Error
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

## 3. API Errors (TanStack Query)

### Error Handling in Queries

```typescript
// hooks/api/usePlayers.ts
import { useQuery } from '@tanstack/react-query';

export function usePlayers(gameId: string) {
  return useQuery({
    queryKey: ['players', gameId],
    queryFn: async () => {
      const response = await fetchPlayers(gameId);
      if (!response.ok) {
        throw new Error('Failed to fetch players');
      }
      return response.data;
    },
    onError: (error) => {
      // Log error or show notification
      console.error('Error fetching players:', error);
    },
  });
}
```

### Error Display in Components

```typescript
// Component using query
function PlayerList() {
  const { data, isLoading, error } = usePlayers(gameId);

  if (isLoading) return <LoadingSpinner />;
  
  if (error) {
    return (
      <Alert variant="error">
        Failed to load players. Please try again.
      </Alert>
    );
  }

  return <div>{/* player list */}</div>;
}
```

### Mutation Error Handling

```typescript
// hooks/api/useAddPlayer.ts
export function useAddPlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addPlayerAPI,
    onError: (error) => {
      // Handle error
      console.error('Failed to add player:', error);
      // Show user notification
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
}
```

---

## 4. User-Facing Error Messages

### Error Alert Component

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

### Toast Notifications (Future)

```typescript
// Future: Add toast notifications for non-blocking errors
import { toast } from 'react-toastify';

// Usage
toast.error('Failed to add player');
toast.success('Player added successfully');
```

---

## Error Types & Handling

### 1. **Validation Errors** (Forms)
- **Source**: Zod schema validation
- **Display**: Inline with form fields
- **Recovery**: User corrects input

### 2. **API Errors** (Network/Server)
- **Source**: TanStack Query mutations/queries
- **Display**: Alert component or toast
- **Recovery**: Retry mechanism or user action

### 3. **Runtime Errors** (Code Bugs)
- **Source**: JavaScript errors in components
- **Display**: Error Boundary fallback UI
- **Recovery**: Reset button or page reload

### 4. **User Errors** (Business Logic)
- **Source**: Invalid user actions
- **Display**: Inline messages or alerts
- **Recovery**: Clear instructions for user

---

## Error Logging Strategy

### Development
```typescript
// Log to console
console.error('Error:', error);
```

### Production (Future)
```typescript
// Send to error tracking service
// Example: Sentry, LogRocket, etc.
if (process.env.NODE_ENV === 'production') {
  // Send error to tracking service
  errorTrackingService.captureException(error);
}
```

---

## Best Practices

### 1. **User-Friendly Messages**
```typescript
// ❌ Bad
throw new Error('ERR_404_NOT_FOUND');

// ✅ Good
throw new Error('Player not found. Please check the ID and try again.');
```

### 2. **Error Recovery Options**
Always provide a way to recover:
- Retry buttons for API errors
- Clear form and try again
- Navigation back to safe state

### 3. **Accessibility**
```typescript
// Use ARIA attributes
<span role="alert" aria-live="polite">
  {errorMessage}
</span>
```

### 4. **Error Boundaries Placement**
- Wrap major routes/sections
- Don't wrap everything (defeats purpose)
- Provide context-specific fallbacks

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Install `react-error-boundary` library
- [ ] Create ErrorBoundary and ErrorFallback components (functional)
- [ ] Add ErrorBoundary to App.tsx
- [ ] Create FormError component
- [ ] Integrate form errors with React Hook Form

### Phase 2: API Error Handling
- [ ] Handle TanStack Query errors
- [ ] Create Alert component for errors
- [ ] Add error handling to all queries/mutations
- [ ] Implement retry logic where appropriate

### Phase 3: Enhancement
- [ ] Add error logging service (production)
- [ ] Implement toast notifications (optional)
- [ ] Add error analytics tracking
- [ ] Create error recovery flows

---

## Decision Summary

✅ **Multi-Layer Error Handling Strategy**

**Layers:**
1. **Error Boundaries** - Catch unexpected runtime errors
2. **Form Validation** - React Hook Form + Zod inline errors
3. **API Errors** - TanStack Query error handling
4. **User Feedback** - Alert components and notifications

**Principles:**
- User-friendly error messages
- Always provide recovery options
- Accessibility (ARIA attributes)
- Logging for debugging (development and production)

---

**Status**: Error handling strategy defined  
**Next Steps**: Implement Error Boundary and FormError components in Phase 1
