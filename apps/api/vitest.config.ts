import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@core': resolve(__dirname, 'src/core'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@futmeet/shared/types': resolve(__dirname, '../../packages/shared/src/types/index.ts'),
      '@futmeet/shared/utils': resolve(__dirname, '../../packages/shared/src/utils/index.ts'),
    },
  },
});
