import { describe, it, expect, vi } from 'vitest';

vi.mock('vite', () => ({ defineConfig: (config: unknown) => config }));
vi.mock('vitest/config', () => ({ defineConfig: (config: unknown) => config }));
vi.mock('@tanstack/react-start/plugin/vite', () => ({ tanstackStart: () => ({ name: 'tanstack-start' }) }));
vi.mock('nitro/vite', () => ({ nitro: () => ({ name: 'nitro' }) }));
vi.mock('@vitejs/plugin-react', () => ({ default: () => ({ name: 'react' }) }));
vi.mock('rollup-plugin-visualizer', () => ({ visualizer: () => ({ name: 'visualizer' }) }));

import viteConfig from '../../../vite.config';
import vitestConfig from '../../../vitest.config';
import { cssConfig } from '../../../css.config';

const pluginNames = (config: { plugins?: unknown[] }) =>
  (config.plugins ?? []).filter(Boolean).map((plugin) => (plugin as { name: string }).name);

describe('vite.config', () => {
  it('should register the Start plugin before the React plugin', () => {
    const names = pluginNames(viteConfig as { plugins: unknown[] });
    expect(names.indexOf('tanstack-start')).toBe(0);
    expect(names.indexOf('tanstack-start')).toBeLessThan(names.indexOf('react'));
  });

  it('should register nitro for the Node server output', () => {
    expect(pluginNames(viteConfig as { plugins: unknown[] })).toContain('nitro');
  });

  it('should share the CSS options with vitest', () => {
    expect(viteConfig.css).toBe(cssConfig);
    expect(vitestConfig.css).toBe(cssConfig);
  });
});

describe('vitest.config', () => {
  it('should not load the Start plugin in tests', () => {
    expect(pluginNames(vitestConfig as { plugins: unknown[] })).not.toContain('tanstack-start');
  });

  it('should run in jsdom with the Node webstorage flag disabled', () => {
    expect(vitestConfig.test?.environment).toBe('jsdom');
    expect(vitestConfig.test?.execArgv).toContain('--no-experimental-webstorage');
  });
});
