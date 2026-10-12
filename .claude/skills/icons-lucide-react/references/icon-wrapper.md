# Icon Wrapper Component

```typescript
// components/base-elements/Icon/Icon.tsx
import { LucideIcon } from 'lucide-react';

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  ariaLabel?: string;
}

export const Icon = ({ icon: IconComponent, size = 20, className, ariaLabel }: IconProps) => (
  <IconComponent
    size={size}
    className={className}
    aria-label={ariaLabel}
    aria-hidden={!ariaLabel}
  />
);

// <Icon icon={Plus} size={16} className={styles.icon} />
```

## Icon with text label

```typescript
<div className={styles.label}>
  <User size={16} className={styles.icon} aria-hidden="true" />
  <span>{name}</span>
</div>
```
