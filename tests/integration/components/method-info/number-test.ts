import { fillIn, render, TestContext } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import { NumberParam } from 'okapi/models/method-call/index';
import { setupRenderingTest } from 'okapi/tests/helpers';
import { module, test } from 'qunit';

interface Context extends TestContext {
  state: State;
}

class State {
  readonly id = 'an-id';

  readonly param = new NumberParam({
    type: 'number',
    name: 'A number',
    description: 'It is a number',
  });

  @tracked readonly readonly = false;
}

module('Integration | Component | method-info/input/number', function (hooks) {
  setupRenderingTest(hooks);

  [
    { initialValue: undefined, expectedInputValue: '' },
    { initialValue: 1, expectedInputValue: '1' },
    { initialValue: 0, expectedInputValue: '0' },
    { initialValue: -1, expectedInputValue: '-1' },
    { initialValue: 42.36, expectedInputValue: '42.36' },
  ].forEach(({ initialValue, expectedInputValue }) => {
    test(`it renders an input with starting value ${String(
      initialValue
    )}`, async function (this: Context, assert) {
      this.state = new State();
      this.state.param.value = initialValue;

      await render(
        hbs`<MethodInfo::Inputs::Number @id={{this.state.id}} @param={{this.state.param}} @readonly={{this.state.readonly}} />`
      );

      assert.dom('input').hasValue(expectedInputValue);
      assert.true(this.state.param.validate(), 'param is valid');
      assert.strictEqual(
        this.state.param.value,
        initialValue,
        `state value is ${String(initialValue)}`
      );
    });
  });

  [
    { inputValue: '', expectedValue: undefined },
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
        hbs`<MethodInfo::Inputs::Number @id={{this.state.id}} @param={{this.state.param}} @readonly={{this.state.readonly}} />`
      );

      assert.dom('input').hasValue('', 'setup');

      await fillIn('input', inputValue);

      assert.dom('input').hasValue(inputValue).isValid();
      assert.strictEqual(
        this.state.param.value,
        expectedValue,
        `state value is ${String(expectedValue)}`
      );
    });
  });

  [
    { inputValue: 'hello', expectedValue: NaN },
    { inputValue: '1hello', expectedValue: 1 },
    { inputValue: 'hello1', expectedValue: 1 },
    { inputValue: 'hel1lo', expectedValue: 1 },
  ].forEach(({ inputValue, expectedValue }) => {
    test(`it handles an invalid value of ${String(
      inputValue
    )}`, async function (this: Context, assert) {
      this.state = new State();

      await render(
        hbs`<MethodInfo::Inputs::Number @id={{this.state.id}} @param={{this.state.param}} @readonly={{this.state.readonly}} />`
      );

      assert.dom('input').hasValue('', 'setup');

      await fillIn('input', inputValue);

      assert.false(this.state.param.validate(), 'param is invalid');
      assert.deepEqual(
        this.state.param.value,
        expectedValue,
        'state value is correct'
      );
    });
  });
});
