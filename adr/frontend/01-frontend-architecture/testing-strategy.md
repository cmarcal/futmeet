# Testing Strategy

## Overview
Comprehensive testing strategy using Vitest and React Testing Library for the FutMeet MVP.

---

## Decision: Vitest + React Testing Library

### What is Vitest?
Modern, fast testing framework built for Vite. Provides Jest-compatible API with better performance and seamless Vite integration.

### Why Vitest for This Project?

**Benefits ✅**
- **Vite Integration**: Same config, no duplicate tooling
- **Fast Execution**: Native ESM, faster than Jest
- **TypeScript**: Native TypeScript support (no Babel)
- **Watch Mode**: Lightning-fast watch mode
- **Jest Compatible**: Same API, easy migration/migration back
- **Small Bundle**: Only includes what you use

### Why React Testing Library?
- **User-Centric Testing**: Tests behavior, not implementation
- **Accessibility**: Encourages accessible components
- **Best Practices**: Industry standard for React component testing
- **Great DX**: Simple API, excellent documentation

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

## Testing Levels

### 1. Unit Tests
**What**: Individual functions, utilities, hooks

**Examples:**
- `utils/teamSorter.ts` - Sorting algorithm logic
- `utils/priorityManager.ts` - Priority handling
- `hooks/usePlayerManagement.ts` - Custom hook logic

**Example Test:**
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

---

### 2. Component Tests
**What**: UI components in isolation

**Examples:**
- Button component behavior
- FormField validation display
- PlayerCard interactions

**Example Test:**
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

### 3. Integration Tests
**What**: Multiple components working together

**Examples:**
- Form submission flow
- Player addition workflow
- Team sorting and display

**Example Test:**
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

---

## Accessibility Testing

### Manual Testing
- **Screen Readers**: NVDA (Windows), JAWS, VoiceOver (Mac/iOS)
- **Keyboard Navigation**: Tab through entire app
- **Color Contrast**: Use browser DevTools or axe DevTools

### Automated Testing
```typescript
// Example accessibility test
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
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

---

## Test Coverage Goals

- **Unit Tests**: 80%+ coverage for utilities and hooks
- **Component Tests**: Critical user interactions
- **Integration Tests**: Key user flows (add player, sort teams)

---

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (Vitest UI)
npm run test:ui
```

---

## Decision Summary

✅ **Use Vitest + React Testing Library**

**Benefits:**
- Fast, Vite-integrated testing
- User-centric component testing
- Accessibility testing included
- TypeScript-first approach

**Testing Levels:**
- Unit tests for utilities and hooks
- Component tests for UI components
- Integration tests for user flows

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro/)

---

**Status**: ✅ **Strategy Defined**  
**Next Steps**: Implement in Phase 1 foundation setup
