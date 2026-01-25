# Testing Strategy

## Overview
Simple testing setup using Vitest and React Testing Library for the FutMeet MVP. Focus on testing critical paths only - no coverage goals, just test what matters.

---

## Decision: Vitest + React Testing Library

### Why Vitest?
- **Vite Integration**: Same config, no duplicate tooling
- **Fast Execution**: Native ESM, faster than Jest
- **TypeScript**: Native TypeScript support
- **Jest Compatible**: Same API, easy to use

### Why React Testing Library?
- **User-Centric Testing**: Tests behavior, not implementation
- **Best Practices**: Industry standard for React component testing
- **Simple API**: Easy to learn and use

---

## Installation

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

---

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

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

---

## Test Examples

### Unit Test: Team Sorting Algorithm
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

### Component Test: Button
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

---

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# UI mode (Vitest UI)
npm run test:ui
```

---

## Implementation Checklist

- [ ] Install Vitest and React Testing Library dependencies
- [ ] Configure `vite.config.ts` with test settings
- [ ] Create `src/test/setup.ts` file
- [ ] Write unit test for team sorting algorithm
- [ ] Write component test for Button component

---

## Decision Summary

✅ **Use Vitest + React Testing Library**

**MVP Approach:**
- Test critical paths only (team sorting, basic component rendering)
- No coverage goals - focus on what matters
- Keep it simple and maintainable

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro/)

---

**Status**: ✅ **Strategy Defined**  
**Next Steps**: Implement in Phase 1 foundation setup
