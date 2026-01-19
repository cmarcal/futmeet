---
name: forms-react-hook-form-zod
description: Use React Hook Form with Zod for type-safe form validation. This skill guides form implementation with validation schemas and error handling.
---

# Forms with React Hook Form + Zod

When creating forms in this project, use React Hook Form with Zod validation. This provides type-safe forms with excellent performance and developer experience.

## When to Use This Skill

- Creating new forms (player input, settings, etc.)
- Adding form validation
- Setting up form schemas
- Handling form errors
- Integrating forms with state management

## Key Principles

1. **React Hook Form** for form state and handling (minimal re-renders)
2. **Zod** for validation schemas and TypeScript types
3. **Single Source of Truth**: Schema defines both validation and types
4. **Type Safety**: Types generated from Zod schemas
5. **Accessible Forms**: Proper error messages and ARIA attributes

## Implementation Pattern

### Define Schema First

```typescript
// schemas/playerSchemas.ts
import { z } from 'zod';

export const addPlayerSchema = z.object({
  name: z.string()
    .min(1, "Player name is required")
    .max(50, "Name is too long")
    .trim(),
  priority: z.boolean().default(false),
});

export const teamSettingsSchema = z.object({
  teamCount: z.number()
    .int("Must be a whole number")
    .min(2, "Need at least 2 teams")
    .max(10, "Maximum 10 teams allowed"),
});

// Generate TypeScript types from schemas
export type AddPlayerInput = z.infer<typeof addPlayerSchema>;
export type TeamSettingsInput = z.infer<typeof teamSettingsSchema>;
```

### Basic Form Setup

```typescript
// components/sections/PlayerInput.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addPlayerSchema, type AddPlayerInput } from '@/schemas/playerSchemas';
import { useGameStore } from '@/stores/gameStore';

export const PlayerInput = () => {
  const addPlayer = useGameStore((state) => state.addPlayer);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddPlayerInput>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: {
      priority: false,
    },
  });

  const onSubmit = (data: AddPlayerInput) => {
    // data is fully typed!
    addPlayer({
      id: crypto.randomUUID(),
      name: data.name,
      priority: data.priority,
      timestamp: new Date(),
    });
    reset(); // Clear form after submission
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
        {errors.name && (
          <span id="name-error" role="alert">
            {errors.name.message}
          </span>
        )}
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

### With Custom FormField Component

```typescript
// components/components/FormField.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
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
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={errorId}
          {...props}
        />
        {error && (
          <span id={errorId} className={styles.error} role="alert">
            {error.message}
          </span>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';
```

### Using FormField Component

```typescript
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<AddPlayerInput>({
  resolver: zodResolver(addPlayerSchema),
});

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <FormField
      label="Player Name"
      {...register("name")}
      error={errors.name}
    />
    <button type="submit">Add Player</button>
  </form>
);
```

## Advanced Patterns

### Conditional Validation

```typescript
const formSchema = z.object({
  hasEmail: z.boolean(),
  email: z.string().optional(),
}).refine((data) => {
  if (data.hasEmail && !data.email) {
    return false;
  }
  return true;
}, {
  message: "Email is required when checkbox is checked",
  path: ["email"], // Error will be on email field
});
```

### Async Validation

```typescript
const schema = z.object({
  username: z.string().refine(
    async (username) => {
      const exists = await checkUsernameExists(username);
      return !exists;
    },
    { message: "Username already taken" }
  ),
});
```

### Custom Error Messages

```typescript
const playerSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be text",
  })
    .min(1, "Name cannot be empty")
    .max(50, "Name is too long (max 50 characters)"),
});
```

## Integration with State Management

```typescript
// Connect form to Zustand store
const addPlayer = useGameStore((state) => state.addPlayer);

const onSubmit = (data: AddPlayerInput) => {
  addPlayer({
    id: crypto.randomUUID(),
    name: data.name,
    priority: data.priority,
    timestamp: new Date(),
  });
};
```

## Best Practices

1. **Define Schemas First**: Create schemas before implementing forms
2. **Reuse Schemas**: Share schemas between frontend and backend when possible
3. **Accessible Forms**: Always include `aria-invalid` and `aria-describedby`
4. **Error Display**: Show errors clearly and next to fields
5. **Type Safety**: Use `z.infer<typeof schema>` for types, don't duplicate
6. **Default Values**: Provide sensible defaults in `defaultValues`

## File Organization

```
src/
├── schemas/
│   ├── playerSchemas.ts    # Player-related schemas
│   ├── teamSchemas.ts      # Team-related schemas
│   └── index.ts            # Export all schemas
├── components/
│   ├── components/
│   │   └── FormField/      # Reusable form field component
│   └── sections/
│       └── PlayerInput/    # Form sections
```

## Related Files

- `adr/frontend/01-frontend-architecture/forms-analysis.md` - Full analysis
- `adr/frontend/01-frontend-architecture/final-decisions.md` - Decision summary

## Installation

```bash
npm install react-hook-form zod @hookform/resolvers
```

## Common Patterns

### Reset Form After Success

```typescript
const { reset } = useForm();

const onSubmit = async (data) => {
  await submitData(data);
  reset(); // Clear form
};
```

### Watch Field Values

```typescript
const { watch } = useForm();
const priority = watch("priority"); // Watch specific field

// Use watched value in UI
{priority && <div>Priority player benefits...</div>}
```

### Set Field Values Programmatically

```typescript
const { setValue } = useForm();

// Set value when needed
setValue("name", "John Doe");
```
