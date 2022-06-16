import { render, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Provider from 'okapi/models/provider';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

interface Context extends TestContext {
  provider: Provider;
}

module('Integration | Component | apis', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a list of apis', async function (this: Context, assert) {
    this.provider = Provider.from({
      name: 'notifier-slack',
      apis: [{ name: 'Notifier', methods: [] }],
    });
    await render(hbs`<Apis @provider={{this.provider}} />`);

    assert.dom().containsText('APIs');
    assert.dom().containsText('Notifier');
  });
});
