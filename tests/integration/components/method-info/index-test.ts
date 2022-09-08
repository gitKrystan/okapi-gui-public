import { assert as emberAssert } from '@ember/debug';
import {
  render,
  findAll,
  TestContext,
  fillIn,
  click,
} from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import Method from 'okapi/models/method';
import TestingServerService from 'okapi/services/server/-testing';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

interface Context extends TestContext {
  state: State;
}

class State {
  constructor(readonly method: Method) {}

  @tracked isActive = false;
}

module('Integration | Component | method-info', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders information about a method', async function (this: Context, assert) {
    this.state = new State(
      Method.from({
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
      })
    );

    await render<Context>(
      hbs`<MethodInfo @method={{this.state.method}} @isActive={{this.state.isActive}} />`
    );

    assert
      .dom('[data-test-method-info-description]')
      .containsText(this.state.method.description);

    let requestParamItems = findAll(
      '[data-test-request-params] [data-test-method-param-list-item]'
    );
    emberAssert(
      'wrong number of params',
      requestParamItems.length === this.state.method.request.length
    );
    requestParamItems.forEach((p, i) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let request = this.state.method.request[i]!;
      assert.dom(p).includesText(request.name);
      assert.dom(p).includesText(request.type);
      assert.dom(p).includesText(request.description);
    });

    let responseParamItems = findAll(
      '[data-test-response-params] [data-test-method-param-list-item]'
    );
    emberAssert(
      'wrong number of params',
      responseParamItems.length === this.state.method.response.length
    );
    responseParamItems.forEach((p, i) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      let response = this.state.method.response[i]!;
      assert.dom(p).includesText(response.name);
      assert.dom(p).includesText(response.type);
      assert.dom(p).includesText(response.description);
    });
  });

  module('method calls', function () {
    test('it handles a string input and response', async function (this: Context, assert) {
      let server = this.owner.lookup('service:server') as TestingServerService;
      server.mockMethodCallResponse((method, args) => {
        return {
          details: `Called ${method.name} with args ${JSON.stringify(args)}`,
        };
      });

      this.state = new State(
        Method.from({
          name: 'Notify',
          description: 'Notifies a target with a message.',
          request: [
            {
              name: 'target',
              description: 'the target to notify',
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
        })
      );
      this.state.isActive = true;

      await render<Context>(
        hbs`<MethodInfo @method={{this.state.method}} @isActive={{this.state.isActive}} />`
      );

      await fillIn(
        '[data-test-request-params] [data-test-method-param-list-item="target"] textarea',
        '#notifications'
      );
      await click('[data-test-method-info-submit-button]');

      assert
        .dom(
          '[data-test-response-params] [data-test-method-param-list-item="details"] textarea'
        )
        .hasValue('Called Notify with args {"target":"#notifications"}')
        .hasAttribute('readonly');
    });

    test('it handles a boolean input and response', async function (this: Context, assert) {
      let server = this.owner.lookup('service:server') as TestingServerService;
      server.mockMethodCallResponse(() => ({ success: true }));

      this.state = new State(
        Method.from({
          name: 'Notify',
          description: 'Notifies a target with a message.',
          request: [
            {
              name: 'shouldNotify',
              description: 'should it notify?',
              type: 'boolean',
            },
          ],
          response: [
            {
              name: 'success',
              description: 'did it work?',
              type: 'boolean',
            },
          ],
        })
      );
      this.state.isActive = true;

      await render<Context>(
        hbs`<MethodInfo @method={{this.state.method}} @isActive={{this.state.isActive}} />`
      );

      await click(
        '[data-test-request-params] [data-test-method-param-list-item="shouldNotify"] input'
      );
      await click('[data-test-method-info-submit-button]');

      assert
        .dom(
          '[data-test-response-params] [data-test-method-param-list-item="success"] input'
        )
        .isChecked()
        .hasAttribute('readonly');
    });
  });
});
