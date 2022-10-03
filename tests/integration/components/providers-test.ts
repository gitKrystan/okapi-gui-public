import type { TestContext } from '@ember/test-helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Project from 'okapi/models/project';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

interface Context extends TestContext {
  project: Project;
}

module('Integration | Component | providers', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a list of providers', async function (this: Context, assert) {
    this.project = Project.from({
      name: "Krystan's App",
      apis: [],
      providers: [
        { id: 'notifier-slack', name: 'notifier-slack', apiIds: [] },
        { id: 'notifier-email', name: 'notifier-email', apiIds: [] },
      ],
      settings: [],
    });
    await render<Context>(hbs`<Providers @project={{this.project}} />`);

    assert.dom().containsText('Providers');
    assert.dom().containsText('notifier-slack');
    assert.dom().containsText('notifier-email');
  });
});
