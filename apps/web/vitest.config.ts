import { defineConfig, type Plugin, type ViteUserConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { cssConfig } from './css.config.ts'

export default defineConfig({
  plugins: [react() as unknown as Plugin],
  css: cssConfig as ViteUserConfig['css'],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    execArgv: ['--no-experimental-webstorage'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
    },
  },
})
