import { click, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';

import Project from 'okapi/models/project';
import TestingServerService from 'okapi/services/server/-testing';
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
    });
    projects = [project];
    server.mockProjects(projects);
  });

  test('it allows settings selection', async function (assert) {
    await visit('/Direwolf/settings');

    assert.strictEqual(currentURL(), '/Direwolf/settings');

    assert.dom('[data-test-listbox-item-list]').doesNotExist();

    await click('[data-test-settings-combobox-button]');

    assert.dom('[data-test-listbox-item-list]').exists();

    await snapshotDarkMode(assert, {
      owner: this.owner, // so we don't dismiss when clicking toggle
      suffix: '(dropdown open)',
    });

    await click('[data-test-listbox-item-list] li:nth-child(1)');

    assert.dom('[data-test-listbox-item-list]').doesNotExist();

    assert
      .dom('[data-test-project-settings-list]')
      .containsText('Vault Schema Migration');

    await snapshotDarkMode(assert, {
      suffix: '(after selection)',
    });
  });
});
