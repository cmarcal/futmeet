---
name: testing-vitest
description: Use when writing unit tests, component tests, or configuring the test setup in apps/web or apps/api. Covers Vitest + React Testing Library patterns for critical path testing only.
---

# Testing with Vitest + React Testing Library

Test critical paths only — no coverage goals. Test behavior, not implementation.

## Configuration

```typescript
// vite.config.ts
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

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

## Unit Test

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

## Component Test

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
npm run test        # Run all tests
npm run test:watch  # Watch mode
npm run test:ui     # Vitest UI
```

## API Module Tests

For API tests (apps/api), use the query factory DI pattern — mock the factory to inject a fake query object, never hit a real database. See `CLAUDE.md` for the `QueryFactory` pattern.

```bash
# Run a single test file
npx vitest run src/modules/room/service/__tests__/index.test.ts
```

## Best Practices

- Test files go in `__tests__/` subdirectory next to the source
- Use path aliases (`@modules/...`) in imports, not relative paths
- No comments in test files
- Prefer `getByRole`, `getByLabelText` over `getByTestId`
- Each test must be independent — no shared mutable state
- No coverage goals — only test essential functionality
