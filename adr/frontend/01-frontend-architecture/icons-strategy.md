# Icon System Strategy

## Overview
Icon system strategy using Lucide React for the FutMeet MVP.

---

## Decision: Lucide React

### What is Lucide React?
Modern icon library with 1000+ icons. Tree-shakeable, TypeScript-first, and designed for React.

### Why Lucide React?

**Benefits ✅**
- **Tree-Shakeable**: Only imports icons you use (Vite optimizes)
- **TypeScript**: Full TypeScript support with autocomplete
- **Consistent Design**: All icons share same stroke width and style
- **Lightweight**: SVG-based, no font files
- **Active Maintenance**: Regularly updated with new icons
- **Customizable**: Easy to style with CSS

**Comparison:**
| Feature | Lucide React | React Icons | Material Icons |
|---------|--------------|-------------|----------------|
| Tree-shakeable | ✅ | ⚠️ (per set) | ❌ |
| TypeScript | ✅ Excellent | ✅ Good | ✅ Good |
| Bundle Size | ✅ Small | ⚠️ Large | ⚠️ Large |
| Modern Design | ✅ | ⚠️ Varies | ✅ |
| Consistency | ✅ | ❌ | ✅ |

---

## Installation

```bash
npm install lucide-react
```

---

## Usage

### Basic Usage
```typescript
import { User, Plus, Trash2, Settings } from 'lucide-react';

function PlayerCard() {
  return (
    <div>
      <User size={24} />
      <span>Player Name</span>
      <button>
        <Trash2 size={16} />
      </button>
    </div>
  );
}
```

### With Button Component
```typescript
import { Plus } from 'lucide-react';
import { Button } from '@/components/base-elements/Button';

function AddPlayerButton() {
  return (
    <Button>
      <Plus size={16} aria-hidden="true" />
      <span>Add Player</span>
    </Button>
  );
}
```

### Styling Icons
```css
/* Icon inherits color from parent */
.button svg {
  color: var(--md-sys-color-on-primary);
}

/* Custom size and color */
.icon-large {
  width: 32px;
  height: 32px;
  color: var(--md-sys-color-primary);
}
```

### Accessibility
```typescript
// Icons are decorative (hidden from screen readers)
<Plus size={16} aria-hidden="true" />

// Or provide label if icon is standalone button
<button aria-label="Add player">
  <Plus size={16} />
</button>
```

---

## Icon Component Wrapper (Optional)

Create a wrapper component for consistent styling:

```typescript
// components/base-elements/Icon/Icon.tsx
import { LucideIcon } from 'lucide-react';
import styles from './Icon.module.css';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
}

export function Icon({ 
  icon: IconComponent, 
  size = 24, 
  className,
  ...props 
}: IconProps) {
  return (
    <IconComponent 
      size={size} 
      className={`${styles.icon} ${className || ''}`}
      {...props}
    />
  );
}
```

**Usage:**
```typescript
import { Icon } from '@/components/base-elements/Icon';
import { User, Plus } from 'lucide-react';

<Icon icon={User} size={24} aria-label="User profile" />
<Icon icon={Plus} size={16} aria-hidden="true" />
```

---

## Common Icons for Project

```typescript
// Commonly used icons
import {
  User,           // Player/User icon
  Users,          // Multiple players
  Plus,           // Add
  Trash2,         // Delete
  Edit,           // Edit
  Check,          // Confirm/Check
  X,              // Close/Cancel
  Settings,       // Settings
  Trophy,         // Teams/Results
  Star,           // Priority
  Search,         // Search
  Filter,         // Filter
  ArrowLeft,      // Navigation
  ArrowRight,     // Navigation
  Home,           // Home/Navigation
} from 'lucide-react';
```

---

## Integration with Design Tokens

### Icon Sizes
```typescript
// Use design token spacing for icon sizes
import { useDesignTokens } from '@/tokens';

const iconSizes = {
  small: 16,   // var(--md-sys-spacing-sm * 2)
  medium: 24,  // var(--md-sys-spacing-md * 1.5)
  large: 32,   // var(--md-sys-spacing-lg * 1.33)
};
```

### Icon Colors
```css
/* Icons inherit colors from design tokens */
.icon {
  color: var(--md-sys-color-on-surface);
}

.icon-primary {
  color: var(--md-sys-color-primary);
}

.icon-error {
  color: var(--md-sys-color-error);
}
```

---

## Best Practices

### 1. **Tree-Shaking**
```typescript
// ✅ Good: Import individual icons
import { User, Plus } from 'lucide-react';

// ❌ Bad: Import entire library
import * as LucideIcons from 'lucide-react';
```

### 2. **Consistent Sizing**
```typescript
// Define standard sizes
const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

<User size={ICON_SIZES.md} />
```

### 3. **Accessibility**
```typescript
// Always provide aria-label for icon-only buttons
<button aria-label="Delete player">
  <Trash2 size={16} />
</button>

// Or hide decorative icons
<div>
  <Plus size={16} aria-hidden="true" />
  <span>Add Player</span>
</div>
```

### 4. **Styling**
```typescript
// Use CSS classes for styling, not inline styles
<User size={24} className={styles.playerIcon} />

// Icons inherit color from parent
<button className={styles.button}>
  <Plus size={16} /> {/* Inherits button color */}
</button>
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Install `lucide-react`
- [ ] Create Icon component wrapper (optional)
- [ ] Define standard icon sizes
- [ ] Document common icons for project

### Phase 2: Integration
- [ ] Integrate icons in base elements (Button, etc.)
- [ ] Use icons in components (PlayerCard, etc.)
- [ ] Ensure accessibility (aria-labels)

### Phase 3: Enhancement
- [ ] Custom icon styling with design tokens
- [ ] Icon animation (if needed)
- [ ] Icon documentation/catalog

---

## Decision Summary

✅ **Use Lucide React for Icons**

**Benefits:**
- Tree-shakeable, TypeScript-first
- Consistent design
- Lightweight and modern
- Excellent developer experience

**Usage:**
- Import individual icons as needed
- Use with aria-labels for accessibility
- Style with CSS classes and design tokens

---

## References

- [Lucide Icons Documentation](https://lucide.dev/)
- [Lucide React on npm](https://www.npmjs.com/package/lucide-react)
- [Icon Gallery](https://lucide.dev/icons/)

---

**Status**: ✅ **Strategy Defined**  
**Next Steps**: Install and integrate in Phase 1 foundation setup
