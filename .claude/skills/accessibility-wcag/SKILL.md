---
name: accessibility-wcag
description: Use when building interactive components, adding ARIA attributes, keyboard navigation, focus management, or checking color contrast.
---

# Accessibility (WCAG 2.1 Level AA)

Every interactive element is keyboard accessible, has proper ARIA semantics, and meets AA contrast.

## Keyboard

- Tab order follows visual flow; no keyboard traps
- Buttons, links and inputs respond to Enter and Space
- Focus indicators are always visible

```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleClick();
  }
};
```

## Screen Readers

- Icon-only buttons require `aria-label`; the icon gets `aria-hidden="true"` (see `icons-lucide-react`)
- Icon plus text: hide the icon, keep the text
- Dynamic updates use `role="status"` with `aria-live="polite"`

```typescript
<button aria-label="Delete player" onClick={handleDelete}>
  <Trash2 size={16} aria-hidden="true" />
</button>
```

## Color Contrast

- Normal text: 4.5:1 minimum
- Large text (18pt+, or 14pt+ bold): 3:1 minimum
- Check with DevTools, axe DevTools, or WebAIM Contrast Checker

## Focus

```css
.button:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
}
```

Provide a skip link (`<a href="#main-content">`) before the navigation.

## Semantic HTML

`<button>` for actions, `<nav>` for navigation, `<main>` for main content, `<form>` for forms. Heading hierarchy runs h1 → h2 → h3 without gaps.

## Form Fields

Label every input with `htmlFor`; set `aria-invalid` and `aria-describedby` to an error element with `role="alert"`. Full form pattern: `forms-react-hook-form-zod` skill.

## Testing

Run `vitest-axe` on each new component, then check manually: keyboard only, NVDA or VoiceOver, 200% zoom.

## References

Read `references/examples.md` for the axe test, form field, skip link and semantic layout snippets.
