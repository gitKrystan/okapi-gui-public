import type { TestContext } from '@ember/test-helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import Api from 'okapi/models/api';
import { setupRenderingTest } from 'okapi/tests/helpers';

interface Context extends TestContext {
  apis: Api[];
}

module('Integration | Component | apis', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a list of apis', async function (this: Context, assert) {
    this.apis = [
      Api.from({
        id: 'Notifier',
        name: 'Notifier',
        providerIds: ['notifier-slack'],
        methods: [],
      }),
    ];

    await render<Context>(hbs`<Apis @apis={{this.apis}} />`);

    assert.dom().containsText('APIs');
    assert.dom().containsText('Notifier');
  });
});
