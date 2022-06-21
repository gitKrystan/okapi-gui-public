import { render, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Api from 'okapi/models/api';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

interface Context extends TestContext {
  api: Api;
}

module('Integration | Component | methods', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a list of methods', async function (this: Context, assert) {
    this.api = Api.from({
      name: 'Notifier',
      methods: [
        {
          name: 'Notify',
          request: [
            {
              name: 'target',
              description: 'the target to notify',
              type: 'string',
            },
            {
              name: 'message',
              description: 'the body of the notification',
              type: 'string',
            },
          ],
          response: [
            {
              name: 'success',
              description: 'whether the notification was successfully sent',
              type: 'boolean',
            },
            {
              name: 'details',
              description: 'failure message or success info. may be blank',
              type: 'string',
            },
          ],
        },
      ],
    });
    await render(hbs`<Methods @api={{this.api}} />`);

    assert.dom().containsText('Methods');
    assert.dom().containsText('Notify');
  });
});
