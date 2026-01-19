# Atomic Design + CSS Modules Strategy

## Overview
Using CSS Modules with Atomic Design pattern for styling and component organization.

---

## Atomic Design Methodology

### What It Is
A methodology for creating design systems with a hierarchy of components, from smallest (atoms) to largest (pages).

### The Five Levels

```
┌─────────────────────────────────────┐
│          Pages (Templates)          │  ← Complete page layouts
├─────────────────────────────────────┤
│         Organisms (Sections)        │  ← Complex UI sections
├─────────────────────────────────────┤
│         Molecules (Components)      │  ← Simple component groups
├─────────────────────────────────────┤
│         Atoms (Base Elements)       │  ← Basic building blocks
└─────────────────────────────────────┘
```

---

## Component Hierarchy for Your Project

### Atoms (Base Components)
**Smallest, reusable UI elements**

```
components/base-elements/
├── Button/
│   ├── Button.tsx
│   ├── Button.module.css
│   └── index.ts
├── Input/
│   ├── Input.tsx
│   ├── Input.module.css
│   └── index.ts
├── Text/
│   ├── Text.tsx (heading, paragraph, span variants)
│   ├── Text.module.css
│   └── index.ts
├── Badge/
│   ├── Badge.tsx
│   ├── Badge.module.css
│   └── index.ts
├── Alert/
│   ├── Alert.tsx
│   ├── Alert.module.css
│   └── index.ts
└── Icon/
    ├── Icon.tsx
    ├── Icon.module.css
    └── index.ts
```

**Examples:**
- `<Button variant="primary">Add Player</Button>`
- `<Text as="h1" size="large">Players</Text>`
- `<Badge color="priority">Priority</Badge>`

### Molecules (Component Groups)
**Simple combinations of atoms**

```
components/components/
├── PlayerCard/
│   ├── PlayerCard.tsx
│   ├── PlayerCard.module.css
│   └── index.ts
├── FormField/
│   ├── FormField.tsx (Input + Label + Error message)
│   ├── FormField.module.css
│   └── index.ts
├── AlertBanner/
│   ├── AlertBanner.tsx (Alert + Icon)
│   ├── AlertBanner.module.css
│   └── index.ts
└── SearchBox/
    ├── SearchBox.tsx (Input + Icon button)
    ├── SearchBox.module.css
    └── index.ts
```

**Examples:**
- `<PlayerCard player={player} onRemove={handleRemove} />`
- `<FormField label="Name" error={errors.name} {...register('name')} />`

### Organisms (Complex Sections)
**Distinct sections of the interface**

```
components/sections/
├── PlayerList/
│   ├── PlayerList.tsx
│   ├── PlayerList.module.css
│   └── index.ts
├── PlayerInput/
│   ├── PlayerInput.tsx (Form with FormField molecules)
│   ├── PlayerInput.module.css
│   └── index.ts
├── PriorityManager/
│   ├── PriorityManager.tsx
│   ├── PriorityManager.module.css
│   └── index.ts
├── TeamSettings/
│   ├── TeamSettings.tsx
│   ├── TeamSettings.module.css
│   └── index.ts
└── TeamResults/
    ├── TeamResults.tsx (Multiple TeamCard organisms)
    ├── TeamResults.module.css
    └── index.ts
```

**Examples:**
- `<PlayerList players={players} onPriorityToggle={handleToggle} />`
- `<TeamResults teams={teams} />`

### Templates (Page Layouts)
**Page-level structures**

```
components/templates/
├── GameLayout/
│   ├── GameLayout.tsx
│   ├── GameLayout.module.css
│   └── index.ts
└── ResultsLayout/
    ├── ResultsLayout.tsx
    ├── ResultsLayout.module.css
    └── index.ts
```

### Pages
**Specific page implementations**

```
pages/
├── HomePage.tsx
├── GamePage.tsx
└── ResultsPage.tsx
```

---

## CSS Modules Integration

### Why CSS Modules?
- ✅ **Scoped Styles**: No class name collisions
- ✅ **TypeScript Support**: Import CSS as modules with type safety
- ✅ **Maintainable**: Styles co-located with components
- ✅ **Performance**: Only loads styles for used components
- ✅ **No Runtime**: Compiled at build time (unlike styled-components)

### File Naming Convention
```
ComponentName.tsx
ComponentName.module.css    ← CSS Modules file
```

### Example Implementation

#### Atom: Button
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
  background-color: #2E7D32; /* Football green */
  color: white;
}

.primary:hover {
  background-color: #1B5E20;
}

.secondary {
  background-color: #f5f5f5;
  color: #333;
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

#### Molecule: FormField
```typescript
// components/components/FormField/FormField.tsx
import { Input } from '../../base-elements/Input';
import { Text } from '../../base-elements/Text';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormField({ 
  label, 
  error, 
  required,
  children 
}: FormFieldProps & { children: React.ReactNode }) {
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

#### Section: PlayerList
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

---

## Project Structure

### Recommended Folder Structure
```
src/
├── components/
│   ├── base-elements/
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Text/
│   │   ├── Badge/
│   │   └── Alert/
│   ├── components/
│   │   ├── PlayerCard/
│   │   ├── FormField/
│   │   └── AlertBanner/
│   ├── sections/
│   │   ├── PlayerList/
│   │   ├── PlayerInput/
│   │   ├── PriorityManager/
│   │   └── TeamResults/
│   └── templates/
│       └── GameLayout/
├── styles/
│   ├── global.css          # Global styles, resets
│   ├── variables.css       # CSS variables (colors, spacing)
│   └── utilities.css       # Utility classes (if needed)
└── pages/
    ├── HomePage.tsx
    └── GamePage.tsx
```

---

## Design Tokens

**Note**: We use a Material Design 3-inspired design token system. See `design-tokens-strategy.md` for full documentation.

### Token Structure

Design tokens follow a three-tier hierarchy:
- **Core Tokens** (`md.ref.*`) - Base values (raw colors, sizes)
- **Semantic Tokens** (`md.sys.*`) - Usage-specific (what it means)
- **Component Tokens** (`md.comp.*`) - Component-specific overrides

### CSS Variables (Generated from Tokens)
```css
/* styles/tokens.css - Generated from tokens.json */
:root {
  /* Semantic Color Tokens */
  --md-sys-color-primary: #2E7D32;
  --md-sys-color-on-primary: #FFFFFF;
  --md-sys-color-primary-container: #C8E6C9;
  --md-sys-color-accent: #FF6B35;
  --md-sys-color-priority: #FFC107;
  --md-sys-color-error: #D32F2F;
  --md-sys-color-success: #388E3C;
  --md-sys-color-background: #FFFFFF;
  --md-sys-color-on-background: #1C1B1F;
  --md-sys-color-surface: #FFFFFF;
  --md-sys-color-on-surface: #1C1B1F;
  
  /* Semantic Spacing Tokens */
  --md-sys-spacing-xs: 4px;
  --md-sys-spacing-sm: 8px;
  --md-sys-spacing-md: 16px;
  --md-sys-spacing-lg: 24px;
  --md-sys-spacing-xl: 32px;
  
  /* Semantic Typography Tokens */
  --md-sys-typography-headline-large-font-family: 'Poppins', sans-serif;
  --md-sys-typography-title-medium-font-family: 'Poppins', sans-serif;
  --md-sys-typography-body-large-font-family: 'Inter', sans-serif;
  
  /* Semantic Shape Tokens */
  --md-sys-shape-corner-sm: 4px;
  --md-sys-shape-corner-md: 8px;
  --md-sys-shape-corner-lg: 12px;
}

/* Use in CSS Modules */
.button {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
  padding: var(--md-sys-spacing-sm) var(--md-sys-spacing-md);
  border-radius: var(--md-sys-shape-corner-md);
}
```

**See `design-tokens-strategy.md` for complete token system documentation.**

---

## Benefits of This Approach

### 1. Reusability
- Atoms can be used anywhere
- Consistent design across app
- Easy to maintain

### 2. Scalability
- Clear organization
- Easy to find components
- Scales with team size

### 3. Maintainability
- Styles co-located with components
- Changes isolated to one component
- Type-safe CSS (with TypeScript)

### 4. Performance
- CSS Modules compile to unique class names
- Tree-shaking removes unused styles
- No runtime CSS-in-JS overhead

---

## Implementation Checklist

### Phase 1: Base Elements
- [ ] Create `base-elements/Button` component
- [ ] Create `base-elements/Input` component
- [ ] Create `base-elements/Text` component
- [ ] Create `base-elements/Badge` component
- [ ] Create `base-elements/Alert` component
- [ ] Set up design tokens structure (`tokens/tokens.json`)
- [ ] Generate CSS variables from tokens (`styles/tokens.css`)

### Phase 2: Components
- [ ] Create `components/FormField` component
- [ ] Create `components/PlayerCard` component
- [ ] Create `components/AlertBanner` component

### Phase 3: Sections
- [ ] Create `sections/PlayerList` component
- [ ] Create `sections/PlayerInput` component
- [ ] Create `sections/TeamResults` component

### Phase 4: Documentation
- [ ] Document component props
- [ ] Create Storybook (optional, future)
- [ ] Add usage examples

---

## Decision Summary

✅ **Use Atomic Design + CSS Modules**

**Benefits:**
- Clear component hierarchy
- Reusable, maintainable code
- Type-safe styling with CSS Modules
- Scales well as project grows
- Easy onboarding for new developers

**Structure:**
- Templates → Sections → Components → Base Elements
- CSS Modules for scoped styling
- CSS Variables for design system
- Co-located styles with components
