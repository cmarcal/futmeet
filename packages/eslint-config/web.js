const globals = require('globals');
const { fixupPluginRules } = require('@eslint/compat');
const reactHooks = require('eslint-plugin-react-hooks');
const reactRefresh = require('eslint-plugin-react-refresh');
const base = require('./base');

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...base,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': fixupPluginRules(reactHooks),
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
];
