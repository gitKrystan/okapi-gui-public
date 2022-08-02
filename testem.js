'use strict';

module.exports = {
  test_page: process.env.CI
    ? 'tests/index.html?devmode'
    : 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: ['Chrome'],
  launch_in_dev: ['Chrome'],
  browser_start_timeout: 120,
  browser_args: {
    Chrome: {
      ci: [
        // --no-sandbox is needed when running Chrome inside a container
        process.env.CI ? '--no-sandbox' : null,
        '--headless',
        '--disable-dev-shm-usage',
        '--disable-software-rasterizer',
        '--mute-audio',
        '--remote-debugging-port=0',
        '--window-size=1440,900',

        // We do this to make sure there is no scrollbar in `#ember-testing-container` which
        // could throw our Percy snapshots off. However, this has the downside of hiding
        // unintentional scrollbars. Since many of us develop on Macs where scrollbars aren't
        // visible, the risk is somewhat increased.
        '--hide-scrollbars',
      ].filter(Boolean),
    },
  },
};
