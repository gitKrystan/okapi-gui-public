import type { TestContext } from '@ember/test-helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import ProjectSetting from 'okapi/models/project-setting';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { mockProject } from 'okapi/tests/helpers/mocks';

interface Context extends TestContext {
  state: State;
}

class State {
  project = mockProject({ name: 'Direwolf' });

  allSettings = Object.freeze([
    new ProjectSetting({
      name: 'Vault Schema Migration',
      id: 'experimental.vault.schema_version',
      description: 'Desired vault schema version.',
      type: 'enum',
      options: [
        { name: '1.0', description: 'The first version.' },
        { name: '2.0', description: 'The second version.' },
      ],
    }),
  ]);
}

module('Integration | Component | project-settings', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (this: Context, assert) {
    this.state = new State();

    await render<Context>(hbs`
      <ProjectSettings
        @project={{this.state.project}}
        @settings={{this.state.allSettings}}
      />
    `);

    assert.dom().hasText('Choose a setting to configure.');
  });
});
