---
name: icons-lucide-react
description: Use Lucide React for icons throughout the project. This skill guides icon usage, styling, and accessibility following the project's icon strategy.
---

# Icons with Lucide React

When adding icons to this project, use Lucide React. This provides tree-shakeable, TypeScript-first icons with consistent design.

## When to Use This Skill

- Adding icons to buttons and UI elements
- Choosing appropriate icons for actions
- Styling icons with design tokens
- Ensuring icon accessibility

## Key Principles

1. **Lucide React** is the only icon library used
2. **Tree-shakeable**: Only imports used icons
3. **TypeScript-first**: Full TypeScript support
4. **Accessible**: Always include aria-labels for icon-only buttons
5. **Consistent**: Use standard sizes and styling

## Installation

```bash
npm install lucide-react
```

## Basic Usage

### Import Individual Icons

```typescript
import { Plus, Trash2, User, Edit } from 'lucide-react';

function Button() {
  return (
    <button>
      <Plus size={16} />
      Add Player
    </button>
  );
}
```

### Icon Sizes

```typescript
// Standard sizes
<Plus size={16} />   // Small (buttons, inline)
<Plus size={20} />   // Medium (default)
<Plus size={24} />   // Large (headers, prominent)
```

## Usage Patterns

### Icon in Button

```typescript
import { Plus } from 'lucide-react';
import styles from './Button.module.css';

function AddButton() {
  return (
    <button className={styles.button}>
      <Plus size={16} aria-hidden="true" />
      <span>Add Player</span>
    </button>
  );
}
```

### Icon-Only Button (Requires aria-label)

```typescript
import { Trash2 } from 'lucide-react';
import styles from './IconButton.module.css';

function DeleteButton({ onClick, label = "Delete" }: IconButtonProps) {
  return (
    <button
      className={styles.iconButton}
      onClick={onClick}
      aria-label={label}
      type="button"
    >
      <Trash2 size={16} aria-hidden="true" />
    </button>
  );
}
```

### Icon with Text

```typescript
import { User } from 'lucide-react';

function PlayerLabel({ name }: { name: string }) {
  return (
    <div className={styles.label}>
      <User size={16} className={styles.icon} aria-hidden="true" />
      <span>{name}</span>
    </div>
  );
}
```

## Styling Icons

### With CSS Classes

```typescript
import { Plus } from 'lucide-react';
import styles from './Button.module.css';

<Plus size={16} className={styles.icon} />
```

```css
/* Button.module.css */
.icon {
  color: var(--color-on-primary);
  transition: color 0.2s;
}

.button:hover .icon {
  color: var(--color-primary-light);
}
```

### With Design Tokens

```typescript
import { Badge } from 'lucide-react';

<Badge 
  size={16} 
  className={styles.badgeIcon}
  style={{ color: 'var(--color-priority)' }}
/>
```

### Color Inheritance

```typescript
// Icon inherits parent color
<button className={styles.button}>
  <Plus size={16} /> {/* Inherits button color */}
</button>
```

## Common Icons for Project

### Player Management
- `User` - Player/user icon
- `Plus` - Add player
- `Trash2` - Remove/delete player
- `Edit` - Edit player
- `Check` - Confirm/complete
- `X` - Cancel/close

### Priority/Sorting
- `Star` - Priority player
- `Shuffle` - Sort/shuffle teams
- `ArrowUp` - Move up
- `ArrowDown` - Move down

### Navigation
- `Home` - Home page
- `List` - Player list
- `Users` - Teams
- `Settings` - Settings

### Status
- `CheckCircle` - Success/completed
- `AlertCircle` - Warning/alert
- `XCircle` - Error/failed

## Accessibility

### Icon-Only Buttons Must Have aria-label

```typescript
// ✅ Good
<button aria-label="Delete player">
  <Trash2 size={16} aria-hidden="true" />
</button>

// ❌ Bad - screen readers can't determine purpose
<button>
  <Trash2 size={16} />
</button>
```

### Icons with Text - Use aria-hidden

```typescript
// ✅ Good - hide icon from screen readers (text is sufficient)
<button>
  <Plus size={16} aria-hidden="true" />
  <span>Add Player</span>
</button>
```

### Decorative Icons

```typescript
// Decorative icons that don't add meaning
<div>
  <User size={24} aria-hidden="true" />
  <p>Player Profile</p>
</div>
```

## Best Practices

1. **Import Only What You Need**: Tree-shaking removes unused icons
2. **Consistent Sizing**: Use standard sizes (16, 20, 24)
3. **Accessibility**: Always include aria-labels for icon-only buttons
4. **Style with CSS**: Use CSS classes or design tokens, not inline styles
5. **Semantic Icons**: Choose icons that clearly represent the action

## Icon Component Wrapper (Optional)

```typescript
// components/base-elements/Icon/Icon.tsx (optional wrapper)
import { LucideIcon } from 'lucide-react';
import styles from './Icon.module.css';

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

// Usage
<Icon icon={Plus} size={16} className={styles.icon} />
```

## Related Files

- `adr/frontend/01-frontend-architecture/icons-strategy.md` - Full icon strategy
- `adr/frontend/01-frontend-architecture/final-decisions.md` - Icon decision

## Reference

- [Lucide Icons Documentation](https://lucide.dev/)
- [Icon Gallery](https://lucide.dev/icons/)
- [Lucide React on npm](https://www.npmjs.com/package/lucide-react)
