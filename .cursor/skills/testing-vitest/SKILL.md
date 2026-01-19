---
name: testing-vitest
description: Use Vitest and React Testing Library for testing. This skill guides writing unit tests, component tests, and integration tests following the project's testing strategy.
---

# Testing with Vitest + React Testing Library

When writing tests in this project, use Vitest and React Testing Library. This provides fast, user-centric testing with excellent TypeScript support.

## When to Use This Skill

- Writing unit tests for utilities and hooks
- Testing React components
- Writing integration tests for user flows
- Setting up test configuration
- Running test coverage

## Key Principles

1. **Vitest** for test framework (Vite-integrated, fast)
2. **React Testing Library** for component testing (user-centric)
3. **User-Centric Testing**: Test behavior, not implementation
4. **Accessibility Testing**: Include accessibility in tests
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

## Testing Levels

### 1. Unit Tests

Test individual functions, utilities, hooks.

#### Example: Utility Function

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

  it('should handle priority players', () => {
    // Test priority distribution
  });
});
```

### 2. Component Tests

Test UI components in isolation.

#### Example: Button Component

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

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### 3. Integration Tests

Test multiple components working together.

#### Example: Form Integration

```typescript
// components/sections/PlayerInput/__tests__/PlayerInput.integration.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerInput } from '../PlayerInput';
import { useGameStore } from '@/stores/gameStore';

describe('PlayerInput Integration', () => {
  it('should add player to store on form submit', async () => {
    const user = userEvent.setup();
    
    render(<PlayerInput />);
    
    const input = screen.getByLabelText('Player Name');
    await user.type(input, 'John Doe');
    
    const submitButton = screen.getByRole('button', { name: /add/i });
    await user.click(submitButton);
    
    const { players } = useGameStore.getState();
    expect(players).toContainEqual(
      expect.objectContaining({ name: 'John Doe' })
    );
  });
});
```

## Accessibility Testing

### Automated Accessibility Testing

```typescript
// Install: npm install -D @axe-core/react vitest-axe
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'vitest-axe';
import { Button } from '../Button';

expect.extend(toHaveNoViolations);

describe('Button Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

## Test Utilities

### Custom Render Function

```typescript
// test/utils.tsx
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export function renderWithProviders(ui: React.ReactElement) {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {ui}
    </QueryClientProvider>
  );
}
```

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (Vitest UI)
npm run test:ui
```

### package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what users see/do
2. **Use Accessible Queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
3. **Test User Flows**: Test complete user interactions
4. **Isolate Tests**: Each test should be independent
5. **Clear Test Names**: Describe what is being tested

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities and hooks
- **Component Tests**: Critical user interactions
- **Integration Tests**: Key user flows (add player, sort teams)

## Related Files

- `adr/frontend/01-frontend-architecture/testing-strategy.md` - Full testing documentation
- `adr/frontend/01-frontend-architecture/final-decisions.md` - Testing decision

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro/)

## Checklist

- [ ] Install testing dependencies
- [ ] Configure Vitest in `vite.config.ts`
- [ ] Set up test setup file
- [ ] Write unit tests for utilities
- [ ] Write component tests
- [ ] Write integration tests
- [ ] Add accessibility testing
