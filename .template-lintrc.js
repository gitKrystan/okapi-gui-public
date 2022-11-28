'use strict';

module.exports = {
  extends: 'recommended',
  rules: {
    // Doesn't work properly in gts files. Glint takes care of this anyway.
    'no-implicit-this': false,
    // Lots of false positives in gts. Plus, glint should take care of this.
    'no-unknown-arguments-for-builtin-components': false,
  },
  overrides: [
    {
      files: ['app/components/symbols.gts'],
      rules: { 'no-inline-styles': false },
    },
  ],
};
