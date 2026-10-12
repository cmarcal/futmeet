# Mobile-First Examples

## Responsive layout

```css
.playerList {
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}
```

## Container

```css
.container {
  padding: 16px;
  width: 100%;

  @media (min-width: 768px) {
    padding: 24px;
    max-width: 768px;
    margin: 0 auto;
  }

  @media (min-width: 1024px) {
    padding: 32px;
    max-width: 1200px;
  }
}
```

## Responsive typography

```css
.text {
  font-size: 14px;
  line-height: 1.5;

  @media (min-width: 768px) { font-size: 16px; }
  @media (min-width: 1024px) { font-size: 18px; }
}
```

## Spacing between tap targets

```css
.button + .button {
  margin-left: 16px;
}
```

## CSS variables for responsive values

```css
:root {
  --spacing-base: 16px;
  --font-size-base: 14px;
  --max-width: 100%;

  @media (min-width: 768px) {
    --spacing-base: 20px;
    --font-size-base: 16px;
    --max-width: 768px;
  }

  @media (min-width: 1024px) {
    --spacing-base: 24px;
    --font-size-base: 18px;
    --max-width: 1200px;
  }
}
```
