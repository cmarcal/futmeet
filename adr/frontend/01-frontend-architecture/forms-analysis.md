# Form Handling Analysis: React Hook Form + Zod

## Overview
Evaluating React Hook Form + Zod for form validation and handling in the FutMeet MVP.

---

## React Hook Form

### What It Is
Performant, flexible, and extensible library for building forms in React with minimal re-renders.

### Key Features
- **Performance**: Uncontrolled components, less re-renders
- **Validation**: Supports multiple validation libraries (Yup, Zod, Joi, custom)
- **DX (Developer Experience)**: Easy to use API, great TypeScript support
- **Bundle Size**: ~9KB minified + gzipped
- **No Dependencies**: Works with or without validation library

### Pros ✅
- **Minimal Re-renders**: Only validates/changes touched fields
- **Simple API**: `register()`, `handleSubmit()`, `watch()`, etc.
- **Flexible**: Works with any UI library
- **Accessibility**: Built-in error handling and ARIA support
- **Async Validation**: Supports server-side validation
- **File Upload**: Built-in file input handling

### Cons ❌
- **Learning Curve**: Need to understand uncontrolled components
- **Additional Package**: Adds dependency (though small)

### Basic Usage
```typescript
import { useForm } from 'react-hook-form';

function PlayerInput() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const onSubmit = (data) => {
    console.log(data); // { name: "John Doe" }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input 
        {...register("name", { required: "Name is required" })} 
      />
      {errors.name && <span>{errors.name.message}</span>}
      <button type="submit">Add Player</button>
    </form>
  );
}
```

---

## Zod

### What It Is
TypeScript-first schema validation library with static type inference.

### Key Features
- **TypeScript First**: Define schema once, get types automatically
- **Runtime Validation**: Validates data at runtime
- **Type Inference**: Types generated from schemas
- **Composable**: Build complex schemas from simple ones
- **Bundle Size**: ~14KB minified + gzipped
- **Popular**: Widely adopted in TypeScript ecosystem

### Pros ✅
- **Type Safety**: Automatic TypeScript types from schemas
- **Single Source of Truth**: Schema defines both validation and types
- **Runtime + Compile Time**: Validates data and provides types
- **Error Messages**: Customizable, user-friendly error messages
- **Composable**: Easy to combine and extend schemas

### Cons ❌
- **Bundle Size**: Larger than some alternatives (~14KB)
- **Learning Curve**: Need to learn Zod's schema API

### Basic Usage
```typescript
import { z } from 'zod';

// Define schema
const playerSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  email: z.string().email("Invalid email").optional(),
});

// Get TypeScript type from schema
type Player = z.infer<typeof playerSchema>;

// Validate at runtime
const result = playerSchema.safeParse({ name: "John" });
if (result.success) {
  console.log(result.data); // TypeScript knows the type
} else {
  console.log(result.error.issues); // Validation errors
}
```

---

## React Hook Form + Zod Integration

### Why They Work Well Together
1. **Type Safety**: Zod schemas generate types for React Hook Form
2. **Validation**: Zod validates form data via resolver
3. **Error Handling**: React Hook Form displays Zod validation errors
4. **DX**: Best developer experience with both libraries

### Integration Setup
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const playerFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  priority: z.boolean().default(false),
});

type PlayerFormData = z.infer<typeof playerFormSchema>;

function PlayerInput() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerFormSchema), // Connect Zod to RHF
  });

  const onSubmit = (data: PlayerFormData) => {
    // data is fully typed!
    addPlayer(data.name, data.priority);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <input type="checkbox" {...register("priority")} />
      
      <button type="submit">Add Player</button>
    </form>
  );
}
```

### Installation
```bash
npm install react-hook-form zod @hookform/resolvers
```

---

## Alternatives Comparison

### Alternative 1: Formik + Yup
- **Formik**: Popular but older, more re-renders than React Hook Form
- **Yup**: Similar to Zod but JavaScript-first (not TypeScript-first)
- **Verdict**: React Hook Form is more performant; Zod has better TS support

### Alternative 2: Native HTML5 Validation
- **Pros**: No dependencies, works everywhere
- **Cons**: Limited validation rules, no TypeScript integration, inconsistent browser behavior
- **Verdict**: Not sufficient for production apps

### Alternative 3: React Final Form
- **Pros**: Similar features to React Hook Form
- **Cons**: Less popular, smaller community, fewer resources
- **Verdict**: React Hook Form is more widely adopted

---

## For Your Project

### Use Cases in FutMeet
1. **Add Player Form**: Name input, optional priority checkbox
2. **Team Settings**: Number of teams input (validation: 2-10)
3. **Edit Player**: Modify player name
4. **Game Configuration**: Settings for sorting algorithm (future)

### Recommendation: **React Hook Form + Zod** ✅

**Why:**
- ✅ Type safety with TypeScript (your chosen stack)
- ✅ Excellent performance (important for mobile users)
- ✅ Great developer experience
- ✅ Validation + types from single schema
- ✅ Easy to add more complex validation later

### Example for Your Use Case
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

export type AddPlayerInput = z.infer<typeof addPlayerSchema>;
export type TeamSettingsInput = z.infer<typeof teamSettingsSchema>;
```

---

## Decision Summary

| Criteria | React Hook Form + Zod | Alternative |
|----------|----------------------|-------------|
| **Type Safety** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **DX** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Bundle Size** | ~23KB total | Varies |
| **Community** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

**Decision**: ✅ **Use React Hook Form + Zod**

---

## Implementation Checklist

- [ ] Install: `react-hook-form zod @hookform/resolvers`
- [ ] Create schema files in `src/schemas/`
- [ ] Set up form components with `useForm` + `zodResolver`
- [ ] Create reusable form field components (aligned with atomic design)
- [ ] Add error message display components
- [ ] Test form validation edge cases
