import { action } from '@ember/object';
import { click, render, rerender, TestContext } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

class State {
  @tracked current = false;

  @action setCurrent(value: boolean): void {
    this.current = value;
  }
}

interface Context extends TestContext {
  state: State;
  assertState(
    value: boolean,
    message: string,
    options?: { onText: string; offText: string }
  ): void;
}

module('Integration | Component | switch', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: Context, assert) {
    this.state = new State();
    this.assertState = (
      value: boolean,
      message: string,
      { onText, offText } = { onText: 'on', offText: 'off' }
    ): void => {
      assert.strictEqual(
        this.state.current,
        value,
        `${message}: state is correct`
      );
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
      <Switch @value={{this.state.current}} @onToggle={{this.state.setCurrent}} />
    `);

    assert.dom('[data-test-switch-label]').doesNotExist();
    this.assertState(false, 'test setup');

    await click('button');
    await rerender();

    this.assertState(true, 'after click');
  });

  test('it renders named blocks', async function (this: Context, assert) {
    await render(hbs`
      <Switch @value={{this.state.current}} @onToggle={{this.state.setCurrent}}>
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
    await rerender();

    this.assertState(true, 'after click', {
      onText: 'beastly',
      offText: 'humanly',
    });
  });
});
