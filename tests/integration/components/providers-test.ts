import type { TestContext } from '@ember/test-helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import type Project from 'okapi/models/project';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { mockProject } from 'okapi/tests/helpers/mocks';

interface Context extends TestContext {
  project: Project;
}

module('Integration | Component | providers', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a list of providers', async function (this: Context, assert) {
    this.project = mockProject({
      name: "Krystan's App",
      providers: [
        { id: 'notifier-slack', name: 'notifier-slack', apiIds: [] },
        { id: 'notifier-email', name: 'notifier-email', apiIds: [] },
      ],
    });
    await render<Context>(hbs`<Providers @project={{this.project}} />`);

    assert.dom().containsText('Providers');
    assert.dom().containsText('notifier-slack');
    assert.dom().containsText('notifier-email');
  });
});
