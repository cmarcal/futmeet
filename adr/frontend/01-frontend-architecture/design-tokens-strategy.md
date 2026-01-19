# Design Tokens Strategy

## Overview
Using a Material Design 3-inspired design token system to manage design decisions in a structured, scalable way that integrates seamlessly with CSS Modules.

---

## What are Design Tokens?

### Definition
Design tokens are design decisions stored as data. They represent the visual design atoms of a design system — colors, spacing, typography, shadows, borders, etc. — in a platform-agnostic way.

### Why Tokens Over CSS Variables?

**CSS Variables (Current Approach):**
```css
--color-primary: #2E7D32;
--spacing-md: 16px;
```

**Design Tokens (M3 Model):**
```
Core Token: md.sys.color.primary
  ↓
Semantic Token: md.sys.color.primary-container
  ↓
Component Token: md.comp.button.background-color
```

**Benefits:**
- **Semantic Structure**: Tokens represent *intent* not just values
- **Theming**: Easy light/dark mode, brand variations
- **Type Safety**: TypeScript can enforce token usage
- **Scalability**: Hierarchical organization scales better
- **Tooling**: Design tools can sync with code

---

## Material Design 3 Token Model

### Three-Tier Structure

```
┌─────────────────────────────────────────────┐
│  Core Tokens                                │  Base values (raw colors, sizes)
│  - md.ref.palette                           │
│  - md.ref.typeface                          │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Semantic/System Tokens                     │  Usage-specific (what it means)
│  - md.sys.color                             │
│  - md.sys.typography                        │
│  - md.sys.shape                             │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Component Tokens                           │  Component-specific (overrides)
│  - md.comp.button                           │
│  - md.comp.card                             │
└─────────────────────────────────────────────┘
```

---

## Token Structure for FutMeet

### 1. Core Tokens (Foundation)

**Base values that everything builds on:**

```json
{
  "md": {
    "ref": {
      "palette": {
        "primary": {
          "0": "#000000",
          "10": "#1B5E20",
          "20": "#2E7D32",
          "30": "#4CAF50",
          "40": "#66BB6A",
          "50": "#81C784",
          "90": "#C8E6C9",
          "95": "#E8F5E9",
          "99": "#F1F8E9",
          "100": "#FFFFFF"
        },
        "accent": {
          "20": "#FF6B35",
          "30": "#FF8A65",
          "50": "#FFAB91"
        },
        "priority": {
          "50": "#FFC107"
        },
        "neutral": {
          "10": "#1C1B1F",
          "20": "#313033",
          "50": "#969696",
          "80": "#E0E0E0",
          "90": "#F5F5F5",
          "95": "#FAFAFA",
          "99": "#FFFFFF"
        }
      },
      "typeface": {
        "brand": "Poppins",
        "plain": "Inter"
      },
      "weight": {
        "regular": 400,
        "medium": 500,
        "semibold": 600,
        "bold": 700
      }
    }
  }
}
```

### 2. Semantic Tokens (System)

**Meaningful, context-aware tokens:**

```json
{
  "md": {
    "sys": {
      "color": {
        "primary": "{md.ref.palette.primary.20}",
        "on-primary": "{md.ref.palette.neutral.99}",
        "primary-container": "{md.ref.palette.primary.90}",
        "on-primary-container": "{md.ref.palette.primary.10}",
        
        "background": "{md.ref.palette.neutral.99}",
        "on-background": "{md.ref.palette.neutral.10}",
        
        "surface": "{md.ref.palette.neutral.99}",
        "on-surface": "{md.ref.palette.neutral.10}",
        "surface-variant": "{md.ref.palette.neutral.90}",
        
        "error": "#D32F2F",
        "on-error": "#FFFFFF",
        "success": "#388E3C",
        
        "priority": "{md.ref.palette.priority.50}",
        "accent": "{md.ref.palette.accent.20}"
      },
      "typography": {
        "headline-large": {
          "font-family": "{md.ref.typeface.brand}",
          "font-weight": "{md.ref.weight.bold}",
          "font-size": "32px",
          "line-height": "40px"
        },
        "title-medium": {
          "font-family": "{md.ref.typeface.brand}",
          "font-weight": "{md.ref.weight.semibold}",
          "font-size": "16px",
          "line-height": "24px"
        },
        "body-large": {
          "font-family": "{md.ref.typeface.plain}",
          "font-weight": "{md.ref.weight.regular}",
          "font-size": "16px",
          "line-height": "24px"
        }
      },
      "spacing": {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px",
        "xl": "32px",
        "2xl": "48px"
      },
      "shape": {
        "corner-none": "0",
        "corner-sm": "4px",
        "corner-md": "8px",
        "corner-lg": "12px",
        "corner-xl": "16px",
        "corner-full": "9999px"
      }
    }
  }
}
```

### 3. Component Tokens (Component-Specific)

**Overrides for specific components:**

```json
{
  "md": {
    "comp": {
      "button": {
        "container-height": "44px",
        "container-shape": "{md.sys.shape.corner-md}",
        "label-text-font": "{md.sys.typography.title-medium}",
        "container-color": "{md.sys.color.primary}",
        "label-text-color": "{md.sys.color.on-primary}"
      },
      "card": {
        "container-shape": "{md.sys.shape.corner-lg}",
        "container-color": "{md.sys.color.surface}",
        "container-elevation": "1"
      }
    }
  }
}
```

---

## Implementation with CSS Modules

### Token Files Structure

```
src/
├── tokens/
│   ├── tokens.json          # Source of truth (JSON)
│   ├── tokens.css           # Generated CSS variables
│   └── tokens.ts            # TypeScript types (generated)
└── styles/
    └── tokens.css           # Import and use
```

### Token to CSS Variable Mapping

```css
/* styles/tokens.css - Generated from tokens.json */

:root {
  /* Core Palette */
  --md-ref-palette-primary-20: #2E7D32;
  --md-ref-palette-primary-90: #C8E6C9;
  --md-ref-palette-neutral-10: #1C1B1F;
  --md-ref-palette-neutral-99: #FFFFFF;

  /* Semantic Colors */
  --md-sys-color-primary: var(--md-ref-palette-primary-20);
  --md-sys-color-on-primary: var(--md-ref-palette-neutral-99);
  --md-sys-color-primary-container: var(--md-ref-palette-primary-90);
  --md-sys-color-background: var(--md-ref-palette-neutral-99);
  --md-sys-color-on-background: var(--md-ref-palette-neutral-10);

  /* Typography */
  --md-sys-typography-headline-large-font-family: 'Poppins', sans-serif;
  --md-sys-typography-headline-large-font-weight: 700;
  --md-sys-typography-headline-large-font-size: 32px;
  --md-sys-typography-headline-large-line-height: 40px;

  /* Spacing */
  --md-sys-spacing-xs: 4px;
  --md-sys-spacing-sm: 8px;
  --md-sys-spacing-md: 16px;
  --md-sys-spacing-lg: 24px;

  /* Shape */
  --md-sys-shape-corner-sm: 4px;
  --md-sys-shape-corner-md: 8px;
  --md-sys-shape-corner-lg: 12px;

  /* Component Tokens */
  --md-comp-button-container-height: 44px;
  --md-comp-button-container-shape: var(--md-sys-shape-corner-md);
  --md-comp-button-container-color: var(--md-sys-color-primary);
}
```

### Usage in CSS Modules

```css
/* components/base-elements/Button/Button.module.css */
.button {
  height: var(--md-comp-button-container-height);
  border-radius: var(--md-comp-button-container-shape);
  background-color: var(--md-comp-button-container-color);
  color: var(--md-sys-color-on-primary);
  padding: var(--md-sys-spacing-sm) var(--md-sys-spacing-md);
  font-family: var(--md-sys-typography-title-medium-font-family);
  font-weight: var(--md-sys-typography-title-medium-font-weight);
  font-size: var(--md-sys-typography-title-medium-font-size);
}

.button:hover {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}
```

---

## Token Naming Convention (M3-Inspired)

### Structure: `md.{tier}.{category}.{property}`

```
md.{tier}.{category}.{property}
 │   │      │         └─ Specific property
 │   │      └─────────── Category (color, spacing, typography)
 │   └────────────────── Tier (ref, sys, comp)
 └────────────────────── Namespace (md = material design inspired)
```

### Examples:
- `md.ref.palette.primary.20` - Core palette color
- `md.sys.color.primary` - Semantic color token
- `md.sys.spacing.md` - Semantic spacing token
- `md.comp.button.container-color` - Component token

---

## Theming Support

### Light Theme (Default)

```css
:root[data-theme="light"] {
  --md-sys-color-background: var(--md-ref-palette-neutral-99);
  --md-sys-color-on-background: var(--md-ref-palette-neutral-10);
  --md-sys-color-surface: var(--md-ref-palette-neutral-99);
}
```

### Dark Theme (Future)

```css
:root[data-theme="dark"] {
  --md-sys-color-background: var(--md-ref-palette-neutral-10);
  --md-sys-color-on-background: var(--md-ref-palette-neutral-90);
  --md-sys-color-surface: var(--md-ref-palette-neutral-20);
}
```

### Theme Switching (Runtime)

```typescript
// Toggle theme
document.documentElement.setAttribute('data-theme', 'dark');
```

---

## TypeScript Integration

### Token Types (Generated)

```typescript
// tokens/tokens.ts (auto-generated from tokens.json)
export const tokens = {
  md: {
    sys: {
      color: {
        primary: 'var(--md-sys-color-primary)',
        onPrimary: 'var(--md-sys-color-on-primary)',
        // ...
      },
      spacing: {
        xs: 'var(--md-sys-spacing-xs)',
        sm: 'var(--md-sys-spacing-sm)',
        // ...
      },
    },
  },
} as const;

// Type-safe token access
type TokenPath = typeof tokens;
```

### Usage in TypeScript

```typescript
// CSS-in-JS or inline styles (if needed)
import { tokens } from '@/tokens/tokens';

const buttonStyle = {
  backgroundColor: tokens.md.sys.color.primary,
  padding: tokens.md.sys.spacing.md,
};
```

---

## Token Management Workflow

### MVP Approach (Simple)

**Phase 1:**
1. Define tokens in `tokens/tokens.json`
2. Manually convert to CSS variables in `styles/tokens.css`
3. Use in CSS Modules via `var(--token-name)`

**Phase 2+ (Future):**
1. Use token tooling (Style Dictionary, Theo, etc.)
2. Auto-generate CSS from JSON
3. Sync with design tools (Figma, etc.)
4. TypeScript type generation

---

## Benefits for Your Project

### 1. **Consistency**
- Single source of truth for design values
- Prevents magic numbers and hardcoded colors
- Ensures visual consistency across components

### 2. **Maintainability**
- Change a token, update everywhere automatically
- Easy to update brand colors/spacing
- Clear hierarchy and organization

### 3. **Scalability**
- Easy to add new tokens
- Supports theming (light/dark, brand variations)
- Component-specific overrides when needed

### 4. **Collaboration**
- Designers and developers speak the same language
- Tokens can sync from design tools (Figma)
- Clear documentation via token names

### 5. **Type Safety**
- TypeScript can enforce token usage
- Autocomplete for token names
- Catch typos at compile time

---

## Migration from CSS Variables

### Current (CSS Variables)
```css
:root {
  --color-primary: #2E7D32;
  --spacing-md: 16px;
}
```

### New (Design Tokens)
```css
:root {
  --md-sys-color-primary: #2E7D32;
  --md-sys-spacing-md: 16px;
}
```

### Migration Strategy
1. Keep existing variables as aliases initially
2. Gradually migrate components to token names
3. Remove old variables once fully migrated

```css
/* Transition period */
:root {
  /* Old (deprecated) */
  --color-primary: var(--md-sys-color-primary);
  
  /* New (token) */
  --md-sys-color-primary: #2E7D32;
}
```

---

## Implementation Checklist

### Phase 1: Foundation (MVP)
- [ ] Create `tokens/tokens.json` with core tokens
- [ ] Define semantic tokens for colors, spacing, typography
- [ ] Generate `styles/tokens.css` with CSS variables
- [ ] Update existing components to use tokens
- [ ] Document token naming conventions

### Phase 2: Enhancement
- [ ] Add component-specific tokens
- [ ] Implement dark theme tokens
- [ ] Add TypeScript types for tokens
- [ ] Set up token generation tooling (optional)

### Phase 3: Advanced
- [ ] Integrate with design tools (Figma)
- [ ] Auto-generate CSS from JSON
- [ ] Add token linting rules
- [ ] Create token documentation site

---

## Decision Summary

✅ **Use Design Tokens (M3-Inspired Model)**

**Structure:**
- **Core Tokens** (ref) - Base values
- **Semantic Tokens** (sys) - Usage-specific
- **Component Tokens** (comp) - Component overrides

**Implementation:**
- JSON source of truth (`tokens/tokens.json`)
- CSS variables for usage (`styles/tokens.css`)
- TypeScript types (future)
- Integrates with CSS Modules

**Benefits:**
- Consistent, maintainable design system
- Easy theming and scaling
- Better collaboration between design and dev
- Type safety and autocomplete

---

## References

- [Material Design 3 Design Tokens](https://m3.material.io/foundations/design-tokens/overview)
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/) - Token generation tool

---

**Status**: Design token strategy defined  
**Next Steps**: Create initial token structure in Phase 1 implementation
