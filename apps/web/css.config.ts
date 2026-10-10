import postcssNesting from 'postcss-nesting'
import postcssCustomMedia from 'postcss-custom-media'
import type { UserConfig } from 'vite'

export const cssConfig: NonNullable<UserConfig['css']> = {
  modules: {
    localsConvention: 'camelCase',
  },
  postcss: {
    plugins: [postcssNesting(), postcssCustomMedia()],
  },
}
