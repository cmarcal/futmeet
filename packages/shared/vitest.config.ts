import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text-summary'],
      thresholds: { statements: 90, lines: 90, branches: 85, functions: 80 },
    },
  },
});
