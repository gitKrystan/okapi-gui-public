import { click, render, TestContext } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

interface Context extends TestContext {
  state: boolean;
  setState(value: boolean): void;
  assertState(
    value: boolean,
    message: string,
    options?: { onText: string; offText: string }
  ): void;
}

module('Integration | Component | switch', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: Context, assert) {
    this.state = false;
    this.setState = (value: boolean): void => {
      this.set('state', value);
    };
    this.assertState = (
      value: boolean,
      message: string,
      { onText, offText } = { onText: 'on', offText: 'off' }
    ): void => {
      assert.strictEqual(this.state, value, `${message}: state is correct`);
      assert
        .dom('button')
        .hasAttribute('role', 'switch', `${message}: role is correct`)
        .hasAria(
          'checked',
          String(value),
          `${message}: aria-checked is correct`
        );
      assert
        .dom('[data-test-switch-option]')
        .hasText(value ? onText : offText, `${message}: has correct text`)
        .doesNotContainText(
          value ? offText : onText,
          `${message}: has correct text`
        );
    };
  });

  test('it renders an on/off switch by default', async function (this: Context, assert) {
    await render(hbs`
      <Switch @value={{this.state}} @onToggle={{this.setState}} />
    `);

    assert.dom('[data-test-switch-label]').doesNotExist();
    this.assertState(false, 'test setup');

    await click('button');

    this.assertState(true, 'after click');
  });

  test('it renders named blocks', async function (this: Context, assert) {
    await render(hbs`
      <Switch @value={{this.state}} @onToggle={{this.setState}}>
        <:label>Beast mode:</:label>
        <:on>beastly</:on>
        <:off>humanly</:off>
      </Switch>
    `);

    assert.dom('[data-test-switch-label]').hasText('Beast mode:');
    this.assertState(false, 'test setup', {
      onText: 'beastly',
      offText: 'humanly',
    });

    await click('button');

    this.assertState(true, 'after click', {
      onText: 'beastly',
      offText: 'humanly',
    });
  });
});
