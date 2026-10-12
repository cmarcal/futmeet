---
name: error-handling-strategy
description: Use when setting up React Error Boundaries, form validation errors, or user-facing error UI (Alert, FormError, ErrorFallback).
---

# Error Handling Strategy

Three layers, each with one job:

| Layer | Handles | Tool |
|---|---|---|
| 1. Error Boundary | Unexpected render errors | `react-error-boundary` + `ErrorFallback` |
| 2. Form errors | Validation failures | React Hook Form + Zod + `FormError` (`forms-react-hook-form-zod`) |
| 3. Alert | User-facing messages | `Alert` component |

Error Boundaries catch rendering errors only; handle API/async errors at the call site.

## Rules

- Every error message has `role="alert"`
- Show `error.message` in development only, never in production
- Every failure screen offers a recovery action (retry, go home)
- User-facing text uses plain language, no technical jargon

## Layer 1: Boundary

```typescript
export const AppErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    FallbackComponent={ErrorFallback}
    onReset={() => { window.location.href = '/'; }}
  >
    {children}
  </ErrorBoundary>
);
```

## Layer 2: FormError

```typescript
export const FormError = ({ error, className }: FormErrorProps) => {
  if (!error) return null;
  const errorMessage = typeof error === 'string' ? error : error.message || 'An error occurred';
  return <span className={`${styles.error} ${className || ''}`} role="alert">{errorMessage}</span>;
};
```

## Layer 3: Alert

Props: `variant` (`error | warning | success | info`), `children`, optional `onClose` rendering a button with `aria-label="Close alert"`.

## References

Read `references/components.md` for the full `ErrorFallback`, `Alert` and form usage code.
