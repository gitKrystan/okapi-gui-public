import {
  click,
  currentURL,
  fillIn,
  triggerKeyEvent,
  visit,
} from '@ember/test-helpers';
import { module, test } from 'qunit';

import Project from 'okapi/models/project';
import ProjectSetting from 'okapi/models/project-setting';
import type TestingServerService from 'okapi/services/server/-testing';
import { setupApplicationTest } from 'okapi/tests/helpers';
import { snapshotDarkMode } from 'okapi/tests/helpers/snapshot';

let server: TestingServerService;
let projects: Project[];
let project: Project;

module('Acceptance | project settings', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    server = this.owner.lookup('service:server') as TestingServerService;
    project = Project.from({
      name: 'Direwolf',
      providers: [],
      apis: [],
      settings: [],
    });
    projects = [project];
    server.mockProjects(projects);
    server.mockSettings([
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
      new ProjectSetting({
        name: 'Autoscale',
        id: 'servers.scaling.autoscale',
        description: 'Scale things automagically.',
        type: 'boolean',
      }),
      new ProjectSetting({
        name: 'Russian Invasion',
        id: 'invasions.foreign.russian',
        description:
          'How wide to open a door for large-scale Russian invasion.',
        type: 'u32',
      }),
      new ProjectSetting({
        name: 'Favorite Setting',
        id: 'misc.settings.favorite',
        description: 'Name your favorite setting.',
        type: 'string',
      }),
    ]);
  });

  test('it allows settings selection', async function (assert) {
    await visit('/Direwolf/settings');

    assert.strictEqual(currentURL(), '/Direwolf/settings');

    assert
      .dom('[data-test-settings-combobox] [data-test-combobox-listbox]')
      .doesNotExist();

    await fillIn(
      '[data-test-settings-combobox] [data-test-combobox-input]',
      'e'
    );

    await triggerKeyEvent(
      '[data-test-settings-combobox] [data-test-combobox-input]',
      'keydown',
      'ArrowDown'
    );

    assert
      .dom('[data-test-settings-combobox] [data-test-combobox-listbox]')
      .exists();
    assert
      .dom(
        '[data-test-settings-combobox] [data-test-combobox-listbox] li:first-child'
      )
      .hasAria('selected', 'true');

    await snapshotDarkMode(assert, {
      owner: this.owner, // so we don't dismiss when clicking toggle
      suffix: '(dropdown open)',
    });

    await click(
      '[data-test-settings-combobox] [data-test-combobox-listbox] li:nth-child(1)'
    );

    assert
      .dom('[data-test-settings-combobox] [data-test-combobox-listbox]')
      .doesNotExist();

    assert
      .dom('[data-test-project-settings-list]')
      .containsText('Vault Schema Migration');

    assert
      .dom(
        '[data-test-project-settings-list] [data-test-project-settings-input="experimental.vault.schema_version"]'
      )
      .isFocused();

    await triggerKeyEvent(
      '[data-test-settings-combobox] [data-test-combobox-input]',
      'keydown',
      'ArrowDown'
    );

    await triggerKeyEvent(
      '[data-test-settings-combobox] [data-test-combobox-input]',
      'keydown',
      'Enter'
    );

    assert
      .dom(
        '[data-test-project-settings-list] [data-test-project-settings-input="servers.scaling.autoscale"]'
      )
      .isFocused();

    await triggerKeyEvent(
      '[data-test-settings-combobox] [data-test-combobox-input]',
      'keydown',
      'ArrowDown'
    );

    await triggerKeyEvent(
      '[data-test-settings-combobox] [data-test-combobox-input]',
      'keydown',
      'Enter'
    );

    assert
      .dom(
        '[data-test-project-settings-list] [data-test-project-settings-input="invasions.foreign.russian"]'
      )
      .isFocused();

    await triggerKeyEvent(
      '[data-test-settings-combobox] [data-test-combobox-input]',
      'keydown',
      'ArrowDown'
    );

    await triggerKeyEvent(
      '[data-test-settings-combobox] [data-test-combobox-input]',
      'keydown',
      'Enter'
    );

    assert
      .dom(
        '[data-test-project-settings-list] [data-test-project-settings-input="misc.settings.favorite"]'
      )
      .isFocused();

    assert
      .dom(
        '[data-test-project-settings-list] [data-test-project-settings-input]'
      )
      .exists({ count: 4 });

    await triggerKeyEvent(
      '[data-test-settings-combobox] [data-test-combobox-input]',
      'keydown',
      'ArrowDown'
    );

    await snapshotDarkMode(assert, {
      suffix: '(after selection)',
    });
  });
});
