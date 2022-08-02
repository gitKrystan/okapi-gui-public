import { click, currentURL, visit } from '@ember/test-helpers';
import { getPageTitle } from 'ember-page-title/test-support';
import { module, test } from 'qunit';

import Project from 'okapi/models/project';
import TestingLocationService from 'okapi/services/location/-testing';
import TestingServerService from 'okapi/services/server/-testing';
import { setupApplicationTest } from 'okapi/tests/helpers';
import { snapshotDarkMode } from 'okapi/tests/helpers/snapshot';

let server: TestingServerService;
let projects: Project[];
let project: Project;

module('Acceptance | navigation', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    server = this.owner.lookup('service:server') as TestingServerService;
    project = Project.from({
      name: 'Direwolf',
      providers: [
        {
          id: 'notifier-slack',
          name: 'notifier-slack',
          apiIds: ['Notifier'],
        },
      ],
      apis: [
        {
          id: 'Notifier',
          name: 'Notifier',
          providerIds: ['notifier-slack'],
          methods: [
            {
              name: 'Notify',
              description: 'Notifies a target with a message.',
              request: [
                {
                  name: 'target',
                  description: 'the target to notify',
                  type: 'string',
                },
                {
                  name: 'message',
                  description: 'the body of the notification',
                  type: 'string',
                },
              ],
              response: [
                {
                  name: 'success',
                  description: 'whether the notification was successfully sent',
                  type: 'boolean',
                },
                {
                  name: 'details',
                  description: 'failure message or success info. may be blank',
                  type: 'string',
                },
              ],
            },
            {
              name: 'Mortify',
              description: 'Mortifies a target with a message.',
              request: [
                {
                  name: 'target',
                  description: 'the target to mortify',
                  type: 'string',
                },
                {
                  name: 'message',
                  description: 'the body of the mortification',
                  type: 'string',
                },
              ],
              response: [
                {
                  name: 'success',
                  description:
                    'whether the mortification was successfully mortifying',
                  type: 'boolean',
                },
                {
                  name: 'details',
                  description: 'failure message or success info. may be blank',
                  type: 'string',
                },
              ],
            },
          ],
        },
      ],
    });
    projects = [
      project,
      Project.from({ name: 'Wiredolf', providers: [], apis: [] }),
      Project.from({ name: 'Firewold', providers: [], apis: [] }),
    ];
    server.mockProjects(projects);
  });

  test('visiting /', async function (assert) {
    await visit('/');

    assert.strictEqual(currentURL(), '/');
    assert.strictEqual(getPageTitle(), 'Projects | Okapi');
    projects.forEach((p) => {
      assert.dom('[data-test-projects-list]').containsText(p.name);
    });

    await snapshotDarkMode(assert);

    await click('[data-test-projects-list] a');

    assert.strictEqual(currentURL(), '/Direwolf');
    assert.strictEqual(getPageTitle(), 'Direwolf | Okapi');
    assert.dom('[data-test-project-name]').hasText('Direwolf');
  });

  test('visiting /Direwolf', async function (assert) {
    await visit('/Direwolf');

    assert.strictEqual(currentURL(), '/Direwolf');
    assert.strictEqual(getPageTitle(), 'Direwolf | Okapi');
    assert.dom('[data-test-project-name]').hasText('Direwolf');
    project.providers.forEach((p) => {
      assert.dom('[data-test-providers-list]').containsText(p.name);
    });

    await snapshotDarkMode(assert);

    await click('[data-test-providers-list] a');

    assert.strictEqual(currentURL(), '/Direwolf/provider/notifier-slack');
    assert.strictEqual(getPageTitle(), 'notifier-slack | Direwolf | Okapi');
    assert.dom('[data-test-project-name]').hasText('Direwolf');
    assert.dom('[data-test-provider-name]').hasText('Provider: notifier-slack');
  });

  ['/Direwolf/provider', '/Direwolf/providers'].forEach((r) => {
    test(`visiting ${r} redirects to /Direwolf`, async function (assert) {
      await visit(r);

      assert.strictEqual(currentURL(), '/Direwolf');
      assert.strictEqual(getPageTitle(), 'Direwolf | Okapi');
      assert.dom('[data-test-project-name]').hasText('Direwolf');
      project.providers.forEach((p) => {
        assert.dom('[data-test-providers-list]').containsText(p.name);
      });
    });
  });

  test('visiting /Direwolf/provider/notifier-slack', async function (assert) {
    await visit('/Direwolf/provider/notifier-slack');

    assert.strictEqual(currentURL(), '/Direwolf/provider/notifier-slack');
    assert.strictEqual(getPageTitle(), 'notifier-slack | Direwolf | Okapi');
    assert.dom('[data-test-project-name]').hasText('Direwolf');
    assert.dom('[data-test-provider-name]').hasText('Provider: notifier-slack');
    project.providers[0]?.apiIds.forEach((a) => {
      let api = project.findApiOrError(a);
      assert.dom('[data-test-apis-list]').containsText(api.name);
    });

    await snapshotDarkMode(assert);

    await click('[data-test-apis-list] a');

    assert.strictEqual(
      currentURL(),
      '/Direwolf/provider/notifier-slack/api/Notifier'
    );
    assert.strictEqual(
      getPageTitle(),
      'Notifier | notifier-slack | Direwolf | Okapi'
    );
    assert.dom('[data-test-project-name]').hasText('Direwolf');
    assert.dom('[data-test-provider-name]').hasText('Provider: notifier-slack');
    assert.dom('[data-test-api-name]').hasText('API: Notifier');
  });

  [
    '/Direwolf/provider/notifier-slack/api',
    '/Direwolf/provider/notifier-slack/apis',
  ].forEach((r) => {
    test(`visiting ${r} redirects to /Direwolf/provider/notifier-slack`, async function (assert) {
      await visit(r);

      assert.strictEqual(currentURL(), '/Direwolf/provider/notifier-slack');
      assert.strictEqual(getPageTitle(), 'notifier-slack | Direwolf | Okapi');
      assert.dom('[data-test-project-name]').hasText('Direwolf');
      assert
        .dom('[data-test-provider-name]')
        .hasText('Provider: notifier-slack');
      project.providers[0]?.apiIds.forEach((a) => {
        let api = project.findApiOrError(a);
        assert.dom('[data-test-apis-list]').containsText(api.name);
      });
    });
  });

  test('visiting /Direwolf/provider/notifier-slack/api/Notifier', async function (assert) {
    await visit('/Direwolf/provider/notifier-slack/api/Notifier');

    assert.strictEqual(
      currentURL(),
      '/Direwolf/provider/notifier-slack/api/Notifier'
    );
    assert.strictEqual(
      getPageTitle(),
      'Notifier | notifier-slack | Direwolf | Okapi'
    );
    assert.dom('[data-test-project-name]').hasText('Direwolf');
    assert.dom('[data-test-provider-name]').hasText('Provider: notifier-slack');
    assert.dom('[data-test-api-name]').hasText('API: Notifier');
    project.apis[0]?.methods.forEach((m) => {
      assert.dom('[data-test-methods-list]').containsText(m.name);
    });
    assert.dom('[data-test-method-info]').exists({ count: 2 });
    assert.dom('[data-test-method-info=Notify]').doesNotHaveAttribute('hidden');
    assert
      .dom('[data-test-method-info=Mortify]')
      .doesNotHaveAttribute('hidden');

    await snapshotDarkMode(assert);

    await click('[data-test-methods-list] a#Mortify');

    assert.strictEqual(
      currentURL(),
      '/Direwolf/provider/notifier-slack/api/Notifier',
      'the URL did not change'
    );
    let location = this.owner.lookup(
      'service:location'
    ) as TestingLocationService;
    assert.strictEqual(location.id, 'Mortify');
    assert.dom('[data-test-method-info=Notify]').doesNotHaveAttribute('hidden');
    assert
      .dom('[data-test-method-info=Mortify]')
      .doesNotHaveAttribute('hidden');

    await click('[data-test-method-toggle-collapse=Mortify]');

    assert.dom('[data-test-method-info=Notify]').doesNotHaveAttribute('hidden');
    assert.dom('[data-test-method-info=Mortify]').hasAttribute('hidden');

    await snapshotDarkMode(assert, { suffix: '(with collapsed method)' });
  });

  test('visiting /Direwolf/provider/notifier-slack/api/Notifier#Mortify', async function (assert) {
    let location = this.owner.lookup(
      'service:location'
    ) as TestingLocationService;
    location.id = 'Mortify';
    await visit('/Direwolf/provider/notifier-slack/api/Notifier');

    assert.strictEqual(
      currentURL(),
      '/Direwolf/provider/notifier-slack/api/Notifier'
    );
    assert.strictEqual(
      getPageTitle(),
      'Notifier | notifier-slack | Direwolf | Okapi'
    );
    assert.dom('[data-test-project-name]').hasText('Direwolf');
    assert.dom('[data-test-provider-name]').hasText('Provider: notifier-slack');
    assert.dom('[data-test-api-name]').hasText('API: Notifier');
    project.apis[0]?.methods.forEach((m) => {
      assert.dom('[data-test-methods-list]').containsText(m.name);
    });
    assert.dom('[data-test-method-info=Notify]').doesNotHaveAttribute('hidden');
    assert
      .dom('[data-test-method-info=Mortify]')
      .doesNotHaveAttribute('hidden');
  });

  test('visiting /not-found', async function (assert) {
    await visit('/not-found');

    assert.strictEqual(currentURL(), '/not-found');
    assert.strictEqual(getPageTitle(), 'Oops | Okapi');
    assert
      .dom('[data-test-route-error-message]')
      .hasText('Could not find project "not-found."');

    await snapshotDarkMode(assert);
  });

  test('visiting /Direwolf/provider/not-found', async function (assert) {
    await visit('/Direwolf/provider/not-found');

    assert.strictEqual(currentURL(), '/Direwolf/provider/not-found');
    assert.strictEqual(getPageTitle(), 'Oops | Direwolf | Okapi');
    assert
      .dom('[data-test-route-error-message]')
      .hasText('Could not find provider "not-found."');

    await snapshotDarkMode(assert);
  });

  test('visiting /Direwolf/provider/notifier-slack/api/not-found', async function (assert) {
    await visit('/Direwolf/provider/notifier-slack/api/not-found');

    assert.strictEqual(
      currentURL(),
      '/Direwolf/provider/notifier-slack/api/not-found'
    );
    assert.strictEqual(
      getPageTitle(),
      'Oops | notifier-slack | Direwolf | Okapi'
    );
    assert
      .dom('[data-test-route-error-message]')
      .hasText('Could not find api "not-found."');

    await snapshotDarkMode(assert);
  });

  test('visiting /not-found/not-found', async function (assert) {
    // Note: Just /not-found will hit the "I can't find this project error."
    await visit('/not-found/not-found');

    assert.strictEqual(currentURL(), '/not-found/not-found');
    assert.strictEqual(getPageTitle(), 'Not found | Okapi');
    assert
      .dom('[data-test-route-error-message]')
      .hasText("I can't find this page: not-found/not-found");

    await snapshotDarkMode(assert);
  });
});
