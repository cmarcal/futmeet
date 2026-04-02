---
name: icons-lucide-react
description: Use when adding icons to buttons or UI elements, choosing icon names, styling icons with design tokens, or ensuring icon accessibility (aria-label, aria-hidden).
---

# Icons with Lucide React

Lucide React is the only icon library in this project. It is tree-shakeable and TypeScript-first.

Install: `npm install lucide-react`

## Basic Usage

```typescript
import { Plus, Trash2, User, Edit } from 'lucide-react';

// Standard sizes
<Plus size={16} />   // Small (buttons, inline)
<Plus size={20} />   // Medium (default)
<Plus size={24} />   // Large (headers, prominent)
```

## Usage Patterns

### Icon in Button (with text)

```typescript
<button className={styles.button}>
  <Plus size={16} aria-hidden="true" />
  <span>Add Player</span>
</button>
```

### Icon-Only Button (requires aria-label)

```typescript
<button
  className={styles.iconButton}
  onClick={onClick}
  aria-label="Delete player"
  type="button"
>
  <Trash2 size={16} aria-hidden="true" />
</button>
```

### Icon with Text Label

```typescript
<div className={styles.label}>
  <User size={16} className={styles.icon} aria-hidden="true" />
  <span>{name}</span>
</div>
```

## Styling

```typescript
// With CSS class
<Plus size={16} className={styles.icon} />
```

```css
.icon {
  color: var(--color-on-primary);
  transition: color 0.2s;
}

.button:hover .icon {
  color: var(--color-primary-light);
}
```

Icons inherit the parent element's `color` by default — leverage this instead of setting color inline.

## Project Icon Reference

### Player Management
- `User` — player/user
- `Plus` — add player
- `Trash2` — remove/delete
- `Edit` — edit player
- `Check` — confirm
- `X` — cancel/close

### Priority/Sorting
- `Star` — priority player
- `Shuffle` — sort/shuffle teams
- `ArrowUp` / `ArrowDown` — reorder

### Navigation
- `Home` — home page
- `List` — player list
- `Users` — teams
- `Settings` — settings

### Status
- `CheckCircle` — success
- `AlertCircle` — warning
- `XCircle` — error

## Optional Icon Wrapper Component

```typescript
// components/base-elements/Icon/Icon.tsx
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export function Icon({ icon: IconComponent, size = 20, className, ariaLabel }: IconProps) {
  return (
    <IconComponent
      size={size}
      className={className}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  );
}

// <Icon icon={Plus} size={16} className={styles.icon} />
```

## Accessibility Rules

- Icon-only buttons: always add `aria-label` to the button, `aria-hidden="true"` to the icon
- Icon + text: add `aria-hidden="true"` to the icon — the text is sufficient for screen readers
- Decorative icons: always `aria-hidden="true"`
- Never put `aria-label` on the icon itself when it's inside a labeled button
