---
name: icons-lucide-react
description: Use when adding icons to buttons or UI elements, choosing icon names, or making icons accessible.
---

# Icons with Lucide React

`lucide-react` is the only icon library: tree-shakeable, TypeScript-first.

## Rules

- Sizes: `16` (buttons, inline), `20` (default), `24` (headers, prominent)
- Icon-only button: `aria-label` on the button, `aria-hidden="true"` on the icon
- Icon plus text: `aria-hidden="true"` on the icon; the text serves screen readers
- Decorative icons: always `aria-hidden="true"`
- `aria-label` never goes on an icon inside a labeled button
- Icons inherit the parent's `color`; set color through CSS tokens, never inline (`design-tokens-strategy`)

```typescript
<button type="button" aria-label="Delete player" onClick={handleDelete}>
  <Trash2 size={16} aria-hidden="true" />
</button>

<button>
  <Plus size={16} aria-hidden="true" />
  <span>Add Player</span>
</button>
```

## Project Icon Reference

| Area | Icons |
|---|---|
| Player management | `User` player, `Plus` add, `Trash2` delete, `Edit` edit, `Check` confirm, `X` cancel |
| Priority/sorting | `Star` priority, `Shuffle` sort teams, `ArrowUp`/`ArrowDown` reorder |
| Navigation | `Home`, `List` player list, `Users` teams, `Settings` |
| Status | `CheckCircle` success, `AlertCircle` warning, `XCircle` error |

## Styling

```css
.icon {
  color: var(--color-on-primary);
  transition: color 0.2s;
}

.button:hover .icon {
  color: var(--color-primary-light);
}
```

## References

Read `references/icon-wrapper.md` for the optional `Icon` wrapper component. General accessibility rules: `accessibility-wcag` skill.
