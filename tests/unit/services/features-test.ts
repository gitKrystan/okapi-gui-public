import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { Features, ExternalFeature } from 'okapi/services/features';
import TestingFeaturesService from 'okapi/services/features/-testing';

function getTestingFeatures(): Features {
  return {
    slice: new ExternalFeature('Adds slicing', {
      description: 'It slices!',
    }),
    dice: new ExternalFeature('Adds dicing', {
      description: 'It dices!',
    }),
    laundry: new ExternalFeature('Automates a dreaded chore', {
      description: 'It even does your laundry!',
    }),
  };
}

let featuresService: TestingFeaturesService;

module('Unit | Service | feature-flags', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    featuresService = this.owner.lookup(
      'service:features'
    ) as TestingFeaturesService;

    featuresService.overrideDefaultFeatures(getTestingFeatures);
  });

  test('enables, disables, and toggles a feature flag', function (assert) {
    assert.false(featuresService.isEnabled('slice'));

    featuresService.enable('slice');
    assert.true(featuresService.isEnabled('slice'));

    featuresService.disable('slice');
    assert.false(featuresService.isEnabled('slice'));

    featuresService.toggle('slice');
    assert.true(featuresService.isEnabled('slice'));

    featuresService.toggle('slice');
    assert.false(featuresService.isEnabled('slice'));
  });

  test('can reset all the feature flags', function (assert) {
    assert.false(featuresService.isEnabled('slice'));

    featuresService.enable('dice');
    assert.true(featuresService.isEnabled('dice'));

    featuresService.enable('laundry');
    assert.true(featuresService.isEnabled('laundry'));

    featuresService.reset();
    assert.false(featuresService.isEnabled('slice'));
    assert.false(featuresService.isEnabled('dice'));
    assert.false(featuresService.isEnabled('laundry'));
  });

  test('does not enable an unknown feature flag', function (assert) {
    assert.false(Object.keys(featuresService.flags).includes('unknownFeature'));

    featuresService.enable('unknownFeature');
    assert.false(featuresService.isEnabled('unknownFeature'));
  });
});
