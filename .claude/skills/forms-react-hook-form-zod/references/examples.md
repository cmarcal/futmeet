# Form Examples

## Full accessible form

```typescript
export const PlayerInput = () => {
  const addPlayer = useGameStore((state) => state.addPlayer);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AddPlayerInput>({
    resolver: zodResolver(addPlayerSchema),
    defaultValues: { priority: false },
  });

  const handleFormSubmit = (data: AddPlayerInput) => {
    addPlayer({ id: crypto.randomUUID(), name: data.name, priority: data.priority, timestamp: new Date() });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div>
        <label htmlFor="name">Player Name</label>
        <input
          id="name"
          {...register('name')}
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && <span id="name-error" role="alert">{errors.name.message}</span>}
      </div>
      <label>
        <input type="checkbox" {...register('priority')} />
        Priority Player
      </label>
      <button type="submit">Add Player</button>
    </form>
  );
};
```

## Team settings schema

```typescript
export const teamSettingsSchema = z.object({
  teamCount: z.number().int('Must be a whole number').min(2, 'Need at least 2 teams').max(10, 'Maximum 10 teams'),
});
export type TeamSettingsInput = z.infer<typeof teamSettingsSchema>;
```

## Reusable FormField

```typescript
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
          aria-invalid={error ? 'true' : 'false'}
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

## Conditional validation

```typescript
const formSchema = z.object({
  hasEmail: z.boolean(),
  email: z.string().optional(),
}).refine((data) => !data.hasEmail || !!data.email, {
  message: 'Email is required when checkbox is checked',
  path: ['email'],
});
```

## Custom error messages

```typescript
const playerSchema = z.object({
  name: z.string({
    required_error: 'Name is required',
    invalid_type_error: 'Name must be text',
  }).min(1, 'Name cannot be empty').max(50, 'Name is too long (max 50 characters)'),
});
```

## Common hooks

```typescript
const { reset, watch, setValue } = useForm();
reset();
const priority = watch('priority');
setValue('name', 'John Doe');
```
