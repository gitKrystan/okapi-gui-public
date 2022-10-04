import { module, test } from 'qunit';

import Project from 'okapi/models/project';
import type TestingServerService from 'okapi/services/server/-testing';
import { setupTest } from 'okapi/tests/helpers';
import { mockProject } from 'okapi/tests/helpers/mocks';

let service: TestingServerService;

module('Unit | Service | server', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    service = this.owner.lookup('service:server') as TestingServerService;
  });

  test('.getProjectList returns an array of projects', async function (assert) {
    let mocks = [
      mockProject({ name: 'Direwolf' }),
      mockProject({ name: 'Wiredolf' }),
      mockProject({ name: 'Firewold' }),
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
