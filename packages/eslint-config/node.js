const globals = require('globals');
const base = require('./base');

module.exports = [
  ...base,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },
];
