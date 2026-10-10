import { describe, it, expect } from 'vitest';
import { cssConfig } from '../../../css.config';

describe('cssConfig', () => {
  it('should expose CSS Module class names in camelCase', () => {
    expect(cssConfig.modules).toEqual({ localsConvention: 'camelCase' });
  });

  it('should run nesting then custom-media PostCSS plugins', () => {
    const postcss = cssConfig.postcss as { plugins: { postcssPlugin: string }[] };
    expect(postcss.plugins.map((plugin) => plugin.postcssPlugin)).toEqual(['postcss-nesting', 'postcss-custom-media']);
  });
});
