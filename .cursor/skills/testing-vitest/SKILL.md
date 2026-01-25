---
name: testing-vitest
description: Use Vitest and React Testing Library for testing. This skill guides writing unit tests and component tests for critical paths only.
---

# Testing with Vitest + React Testing Library

When writing tests in this project, use Vitest and React Testing Library. Focus on testing critical paths only—no coverage goals.

## When to Use This Skill

- Writing unit tests for critical utilities and hooks
- Testing React components for critical user interactions
- Setting up test configuration

## Key Principles

1. **Vitest** for test framework (Vite-integrated, fast)
2. **React Testing Library** for component testing (user-centric)
3. **Test Critical Paths Only**: Focus on essential functionality
4. **User-Centric Testing**: Test behavior, not implementation
5. **TypeScript First**: Full TypeScript support

## Installation

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

## Configuration

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
});
```

### `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

## Unit Test Example

Test individual functions and utilities for critical paths.

```typescript
// utils/__tests__/teamSorter.test.ts
import { describe, it, expect } from 'vitest';
import { sortTeams } from '../teamSorter';

describe('sortTeams', () => {
  it('should distribute players evenly across teams', () => {
    const players = [
      { id: '1', name: 'Player 1' },
      { id: '2', name: 'Player 2' },
      { id: '3', name: 'Player 3' },
      { id: '4', name: 'Player 4' },
    ];
    
    const teams = sortTeams(players, 2);
    
    expect(teams).toHaveLength(2);
    expect(teams[0].players).toHaveLength(2);
    expect(teams[1].players).toHaveLength(2);
  });
});
```

## Component Test Example

Test UI components for critical user interactions.

```typescript
// components/base-elements/Button/__tests__/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# UI mode (Vitest UI)
npm run test:ui
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:ui": "vitest --ui"
  }
}
```

## Best Practices

1. **Test Critical Paths Only**: Focus on essential functionality
2. **Test Behavior, Not Implementation**: Focus on what users see/do
3. **Use Accessible Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
4. **Isolate Tests**: Each test should be independent
5. **Clear Test Names**: Describe what is being tested

## Checklist

- [ ] Install testing dependencies
- [ ] Configure Vitest in `vite.config.ts`
- [ ] Set up test setup file
- [ ] Write unit tests for critical utilities
- [ ] Write component tests for critical interactions
