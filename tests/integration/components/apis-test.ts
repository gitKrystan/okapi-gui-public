import { render, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Api from 'okapi/models/api';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

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

    await render(hbs`<Apis @apis={{this.apis}} />`);

    assert.dom().containsText('APIs');
    assert.dom().containsText('Notifier');
  });
});
