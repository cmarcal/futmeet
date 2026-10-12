---
name: forms-react-hook-form-zod
description: Use when creating forms, defining validation schemas, or handling form errors in the web app.
---

# Forms with React Hook Form + Zod

Zod schemas are the single source of truth for validation and TypeScript types.

## Rules

- Define schemas in `src/schemas/` before writing the form component
- Derive types with `z.infer<typeof schema>`; never write a duplicate type
- Wire forms with `useForm` + `zodResolver(schema)`
- Provide `defaultValues` to avoid controlled/uncontrolled warnings
- Every input carries `aria-invalid` and `aria-describedby` pointing at an error element with `role="alert"` (see `accessibility-wcag`)
- Call `reset()` after a successful submit
- Reuse the `FormField` component for labelled inputs with errors

## Schema

```typescript
// schemas/playerSchemas.ts
export const addPlayerSchema = z.object({
  name: z.string().min(1, 'Player name is required').max(50, 'Name is too long').trim(),
  priority: z.boolean().default(false),
});

export type AddPlayerInput = z.infer<typeof addPlayerSchema>;
```

## Form

```typescript
const { register, handleSubmit, formState: { errors }, reset } = useForm<AddPlayerInput>({
  resolver: zodResolver(addPlayerSchema),
  defaultValues: { priority: false },
});

const handleFormSubmit = (data: AddPlayerInput) => {
  addPlayer({ id: crypto.randomUUID(), ...data, timestamp: new Date() });
  reset();
};
```

```typescript
<form onSubmit={handleSubmit(handleFormSubmit)}>
  <FormField label="Player Name" {...register('name')} error={errors.name} />
  <button type="submit">Add Player</button>
</form>
```

## File Organization

```
src/schemas/{playerSchemas,teamSchemas,index}.ts
src/components/FormField/
```

## References

Read `references/examples.md` for the full accessible form, the `FormField` implementation, conditional validation, custom messages and common hooks (`watch`, `setValue`). Error UI components: `error-handling-strategy` skill.
