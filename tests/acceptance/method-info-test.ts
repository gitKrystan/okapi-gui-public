import { click, fillIn, visit } from '@ember/test-helpers';
import Project from 'okapi/models/project';
import TestingServerService from 'okapi/services/server/-testing';
import { setupApplicationTest } from 'okapi/tests/helpers';
import { snapshotDarkMode } from 'okapi/tests/helpers/snapshot';
import { module, test } from 'qunit';

let server: TestingServerService;
let projects: Project[];
let project: Project;

module('Acceptance | method info', function (hooks) {
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
    projects = [project];
    server.mockProjects(projects);
  });

  test('it can call a method', async function (assert) {
    await visit('/Direwolf/provider/notifier-slack/api/Notifier');

    await click('[data-test-method-info-toggle-form-button]');

    await snapshotDarkMode(assert, { suffix: '(blank form)' });

    await fillIn(
      '[data-test-param-input=Notify-request-target]',
      '#notifications'
    );
    await fillIn(
      '[data-test-param-input=Notify-request-message]',
      'Important message.'
    );

    await click('[data-test-method-info-form] button[type="submit"]');

    assert
      .dom('[data-test-param-input=Notify-response-success]')
      .hasValue('true')
      .hasAttribute('readonly');
    assert
      .dom('[data-test-param-input=Notify-response-details]')
      .hasValue(
        'Called Notify with args {"target":"#notifications","message":"Important message."}'
      )
      .hasAttribute('readonly');

    await snapshotDarkMode(assert, { suffix: '(filled in form)' });
  });
});
