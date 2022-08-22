import { action } from '@ember/object';
import { click, render, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import ProjectSetting from 'okapi/models/project-setting';
import { setupRenderingTest } from 'okapi/tests/helpers';

interface Context extends TestContext {
  state: State;
}

class State {
  settings: ProjectSetting[] = [];

  @action onSelect(item: ProjectSetting): void {
    this.settings.push(item);
  }
}

module(
  'Integration | Component | project-settings/settings-combobox',
  function (hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function (this: Context, assert) {
      this.state = new State();

      await render(
        hbs`<ProjectSettings::SettingsCombobox @onSelect={{this.state.onSelect}} />`
      );

      assert.dom().hasText('');
      assert.dom('[data-test-listbox-item-list]').doesNotExist();

      await click('[data-test-settings-combobox-button]');

      assert.dom('[data-test-listbox-item-list]').exists();

      await click('[data-test-listbox-item-list] li:nth-child(1)');

      assert.dom('[data-test-listbox-item-list]').doesNotExist();
      assert.strictEqual(
        this.state.settings.length,
        1,
        'a setting was selected'
      );
    });
  }
);
