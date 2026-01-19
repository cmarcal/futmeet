---
name: design-tokens-strategy
description: Use Material Design 3-inspired design tokens for managing design values. This skill guides implementing and using design tokens with CSS variables and CSS Modules.
---

# Design Tokens Strategy

When working with design values (colors, spacing, typography) in this project, use the Material Design 3-inspired design token system. This provides a structured, scalable approach to managing design decisions.

## When to Use This Skill

- Defining color, spacing, or typography values
- Creating new design tokens
- Theming or theme variations
- Using design values in CSS Modules
- Ensuring design consistency

## Key Principles

1. **Three-Tier Structure**: Core Tokens → Semantic Tokens → Component Tokens
2. **JSON Source of Truth**: Tokens defined in `tokens/tokens.json`
3. **CSS Variables**: Generated from tokens for use in CSS Modules
4. **M3-Inspired Naming**: Follow Material Design 3 naming conventions
5. **Semantic Over Raw Values**: Use semantic tokens that express intent

## Token Hierarchy

```
┌─────────────────────────────────────────────┐
│  Core Tokens (ref)                          │  Base values (raw colors, sizes)
│  - md.ref.palette                           │
│  - md.ref.typeface                          │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Semantic Tokens (sys)                      │  Usage-specific (what it means)
│  - md.sys.color                             │
│  - md.sys.typography                        │
│  - md.sys.spacing                           │
└────────────────┬────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│  Component Tokens (comp)                    │  Component-specific (overrides)
│  - md.comp.button                           │
│  - md.comp.card                             │
└─────────────────────────────────────────────┘
```

## Token Structure

### File Organization

```
src/
├── tokens/
│   ├── tokens.json          # Source of truth (JSON)
│   └── tokens.ts            # TypeScript types (generated, future)
└── styles/
    └── tokens.css           # Generated CSS variables
```

### Example Token JSON Structure

```json
{
  "md": {
    "ref": {
      "palette": {
        "primary": {
          "20": "#2E7D32",
          "30": "#4CAF50",
          "90": "#C8E6C9"
        },
        "neutral": {
          "10": "#1C1B1F",
          "99": "#FFFFFF"
        }
      },
      "typeface": {
        "brand": "Poppins",
        "plain": "Inter"
      }
    },
    "sys": {
      "color": {
        "primary": "{md.ref.palette.primary.20}",
        "on-primary": "{md.ref.palette.neutral.99}",
        "background": "{md.ref.palette.neutral.99}"
      },
      "spacing": {
        "xs": "4px",
        "sm": "8px",
        "md": "16px",
        "lg": "24px"
      }
    },
    "comp": {
      "button": {
        "container-height": "44px",
        "container-color": "{md.sys.color.primary}"
      }
    }
  }
}
```

## CSS Variable Generation

### Generated CSS Variables

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
  --md-sys-color-background: var(--md-ref-palette-neutral-99);

  /* Spacing */
  --md-sys-spacing-xs: 4px;
  --md-sys-spacing-sm: 8px;
  --md-sys-spacing-md: 16px;
  --md-sys-spacing-lg: 24px;

  /* Component Tokens */
  --md-comp-button-container-height: 44px;
  --md-comp-button-container-color: var(--md-sys-color-primary);
}
```

## Usage in CSS Modules

### Using Design Tokens

```css
/* components/base-elements/Button/Button.module.css */
.button {
  height: var(--md-comp-button-container-height);
  background-color: var(--md-comp-button-container-color);
  color: var(--md-sys-color-on-primary);
  padding: var(--md-sys-spacing-sm) var(--md-sys-spacing-md);
  border-radius: var(--md-sys-shape-corner-md);
}

.button:hover {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
}
```

### Prefer Semantic Tokens Over Core Tokens

```css
/* ✅ Good - Use semantic token */
.button {
  background-color: var(--md-sys-color-primary);
}

/* ❌ Avoid - Using core token directly */
.button {
  background-color: var(--md-ref-palette-primary-20);
}
```

## Token Naming Convention

### Structure: `md.{tier}.{category}.{property}`

- `md` - Namespace (Material Design inspired)
- `tier` - `ref` (core), `sys` (semantic), `comp` (component)
- `category` - `color`, `spacing`, `typography`, `shape`
- `property` - Specific property name

### Examples

```
md.ref.palette.primary.20      # Core palette color
md.sys.color.primary          # Semantic color token
md.sys.spacing.md              # Semantic spacing token
md.comp.button.container-color # Component token
```

## Implementation Workflow

### Phase 1: MVP (Manual)

1. **Define tokens in JSON**
   ```json
   // tokens/tokens.json
   {
     "md": {
       "sys": {
         "color": { "primary": "#2E7D32" },
         "spacing": { "md": "16px" }
       }
     }
   }
   ```

2. **Manually generate CSS variables**
   ```css
   /* styles/tokens.css */
   :root {
     --md-sys-color-primary: #2E7D32;
     --md-sys-spacing-md: 16px;
   }
   ```

3. **Use in CSS Modules**
   ```css
   .button {
     background-color: var(--md-sys-color-primary);
     padding: var(--md-sys-spacing-md);
   }
   ```

### Phase 2: Future (Automated)

- Use token tooling (Style Dictionary, Theo)
- Auto-generate CSS from JSON
- Sync with design tools (Figma)
- TypeScript type generation

## Theming Support

### Light Theme (Default)

```css
:root[data-theme="light"] {
  --md-sys-color-background: var(--md-ref-palette-neutral-99);
  --md-sys-color-on-background: var(--md-ref-palette-neutral-10);
}
```

### Dark Theme (Future)

```css
:root[data-theme="dark"] {
  --md-sys-color-background: var(--md-ref-palette-neutral-10);
  --md-sys-color-on-background: var(--md-ref-palette-neutral-90);
}
```

### Toggle Theme

```typescript
// Toggle theme at runtime
document.documentElement.setAttribute('data-theme', 'dark');
```

## Best Practices

1. **Use Semantic Tokens**: Prefer `md.sys.color.primary` over `md.ref.palette.primary.20`
2. **Single Source of Truth**: Define values in `tokens.json` only
3. **Don't Hardcode Values**: Always use token CSS variables
4. **Component Tokens**: Use for component-specific overrides only
5. **Document Tokens**: Document token purpose and usage

## Related Files

- `adr/frontend/01-frontend-architecture/design-tokens-strategy.md` - Full strategy documentation
- `adr/frontend/01-frontend-architecture/final-decisions.md` - Design token decision

## References

- [Material Design 3 Design Tokens](https://m3.material.io/foundations/design-tokens/overview)
- [Design Tokens Community Group](https://www.w3.org/community/design-tokens/)
- [Style Dictionary](https://amzn.github.io/style-dictionary/) - Token generation tool

## Checklist

- [ ] Create `tokens/tokens.json` with core tokens
- [ ] Define semantic tokens for colors, spacing, typography
- [ ] Generate `styles/tokens.css` with CSS variables
- [ ] Update components to use tokens
- [ ] Document token naming conventions
