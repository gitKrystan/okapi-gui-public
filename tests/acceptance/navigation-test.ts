import { click, currentURL, visit } from '@ember/test-helpers';
import { getPageTitle } from 'ember-page-title/test-support';
import Project from 'okapi/models/project';
import TestingServerService from 'okapi/services/server/-testing';
import { setupApplicationTest } from 'okapi/tests/helpers';
import { snapshotDarkMode } from 'okapi/tests/helpers/snapshot';
import { module, test } from 'qunit';

let server: TestingServerService;
let projects: Project[];

module('Acceptance | navigation', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(function () {
    server = this.owner.lookup('service:server') as TestingServerService;
    projects = [
      Project.from({
        name: 'Direwolf',
        providers: [
          {
            name: 'notifier-slack',
            apis: [
              {
                name: 'Notifier',
                methods: [
                  {
                    name: 'Notify',
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
                        description:
                          'whether the notification was successfully sent',
                        type: 'boolean',
                      },
                      {
                        name: 'details',
                        description:
                          'failure message or success info. may be blank',
                        type: 'string',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      }),
      Project.from({ name: 'Wiredolf', providers: [] }),
      Project.from({ name: 'Firewold', providers: [] }),
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
    projects[0]?.providers.forEach((p) => {
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
      projects[0]?.providers.forEach((p) => {
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
    projects[0]?.providers[0]?.apis.forEach((a) => {
      assert.dom('[data-test-apis-list]').containsText(a.name);
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
      projects[0]?.providers[0]?.apis.forEach((a) => {
        assert.dom('[data-test-apis-list]').containsText(a.name);
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
    projects[0]?.providers[0]?.apis[0]?.methods.forEach((m) => {
      assert.dom('[data-test-methods-list]').containsText(m.name);
    });

    await snapshotDarkMode(assert);

    await click('[data-test-methods-list] a');

    assert.strictEqual(
      currentURL(),
      '/Direwolf/provider/notifier-slack/api/Notifier/method/Notify'
    );
    assert.strictEqual(
      getPageTitle(),
      'Notify | Notifier | notifier-slack | Direwolf | Okapi'
    );
    assert.dom('[data-test-project-name]').hasText('Direwolf');
    assert.dom('[data-test-provider-name]').hasText('Provider: notifier-slack');
    assert.dom('[data-test-api-name]').hasText('API: Notifier');
    assert.dom('[data-test-method-name]').hasText('Method: Notify');
  });

  [
    '/Direwolf/provider/notifier-slack/api/Notifier/method',
    '/Direwolf/provider/notifier-slack/api/Notifier/methods',
  ].forEach((r) => {
    test(`visiting ${r} redirects to /Direwolf/provider/notifier-slack/api/Notifier`, async function (assert) {
      await visit(r);

      assert.strictEqual(
        currentURL(),
        '/Direwolf/provider/notifier-slack/api/Notifier'
      );
      assert.strictEqual(
        getPageTitle(),
        'Notifier | notifier-slack | Direwolf | Okapi'
      );
      assert.dom('[data-test-project-name]').hasText('Direwolf');
      assert
        .dom('[data-test-provider-name]')
        .hasText('Provider: notifier-slack');
      assert.dom('[data-test-api-name]').hasText('API: Notifier');
      projects[0]?.providers[0]?.apis[0]?.methods.forEach((m) => {
        assert.dom('[data-test-methods-list]').containsText(m.name);
      });
    });
  });

  test('visiting /Direwolf/provider/notifier-slack/api/Notifier/method/Notify', async function (assert) {
    await visit('/Direwolf/provider/notifier-slack/api/Notifier/method/Notify');

    assert.strictEqual(
      currentURL(),
      '/Direwolf/provider/notifier-slack/api/Notifier/method/Notify'
    );
    assert.strictEqual(
      getPageTitle(),
      'Notify | Notifier | notifier-slack | Direwolf | Okapi'
    );
    assert.dom('[data-test-project-name]').hasText('Direwolf');
    assert.dom('[data-test-provider-name]').hasText('Provider: notifier-slack');
    assert.dom('[data-test-api-name]').hasText('API: Notifier');
    assert.dom('[data-test-method-name]').hasText('Method: Notify');

    await snapshotDarkMode(assert);
  });

  test('visiting /not-found', async function (assert) {
    await visit('/not-found');

    assert.strictEqual(currentURL(), '/not-found');
    assert.strictEqual(getPageTitle(), 'Oops | Okapi');
    assert
      .dom('[data-test-not-found-message]')
      .hasText('Could not find project "not-found."');

    await snapshotDarkMode(assert);
  });

  test('visiting /Direwolf/provider/not-found', async function (assert) {
    await visit('/Direwolf/provider/not-found');

    assert.strictEqual(currentURL(), '/Direwolf/provider/not-found');
    assert.strictEqual(getPageTitle(), 'Oops | Okapi');
    assert
      .dom('[data-test-not-found-message]')
      .hasText('Could not find provider "not-found" for project "Direwolf."');

    await snapshotDarkMode(assert);
  });

  test('visiting /Direwolf/provider/notifier-slack/api/not-found', async function (assert) {
    await visit('/Direwolf/provider/notifier-slack/api/not-found');

    assert.strictEqual(
      currentURL(),
      '/Direwolf/provider/notifier-slack/api/not-found'
    );
    assert.strictEqual(getPageTitle(), 'Oops | Okapi');
    assert
      .dom('[data-test-not-found-message]')
      .hasText(
        'Could not find provider "notifier-slack" api "not-found" for project "Direwolf."'
      );

    await snapshotDarkMode(assert);
  });

  test('visiting /Direwolf/provider/notifier-slack/api/Notifier/method/not-found', async function (assert) {
    await visit(
      '/Direwolf/provider/notifier-slack/api/Notifier/method/not-found'
    );

    assert.strictEqual(
      currentURL(),
      '/Direwolf/provider/notifier-slack/api/Notifier/method/not-found'
    );
    assert.strictEqual(getPageTitle(), 'Oops | Okapi');
    assert
      .dom('[data-test-not-found-message]')
      .hasText(
        'Could not find method `Notifier#not-found` for provider "notifier-slack" and project "Direwolf."'
      );

    await snapshotDarkMode(assert);
  });

  test('visiting /not-found/not-found', async function (assert) {
    // Note: Just /not-found will hit the "I can't find this project error."
    await visit('/not-found/not-found');

    assert.strictEqual(currentURL(), '/not-found/not-found');
    assert.strictEqual(getPageTitle(), 'Not found | Okapi');
    assert
      .dom('[data-test-not-found-message]')
      .hasText("I can't find this page: not-found/not-found");

    await snapshotDarkMode(assert);
  });
});
