import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'okapi/tests/helpers';
import TestingServerService from 'okapi/services/server/-testing';
import Project from 'okapi/models/project';

let server: TestingServerService;
let projects: Project[];

module('Acceptance | index', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    server = this.owner.lookup('service:server') as TestingServerService;
    projects = [
      Project.from({
        name: 'Direwolf',
        providers: [{ name: 'What goes here?', apiMethods: [] }],
      }),
      Project.from({ name: 'Wiredolf', providers: [] }),
      Project.from({ name: 'Firewold', providers: [] }),
    ];
    server.mockProjects(projects);
  });

  test('visiting /', async function (assert) {
    await visit('/');

    assert.strictEqual(currentURL(), '/');
    projects.forEach((p) => {
      assert.dom('[data-test-projects-list]').containsText(p.name);
    });

    await click('[data-test-projects-list] a');

    assert.strictEqual(currentURL(), '/Direwolf');
    assert.dom('[data-test-project-name]').hasText('Direwolf');
  });

  test('visiting /Direwolf', async function (assert) {
    await visit('/Direwolf');

    assert.strictEqual(currentURL(), '/Direwolf');
    assert.dom('[data-test-project-name]').hasText('Direwolf');

    await click('[data-test-providers-list] a');

    assert.strictEqual(
      currentURL(),
      '/Direwolf/provider/What%20goes%20here%3F'
    );

    assert.dom('[data-test-project-name]').hasText('Direwolf');
    assert
      .dom('[data-test-provider-name]')
      .hasText('Provider Name: What goes here?');
  });
});
