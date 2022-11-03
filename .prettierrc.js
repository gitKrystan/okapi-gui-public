'use strict';

module.exports = {
  plugins: ['prettier-plugin-ember-template-tag'],
  singleQuote: true,
  htmlWhitespaceSensitivity: 'css',
  templateSingleQuote: false,
  overrides: [
    {
      files: '*.hbs',
      options: {
        singleQuote: false,
      },
    },
  ],
};
