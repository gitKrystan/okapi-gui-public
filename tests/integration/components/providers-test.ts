import { render, TestContext } from '@ember/test-helpers';
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
      providers: [
        { name: 'What goes here?', apiMethods: [] },
        { name: '2 What goes here?', apiMethods: [] },
      ],
    });
    await render(hbs`<Providers @project={{this.project}} />`);

    assert.dom().containsText('Providers');
    assert.dom().containsText('What goes here?');
    assert.dom().containsText('2 What goes here?');
  });
});
