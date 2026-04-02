---
name: forms-react-hook-form-zod
description: Use when creating forms, defining validation schemas, handling form errors, or integrating forms with Zustand stores. Covers React Hook Form + Zod patterns for type-safe forms.
---

# Forms with React Hook Form + Zod

Define Zod schemas first — they are the single source of truth for both validation and TypeScript types.

Install: `npm install react-hook-form zod @hookform/resolvers`

## Schema First

```typescript
// schemas/playerSchemas.ts
import { z } from 'zod';

export const addPlayerSchema = z.object({
  name: z.string().min(1, "Player name is required").max(50, "Name is too long").trim(),
  priority: z.boolean().default(false),
});

export const teamSettingsSchema = z.object({
  teamCount: z.number().int("Must be a whole number").min(2, "Need at least 2 teams").max(10, "Maximum 10 teams"),
});

export type AddPlayerInput = z.infer<typeof addPlayerSchema>;
export type TeamSettingsInput = z.infer<typeof teamSettingsSchema>;
```

## Basic Form

```typescript
// components/sections/PlayerInput.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addPlayerSchema, type AddPlayerInput } from '@/schemas/playerSchemas';
import { useGameStore } from '@/stores/gameStore';

export const PlayerInput = () => {
  const addPlayer = useGameStore((state) => state.addPlayer);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddPlayerInput>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: { priority: false },
  });

  const onSubmit = (data: AddPlayerInput) => {
    addPlayer({ id: crypto.randomUUID(), name: data.name, priority: data.priority, timestamp: new Date() });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Player Name</label>
        <input
          id="name"
          {...register("name")}
          aria-invalid={errors.name ? "true" : "false"}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        {errors.name && <span id="name-error" role="alert">{errors.name.message}</span>}
      </div>
      <div>
        <label>
          <input type="checkbox" {...register("priority")} />
          Priority Player
        </label>
      </div>
      <button type="submit">Add Player</button>
    </form>
  );
};
```

## Reusable FormField Component

```typescript
// components/components/FormField.tsx
import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import styles from './FormField.module.css';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, id, ...props }, ref) => {
    const inputId = id || `field-${label.toLowerCase()}`;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className={styles.formField}>
        <label htmlFor={inputId} className={styles.label}>{label}</label>
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={errorId}
          {...props}
        />
        {error && <span id={errorId} className={styles.error} role="alert">{error.message}</span>}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
```

```typescript
// Usage
<form onSubmit={handleSubmit(onSubmit)}>
  <FormField label="Player Name" {...register("name")} error={errors.name} />
  <button type="submit">Add Player</button>
</form>
```

## Advanced Patterns

### Conditional Validation

```typescript
const formSchema = z.object({
  hasEmail: z.boolean(),
  email: z.string().optional(),
}).refine((data) => !data.hasEmail || !!data.email, {
  message: "Email is required when checkbox is checked",
  path: ["email"],
});
```

### Custom Error Messages

```typescript
const playerSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be text",
  }).min(1, "Name cannot be empty").max(50, "Name is too long (max 50 characters)"),
});
```

### Common Hooks

```typescript
const { reset } = useForm();
reset(); // Clear form after success

const { watch } = useForm();
const priority = watch("priority"); // Reactive field value

const { setValue } = useForm();
setValue("name", "John Doe"); // Set programmatically
```

## File Organization

```
src/
├── schemas/
│   ├── playerSchemas.ts
│   ├── teamSchemas.ts
│   └── index.ts
├── components/
│   ├── components/FormField/
│   └── sections/PlayerInput/
```

## Best Practices

- Define schemas in `src/schemas/` before writing form components
- Use `z.infer<typeof schema>` for types — never define duplicate TypeScript types
- Always include `aria-invalid` and `aria-describedby` for accessible error states
- Provide sensible `defaultValues` — avoids uncontrolled/controlled input warnings
- Call `reset()` after successful form submission
