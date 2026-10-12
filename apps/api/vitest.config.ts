import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text-summary'],
      thresholds: { statements: 78, lines: 78, branches: 90, functions: 90 },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@futmeet/shared/types': resolve(__dirname, '../../packages/shared/src/types/index.ts'),
      '@futmeet/shared/utils': resolve(__dirname, '../../packages/shared/src/utils/index.ts'),
    },
  },
});
