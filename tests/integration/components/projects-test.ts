import type { TestContext } from '@ember/test-helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import type Project from 'okapi/models/project';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { mockProject } from 'okapi/tests/helpers/mocks';
import { ProjectStatus } from 'okapi/models/project';

interface Context extends TestContext {
  projects: Project[];
}

module('Integration | Component | projects', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders a list of projects', async function (this: Context, assert) {
    this.projects = [
      mockProject({ name: 'StartingApp', status: ProjectStatus.Starting }),
      mockProject({ name: 'StartedApp', status: ProjectStatus.Started }),
      mockProject({ name: 'StoppingApp', status: ProjectStatus.Stopping }),
      mockProject({ name: 'StoppedApp', status: ProjectStatus.Stopped }),
    ];
    await render<Context>(hbs`
      <Symbols />
      <Projects @projects={{this.projects}} />
    `);

    assert.dom().containsText('Projects');
    for (const p of this.projects) {
      assert.dom('[data-test-projects-list]').containsText(p.name);
      assert.dom(`[data-test-project-status=${p.id}]`).hasText(p.status);
    }
  });
});
