'use strict';

module.exports = {
  plugins: ['prettier-plugin-ember-template-tag', 'prettier-plugin-jsdoc'],
  singleQuote: true,
  htmlWhitespaceSensitivity: 'css',
  templateSingleQuote: false,
  tsdoc: true,
  overrides: [
    {
      files: '*.hbs',
      options: {
        singleQuote: false,
      },
    },
  ],
};
