---
name: component-architecture-css-modules
description: Use Atomic Design pattern with CSS Modules for component organization and styling. This skill guides creating components following the project's component hierarchy.
---

# Component Architecture with CSS Modules

When creating components in this project, follow the Atomic Design pattern with CSS Modules. This provides a clear component hierarchy, reusable base elements, and scoped styling.

## When to Use This Skill

- Creating new components
- Organizing component structure
- Styling components with CSS Modules
- Understanding component hierarchy
- Following the project's component architecture

## Component Hierarchy

### Atomic Design Pattern

```
┌─────────────────────────────────────┐
│    Templates (Page Layouts)         │  ← Complete page structures
├─────────────────────────────────────┤
│    Sections (Complex UI Sections)   │  ← Distinct interface sections
├─────────────────────────────────────┤
│    Components (Component Groups)    │  ← Simple component combinations
├─────────────────────────────────────┤
│    Base Elements (Basic Building Blocks)│ ← Smallest reusable elements
└─────────────────────────────────────┘
```

## Directory Structure

```
src/components/
├── base-elements/      # Atoms - Button, Input, Text, Badge, Alert, Icon
├── components/          # Molecules - PlayerCard, FormField, AlertBanner
├── sections/            # Organisms - PlayerList, PlayerInput, TeamResults
└── templates/           # Page Layouts - GameLayout, ResultsLayout
```

## Base Elements (Atoms)

**Smallest, reusable UI elements**

Location: `components/base-elements/`

Examples: Button, Input, Text, Badge, Alert, Icon

### Example: Button Component

```typescript
// components/base-elements/Button/Button.tsx
import styles from './Button.module.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
}

export function Button({ 
  variant = 'primary', 
  size = 'medium', 
  className,
  children,
  ...props 
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    styles[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
```

```css
/* components/base-elements/Button/Button.module.css */
.button {
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.primary {
  background-color: var(--color-primary);
  color: var(--color-on-primary);
}

.secondary {
  background-color: var(--color-secondary);
  color: var(--color-on-secondary);
}

.small {
  padding: 4px 12px;
  font-size: 14px;
}

.medium {
  padding: 8px 16px;
  font-size: 16px;
}

.large {
  padding: 12px 24px;
  font-size: 18px;
}
```

## Components (Molecules)

**Simple combinations of atoms**

Location: `components/components/`

Examples: FormField, PlayerCard, AlertBanner

### Example: FormField Component

```typescript
// components/components/FormField/FormField.tsx
import { Input } from '../../base-elements/Input';
import { Text } from '../../base-elements/Text';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <label className={styles.label}>
        <Text as="span" weight="medium">{label}</Text>
        {required && <span className={styles.required}>*</span>}
      </label>
      {children}
      {error && (
        <Text as="span" className={styles.error} color="error">
          {error}
        </Text>
      )}
    </div>
  );
}
```

## Sections (Organisms)

**Distinct sections of the interface**

Location: `components/sections/`

Examples: PlayerList, PlayerInput, TeamResults

### Example: PlayerList Component

```typescript
// components/sections/PlayerList/PlayerList.tsx
import { PlayerCard } from '../../components/PlayerCard';
import styles from './PlayerList.module.css';

interface PlayerListProps {
  players: Player[];
  onPriorityToggle: (playerId: string) => void;
  onRemove: (playerId: string) => void;
}

export function PlayerList({ players, onPriorityToggle, onRemove }: PlayerListProps) {
  return (
    <div className={styles.playerList}>
      <h2 className={styles.title}>Players ({players.length})</h2>
      <ul className={styles.list}>
        {players.map((player, index) => (
          <li key={player.id}>
            <PlayerCard
              player={player}
              position={index + 1}
              onPriorityToggle={onPriorityToggle}
              onRemove={onRemove}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Templates (Page Layouts)

**Page-level structures**

Location: `components/templates/`

Examples: GameLayout, ResultsLayout

### Example: GameLayout Template

```typescript
// components/templates/GameLayout/GameLayout.tsx
import styles from './GameLayout.module.css';

interface GameLayoutProps {
  children: React.ReactNode;
}

export function GameLayout({ children }: GameLayoutProps) {
  return (
    <div className={styles.gameLayout}>
      <header className={styles.header}>
        <h1>FutMeet</h1>
      </header>
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
```

## CSS Modules Usage

### Naming Convention

```
ComponentName.tsx
ComponentName.module.css    ← CSS Modules file
index.ts                    ← Export file
```

### Importing Styles

```typescript
import styles from './Component.module.css';

// Use in className
<div className={styles.container}>
  <p className={styles.text}>Content</p>
</div>
```

### Combining Classes

```typescript
const classes = [
  styles.base,
  variant && styles[variant],
  className, // Allow external className
].filter(Boolean).join(' ');

<div className={classes} />
```

### Using CSS Variables

```css
/* Use design tokens from CSS variables */
.button {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
}
```

## Best Practices

1. **Co-locate Styles**: Place `.module.css` file next to component
2. **Use Design Tokens**: Reference CSS variables from design tokens
3. **Compose Components**: Build complex components from simpler ones
4. **Type Safety**: Use TypeScript for component props
5. **Export Pattern**: Use `index.ts` for clean imports

### Component Export Pattern

```typescript
// components/base-elements/Button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';
```

### Import Pattern

```typescript
// Import from index
import { Button } from '@/components/base-elements/Button';

// Not from .tsx file directly
// import { Button } from '@/components/base-elements/Button/Button';
```

## Component File Structure

```
ComponentName/
├── ComponentName.tsx      # Component implementation
├── ComponentName.module.css # Component styles
├── index.ts               # Exports
└── ComponentName.test.tsx # Tests (if applicable)
```

## Related Files

- `adr/frontend/01-frontend-architecture/component-architecture-css-modules.md` - Full architecture documentation
- `adr/frontend/01-frontend-architecture/design-tokens-strategy.md` - Design tokens system

## Implementation Checklist

### Phase 1: Base Elements
- [ ] Create Button component
- [ ] Create Input component
- [ ] Create Text component
- [ ] Create Badge component
- [ ] Create Alert component
- [ ] Create Icon wrapper component

### Phase 2: Components
- [ ] Create FormField component
- [ ] Create PlayerCard component
- [ ] Create AlertBanner component

### Phase 3: Sections
- [ ] Create PlayerList section
- [ ] Create PlayerInput section
- [ ] Create TeamResults section
