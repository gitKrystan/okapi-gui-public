import { render, rerender } from '@ember/test-helpers';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import type TestingFeaturesService from 'okapi/services/features/-testing';
import type { Features } from 'okapi/services/features';
import { ExternalFeature } from 'okapi/services/features';

function getTestingFeatures(): Features {
  return {
    aFeature: new ExternalFeature("It's a feature!", {
      description: 'Not a bug',
    }),
  };
}

module('Integration | Component | flag', function (hooks) {
  setupRenderingTest(hooks);
  let testingFeaturesService: TestingFeaturesService;

  hooks.beforeEach(async function () {
    testingFeaturesService = this.owner.lookup(
      'service:features'
    ) as TestingFeaturesService;

    testingFeaturesService.overrideDefaultFeatures(getTestingFeatures);

    await render<Record<string, never>>(hbs`
      {{#flag "aFeature"}}
        Enabled
      {{else}}
        Disabled
      {{/flag}}
    `);
  });

  test('it renders else block content when a given flag is disabled', function (assert) {
    assert.dom().hasText('Disabled');
  });

  test('it renders default block content when a given flag is enabled', async function (assert) {
    testingFeaturesService.enable('aFeature');

    await rerender();

    assert.dom().hasText('Enabled');
  });
});
