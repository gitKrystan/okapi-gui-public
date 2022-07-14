import { fillIn, render, TestContext } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

interface Context extends TestContext {
  state: State;
}

class State {
  @tracked value: number | null | undefined = null;
}

module('Integration | Component | input/number', function (hooks) {
  setupRenderingTest(hooks);

  [
    { initialValue: undefined, expectedInputValue: '' },
    { initialValue: null, expectedInputValue: '' },
    { initialValue: 1, expectedInputValue: '1' },
    { initialValue: 0, expectedInputValue: '0' },
    { initialValue: -1, expectedInputValue: '-1' },
    { initialValue: 42.36, expectedInputValue: '42.36' },
  ].forEach(({ initialValue, expectedInputValue }) => {
    test(`it renders an input with starting value ${String(
      initialValue
    )}`, async function (this: Context, assert) {
      this.state = new State();
      this.state.value = initialValue;

      await render(
        hbs`<Input::Number @value={{this.state.value}} @onChange={{fn (mut this.state.value)}} />`
      );

      assert.dom('input').hasValue(expectedInputValue).isValid();
      assert.strictEqual(
        this.state.value,
        initialValue,
        `state value is ${String(initialValue)}`
      );
    });
  });

  [
    { inputValue: '', expectedValue: null },
    { inputValue: '1', expectedValue: 1 },
    { inputValue: '0', expectedValue: 0 },
    { inputValue: '-1', expectedValue: -1 },
    { inputValue: '42.36', expectedValue: 42.36 },
    { inputValue: '1,000', expectedValue: 1000 },
  ].forEach(({ inputValue, expectedValue }) => {
    test(`it handles an input of ${String(
      inputValue
    )}`, async function (this: Context, assert) {
      this.state = new State();

      await render(
        hbs`<Input::Number @value={{this.state.value}} @onChange={{fn (mut this.state.value)}} />`
      );

      assert.dom('input').hasValue('', 'setup');

      await fillIn('input', inputValue);

      assert.dom('input').hasValue(inputValue).isValid();
      assert.strictEqual(
        this.state.value,
        expectedValue,
        `state value is ${String(expectedValue)}`
      );
    });
  });

  [
    { inputValue: 'hello' },
    { inputValue: '1hello' },
    { inputValue: 'hello1' },
    { inputValue: 'hel1lo' },
  ].forEach(({ inputValue }) => {
    test(`it handles an invalid value of ${String(
      inputValue
    )}`, async function (this: Context, assert) {
      this.state = new State();

      await render(
        hbs`<Input::Number @value={{this.state.value}} @onChange={{fn (mut this.state.value)}} />`
      );

      assert.dom('input').hasValue('', 'setup');

      await fillIn('input', inputValue);

      assert.dom('input').hasValue(inputValue).isNotValid();
      assert.strictEqual(this.state.value, null, 'state value is null');
    });
  });
});
