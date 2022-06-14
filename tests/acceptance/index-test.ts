import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
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
      new Project('Direwolf'),
      new Project('Wiredolf'),
      new Project('Firewold'),
    ];
    server.mockProjects(projects);
  });

  test('visiting /', async function (assert) {
    await visit('/');

    assert.strictEqual(currentURL(), '/');
    projects.forEach((p) => {
      assert.dom('[data-test-projects-list]').containsText(p.name);
    });
  });
});
