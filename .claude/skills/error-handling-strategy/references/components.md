# Error Components

Install: `npm install react-error-boundary`

## ErrorFallback

```typescript
import { FallbackProps } from 'react-error-boundary';
import { Button } from '../base-elements/Button';
import styles from './ErrorFallback.module.css';

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => (
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
```

## FormError

```typescript
interface FormErrorProps {
  error?: string | { message?: string };
  className?: string;
}
```

Usage in a form:

```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(addPlayerSchema),
});

<form onSubmit={handleSubmit(handleFormSubmit)}>
  <input {...register('name')} aria-invalid={!!errors.name} />
  <FormError error={errors.name} />
</form>
```

## Alert

```typescript
interface AlertProps {
  variant?: 'error' | 'warning' | 'success' | 'info';
  children: React.ReactNode;
  onClose?: () => void;
}

export const Alert = ({ variant = 'info', children, onClose }: AlertProps) => (
  <div className={`${styles.alert} ${styles[variant]}`} role="alert">
    <span>{children}</span>
    {onClose && <button onClick={onClose} aria-label="Close alert">×</button>}
  </div>
);
```
