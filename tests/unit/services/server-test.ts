import Project from 'okapi/models/project';
import type TestingServerService from 'okapi/services/server/-testing';
import { setupTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

let service: TestingServerService;

module('Unit | Service | server', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:server') as TestingServerService;
  });

  test('.getProjectList returns an array of projects', async function (assert) {
    let mocks = [
      Project.from({ name: 'Direwolf', apis: [], providers: [], settings: [] }),
      Project.from({ name: 'Wiredolf', apis: [], providers: [], settings: [] }),
      Project.from({ name: 'Firewold', apis: [], providers: [], settings: [] }),
    ];

    service.mockProjects(mocks);

    let projects = await service.getProjectList();

    projects.forEach((p) => assert.true(p instanceof Project));
    assert.deepEqual(
      projects.map((p) => p.name),
      mocks.map((p) => p.name)
    );
  });
});
