'use strict';

const tsRules = {
  'prefer-const': 0,
  semi: 0,
  'no-dupe-class-members': 0,
  '@typescript-eslint/prefer-optional-chain': 2,
  '@typescript-eslint/array-type': [2, { default: 'array-simple' }],
  '@typescript-eslint/ban-ts-comment': [
    2,
    {
      'ts-expect-error': 'allow-with-description',
      'ts-ignore': true,
    },
  ],
  '@typescript-eslint/consistent-type-assertions': 2,
  '@typescript-eslint/consistent-type-imports': 2,
  '@typescript-eslint/explicit-member-accessibility': [
    2,
    { accessibility: 'no-public' },
  ],
  '@typescript-eslint/explicit-function-return-type': [
    2,
    { allowExpressions: true },
  ],
  '@typescript-eslint/method-signature-style': 2,
  '@typescript-eslint/no-confusing-non-null-assertion': 2,
  '@typescript-eslint/no-dynamic-delete': 2,
  '@typescript-eslint/no-empty-interface': 0,
  '@typescript-eslint/no-extra-semi': 2,
  '@typescript-eslint/no-extraneous-class': 2,
  '@typescript-eslint/no-implicit-any-catch': 2,
  '@typescript-eslint/no-invalid-void-type': 2,
  '@typescript-eslint/no-require-imports': 2,
  '@typescript-eslint/no-unused-vars': [
    2,
    {
      argsIgnorePattern: '^_',
      destructuredArrayIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    },
  ],
  '@typescript-eslint/no-use-before-define': [2, { functions: false }],
  '@typescript-eslint/prefer-enum-initializers': 2,
  '@typescript-eslint/prefer-for-of': 2,
  '@typescript-eslint/prefer-literal-enum-member': 2,
  '@typescript-eslint/type-annotation-spacing': 2,
  '@typescript-eslint/unbound-method': 0, // We use unbound methods regularly in Ember
  '@typescript-eslint/unified-signatures': 2,
  // We need these at least until we switch to `<template>` when it comes out:
  'ember/no-empty-glimmer-component-classes': 'off',
  'jsdoc/require-jsdoc': [1, { publicOnly: true }],
  'jsdoc/require-returns': 0,
  'jsdoc/require-returns-type': 0,
  'jsdoc/require-param': 0,
  'jsdoc/require-param-type': 0,
  'no-use-before-define': 0,
};

const tsTypeCheckRules = {
  '@typescript-eslint/no-base-to-string': 2,
  '@typescript-eslint/no-unnecessary-boolean-literal-compare': 2,
  '@typescript-eslint/no-unnecessary-qualifier': 2,
  '@typescript-eslint/no-unnecessary-type-arguments': 2,
  '@typescript-eslint/prefer-includes': 2,
  '@typescript-eslint/prefer-string-starts-ends-with': 2,
  '@typescript-eslint/require-array-sort-compare': 2,
  '@typescript-eslint/switch-exhaustiveness-check': 2,
};

module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      legacyDecorators: true,
    },
    requireConfigFile: false,
  },
  plugins: ['ember', 'filenames', 'unicorn'],
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:jsdoc/recommended',
    'plugin:unicorn/recommended',
    'prettier',
  ],
  env: {
    browser: true,
  },
  rules: {
    // Restrict global properties that have been wrapped by services
    'no-restricted-properties': [
      2,
      {
        object: 'window',
        property: 'location',
        message: 'Please use the Location service',
      },
    ],
    'eslint-comments/no-unused-disable': 'error',
    'unicorn/consistent-destructuring': 'off',
    'unicorn/consistent-function-scoping': [
      'error',
      { checkArrowFunctions: false },
    ],
    'unicorn/custom-error-definition': 'error',
    'unicorn/no-array-callback-reference': 'off',
    'unicorn/no-null': 'off',
    'unicorn/prefer-query-selector': 'off',
    'unicorn/prefer-ternary': ['error', 'only-single-line'],
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase',
        ignore: [
          /^-[\w-]+\.ts$/, // e.g. -testing.ts
        ],
      },
    ],
  },
  overrides: [
    // node files
    {
      files: [
        './.eslintrc.js',
        './.prettierrc.js',
        './.template-lintrc.js',
        './ember-cli-build.js',
        './testem.js',
        './blueprints/*/index.js',
        './config/**/*.js',
        './lib/*/index.js',
        './server/**/*.js',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      env: {
        browser: false,
        node: true,
      },
      extends: ['eslint:recommended', 'plugin:n/recommended', 'prettier'],
      rules: {
        'unicorn/prefer-module': 'off',
      },
    },
    // typescript files
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.lint.json',
      },
      plugins: ['ember', '@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:ember/recommended',
        'plugin:jsdoc/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
        'prettier',
      ],
      rules: {
        ...tsRules,
        ...tsTypeCheckRules,
      },
    },
    // gts files
    {
      files: ['*.gts'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        extraFileExtensions: ['.gts'],
        project: null,
      },
      plugins: ['ember', '@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:ember/recommended',
        'plugin:jsdoc/recommended',
        'plugin:@typescript-eslint/recommended',
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
        'prettier',
      ],
      rules: {
        ...tsRules,
        // Rules that require type checking don't work for gts files yet
        '@typescript-eslint/dot-notation': 0,
        '@typescript-eslint/no-base-to-string': 0,
        '@typescript-eslint/no-meaningless-void-operator': 0,
        '@typescript-eslint/no-throw-literal': 0,
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 0,
        '@typescript-eslint/no-unnecessary-condition': 0,
        '@typescript-eslint/no-unnecessary-type-arguments': 0,
        '@typescript-eslint/non-nullable-type-assertion-style': 0,
        '@typescript-eslint/prefer-includes': 0,
        '@typescript-eslint/prefer-nullish-coalescing': 0,
        '@typescript-eslint/prefer-reduce-type-parameter': 0,
        '@typescript-eslint/prefer-return-this-type': 0,
        '@typescript-eslint/prefer-string-starts-ends-with': 0,

        // Rules that are otherwise broken for gts
        '@typescript-eslint/class-literal-property-style': 0,
      },
    },
    {
      // test files
      files: ['tests/**/*-test.{js,ts}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.lint.json',
      },
      plugins: ['ember', '@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:ember/recommended',
        'plugin:jsdoc/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:@typescript-eslint/strict',
        'plugin:qunit/recommended',
        'prettier',
      ],
      rules: {
        ...tsRules,
        ...tsTypeCheckRules,
        'qunit/require-expect': 0,
        'qunit/no-conditional-assertions': 0,
      },
    },
  ],
};
