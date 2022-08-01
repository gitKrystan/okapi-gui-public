import { click, fillIn, triggerEvent, visit } from '@ember/test-helpers';
import Project from 'okapi/models/project';
import TestingServerService from 'okapi/services/server/-testing';
import { setupApplicationTest } from 'okapi/tests/helpers';
import { snapshotDarkMode } from 'okapi/tests/helpers/snapshot';
import { module, test } from 'qunit';

module('Acceptance | method info', function (hooks) {
  setupApplicationTest(hooks);

  test('it can call a method', async function (assert) {
    let server = this.owner.lookup('service:server') as TestingServerService;
    let project = Project.from({
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
          ],
        },
      ],
    });
    server.mockProjects([project]);
    server.mockMethodCallResponse((method, args) => {
      return {
        success: true,
        details: `Called ${method.name} with args ${JSON.stringify(args)}`,
      };
    });

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
      .isChecked()
      .hasAttribute('readonly');
    assert
      .dom('[data-test-param-input=Notify-response-details]')
      .hasValue(
        'Called Notify with args {"target":"#notifications","message":"Important message."}'
      )
      .hasAttribute('readonly');

    await snapshotDarkMode(assert, { suffix: '(filled in form)' });
  });

  test('it can can handle really long strings', async function (assert) {
    let server = this.owner.lookup('service:server') as TestingServerService;
    let project = Project.from({
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
                  name: 'message',
                  description: 'the body of the notification',
                  type: 'string',
                },
              ],
              response: [
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
    server.mockProjects([project]);
    server.mockMethodCallResponse((method, args) => {
      return {
        details: `Called ${method.name} with args ${JSON.stringify(args)}`,
      };
    });

    await visit('/Direwolf/provider/notifier-slack/api/Notifier');

    await click('[data-test-method-info-toggle-form-button]');

    await fillIn(
      '[data-test-param-input=Notify-request-message]',
      'Really really really really really really really really really really really really really really really really really really really really really really long important message.'
    );

    await click('[data-test-method-info-form] button[type="submit"]');

    assert
      .dom('[data-test-param-input=Notify-response-details]')
      .hasValue(
        'Called Notify with args {"message":"Really really really really really really really really really really really really really really really really really really really really really really long important message."}'
      )
      .hasAttribute('readonly');

    await snapshotDarkMode(assert, {
      suffix: '(filled in form with very long strings)',
    });
  });

  test('it can can handle numbers', async function (assert) {
    let server = this.owner.lookup('service:server') as TestingServerService;
    let project = Project.from({
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
                  name: 'count',
                  description: 'how many times the notification should happen',
                  type: 'number',
                },
              ],
              response: [
                {
                  name: 'details',
                  description: 'failure message or success info. may be blank',
                  type: 'string',
                },
                {
                  name: 'count',
                  description: 'how many times the notification happened',
                  type: 'number',
                },
              ],
            },
          ],
        },
      ],
    });
    server.mockProjects([project]);
    server.mockMethodCallResponse((method, args) => {
      return {
        count: args['count'],
        details: `Called ${method.name} with args ${JSON.stringify(args)}`,
      };
    });

    await visit('/Direwolf/provider/notifier-slack/api/Notifier');

    await click('[data-test-method-info-toggle-form-button]');

    // Include a Textarea also for Percy diffs to ensure it looks correct next
    // to a regular Input
    await fillIn(
      '[data-test-param-input=Notify-request-target]',
      '#notifications'
    );
    await fillIn('[data-test-param-input=Notify-request-count]', '42.6');

    await click('[data-test-method-info-form] button[type="submit"]');

    assert
      .dom('[data-test-param-input=Notify-response-count]')
      .hasValue('42.6')
      .hasAttribute('readonly');
    assert
      .dom('[data-test-param-input=Notify-response-details]')
      .hasValue(
        'Called Notify with args {"target":"#notifications","count":42.6}'
      )
      .hasAttribute('readonly');

    await snapshotDarkMode(assert, {
      suffix: '(filled in form numbers)',
    });
  });

  test('it can can handle enums', async function (assert) {
    let server = this.owner.lookup('service:server') as TestingServerService;
    let project = Project.from({
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
                  name: 'emoji',
                  description: 'emoji to display after the notification',
                  type: 'enum',
                  options: [
                    {
                      name: ':grimace:',
                      description: 'Perfect for awkward messages.',
                    },
                    {
                      name: ':joy:',
                      description: 'Perfect for hilarious messages.',
                    },
                  ],
                },
              ],
              response: [
                {
                  name: 'details',
                  description: 'failure message or success info. may be blank',
                  type: 'string',
                },
                {
                  name: 'emoji',
                  description: 'emoji displayed after the notification',
                  type: 'enum',
                  options: [
                    {
                      name: ':grimace:',
                      description: 'Perfect for awkward messages.',
                    },
                    {
                      name: ':joy:',
                      description: 'Perfect for hilarious messages.',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
    server.mockProjects([project]);
    server.mockMethodCallResponse((method, args) => {
      return {
        emoji: args['emoji'],
        details: `Called ${method.name} with args ${JSON.stringify(args)}`,
      };
    });

    await visit('/Direwolf/provider/notifier-slack/api/Notifier');

    await click('[data-test-method-info-toggle-form-button]');

    // Include a Textarea also for Percy diffs to ensure it looks correct next
    // to a regular Input
    await fillIn(
      '[data-test-param-input=Notify-request-target]',
      '#notifications'
    );
    await click('[data-test-param-input=Notify-request-emoji]');

    await snapshotDarkMode(assert, {
      suffix: '(dropdown open)',
      owner: this.owner, // so we don't dismiss when clicking toggle
    });

    await triggerEvent(
      '[data-test-enum-input-list] li:nth-child(1)',
      'mousemove'
    );

    await snapshotDarkMode(assert, {
      suffix: '(item hovered)',
      owner: this.owner, // so we don't dismiss when clicking toggle
    });

    await click('[data-test-enum-input-list] li:nth-child(1)');

    await click('[data-test-method-info-form] button[type="submit"]');

    assert
      .dom('[data-test-param-input=Notify-response-emoji]')
      .hasText(':grimace:');
    assert
      .dom('[data-test-param-input=Notify-response-details]')
      .hasValue(
        'Called Notify with args {"target":"#notifications","emoji":{"name":":grimace:","description":"Perfect for awkward messages."}}'
      )
      .hasAttribute('readonly');

    await snapshotDarkMode(assert, {
      suffix: '(filled in form enum)',
      owner: this.owner, // so we don't dismiss when clicking toggle
    });
  });
});
