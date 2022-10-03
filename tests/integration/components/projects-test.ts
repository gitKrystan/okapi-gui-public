import type { TestContext } from '@ember/test-helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Project from 'okapi/models/project';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

interface Context extends TestContext {
  projects: Project[];
}

module('Integration | Component | projects', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a list of projects', async function (this: Context, assert) {
    this.projects = [
      Project.from({ name: 'Direwolf', apis: [], providers: [], settings: [] }),
      Project.from({ name: 'Wiredolf', apis: [], providers: [], settings: [] }),
      Project.from({ name: 'Firewold', apis: [], providers: [], settings: [] }),
    ];
    await render<Context>(hbs`<Projects @projects={{this.projects}} />`);

    assert.dom().containsText('Projects');
    this.projects.forEach((p) => {
      assert.dom('[data-test-projects-list]').containsText(p.name);
    });
  });
});
