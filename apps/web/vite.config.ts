import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { cssConfig } from './css.config.ts'

export default defineConfig({
  plugins: [
    tanstackStart(),
    nitro(),
    react(),
    process.env.ANALYZE === 'true' &&
      visualizer({
        filename: '.output/public/stats.html',
        gzipSize: true,
        brotliSize: true,
      }),
  ],
  css: cssConfig,
})
