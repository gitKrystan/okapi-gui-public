import { action } from '@ember/object';
import type { TestContext } from '@ember/test-helpers';
import { click, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import ProjectSetting from 'okapi/models/project-setting';
import { setupRenderingTest } from 'okapi/tests/helpers';
import ProjectSettingSearch from 'okapi/utils/project-setting-search';

interface Context extends TestContext {
  state: State;
}

class State {
  search = ProjectSettingSearch.from([
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

  settings: ProjectSetting[] = [];

  @action onCommit(item: ProjectSetting): void {
    this.settings.push(item);
  }
}

module(
  'Integration | Component | project-settings/settings-combobox',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (this: Context, assert) {
      this.state = new State();

      await render<Context>(
        hbs`
          <ProjectSettings::SettingsCombobox
            @search={{this.state.search}}
            @onCommit={{this.state.onCommit}}
          />
        `
      );

      assert.dom().hasText('Choose a setting to configure.');
      assert
        .dom('[data-test-settings-combobox] [data-test-combobox-listbox]')
        .doesNotExist();

      await click('[data-test-settings-combobox] [data-test-combobox-input]');

      assert
        .dom('[data-test-settings-combobox] [data-test-combobox-listbox]')
        .exists();

      await click(
        '[data-test-settings-combobox] [data-test-combobox-listbox] li:nth-child(1)'
      );

      assert
        .dom('[data-test-settings-combobox] [data-test-combobox-listbox]')
        .doesNotExist();
      assert.strictEqual(
        this.state.settings.length,
        1,
        'a setting was selected'
      );
    });
  }
);
