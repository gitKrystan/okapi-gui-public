'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');

const postcssSass = require('@csstools/postcss-sass');
const autoprefixer = require('autoprefixer');
const postcssClean = require('postcss-clean');
const postcssScss = require('postcss-scss');

const parseFlag = require('./config/parse-flag');

const env = EmberApp.env();

module.exports = function (defaults) {
  let postcssFilters = [{ module: autoprefixer }];

  if (parseFlag('MINIFY_CSS', env === 'production')) {
    // No `enabled` option available
    postcssFilters.push({
      module: postcssClean,
      options: {
        relativeTo: 'assets',
        // Set because of https://github.com/jakubpawlowicz/clean-css/issues/632
        // In general, I think if we're doing remote imports, we don't want to include during build anyway.
        processImport: false,
      },
    });
  }

  const app = new EmberApp(defaults, {
    postcssOptions: {
      compile: {
        extension: 'scss',
        enabled: true,
        parser: postcssScss,
        plugins: [
          {
            module: postcssSass,
            options: {
              outputStyle: 'expanded',
            },
          },
        ],
      },
      filter: {
        enabled: true,
        plugins: postcssFilters,
      },
    },
  });

  app.import('node_modules/sanitize.css/sanitize.css');
  app.import('node_modules/sanitize.css/forms.css');
  app.import('node_modules/sanitize.css/assets.css');
  app.import('node_modules/sanitize.css/reduce-motion.css');
  app.import('node_modules/sanitize.css/system-ui.css');
  app.import('node_modules/sanitize.css/ui-monospace.css');

  // Use `app.import` to add additional libraries to the generated
  // output files.
  //
  // If you need to use different assets in different
  // environments, specify an object as the first parameter. That
  // object's keys should be the environment name and the values
  // should be the asset to use in that environment.
  //
  // If the library that you are including contains AMD or ES6
  // modules that you would like to import into your application
  // please specify an object with the list of modules as keys
  // along with the exports of each module as its value.

  const { Webpack } = require('@embroider/webpack');
  return require('@embroider/compat').compatBuild(app, Webpack, {
    skipBabel: [
      {
        package: 'qunit',
      },
    ],
  });
};
