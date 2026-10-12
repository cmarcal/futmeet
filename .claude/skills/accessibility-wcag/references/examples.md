# Accessibility Examples

## Button patterns

```typescript
<button onClick={handleClick} onKeyDown={handleKeyDown} aria-label="Add player">
  Add Player
</button>

<button>
  <Plus size={16} aria-hidden="true" />
  <span>Add Player</span>
</button>

<div role="status" aria-live="polite" aria-atomic="true">
  {playerCount} players added
</div>
```

## Contrast

```css
.button { background-color: #2E7D32; color: #FFFFFF; }
.bad { background-color: #E0E0E0; color: #F5F5F5; }
```

The first pair passes 4.5:1; the second fails.

## Focus reset and skip link

```css
*:focus:not(:focus-visible) {
  outline: none;
}
```

```typescript
<a href="#main-content" className={styles.skipLink}>Skip to main content</a>
<main id="main-content">{/* content */}</main>
```

## Semantic layout

```html
<main>
  <h1>FutMeet</h1>
  <nav aria-label="Main navigation">
    <a href="/">Home</a>
    <a href="/game">Game</a>
  </nav>
  <section>
    <h2>Players</h2>
  </section>
</main>
```

## Accessible form field

```typescript
<label htmlFor="player-name">Player Name</label>
<input
  id="player-name"
  aria-invalid={!!errors.name}
  aria-describedby={errors.name ? 'name-error' : undefined}
/>
{errors.name && <span id="name-error" role="alert">{errors.name.message}</span>}
```

## Automated test

```typescript
// Button.a11y.test.tsx, using jest-axe (matcher registered in src/test/setup.ts)
import { axe } from 'jest-axe';

it('should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  expect(await axe(container)).toHaveNoViolations();
});
```
