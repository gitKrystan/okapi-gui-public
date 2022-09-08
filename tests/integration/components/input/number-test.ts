import { fillIn, render, tab, TestContext } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'okapi/tests/helpers';
import inspect from 'okapi/utils/inspect';
import { module, test } from 'qunit';

interface Context extends TestContext {
  state: State;
}

class State {
  @tracked value: string | null | undefined = null;
}

module('Integration | Component | input/number', function (hooks) {
  setupRenderingTest(hooks);

  [
    { initialValue: undefined, finalValue: '' },
    { initialValue: null, finalValue: '' },
    { initialValue: '1', finalValue: '1' },
    { initialValue: '0', finalValue: '0' },
    { initialValue: '-1', finalValue: '-1' },
    { initialValue: '42.36', finalValue: '42.36' },
  ].forEach(({ initialValue, finalValue }) => {
    test(`it renders an input with starting value ${inspect(
      initialValue
    )}`, async function (this: Context, assert) {
      this.state = new State();
      this.state.value = initialValue;

      await render<Context>(
        hbs`<Input::Number @value={{this.state.value}} @onValueUpdate={{fn (mut this.state.value)}} />`
      );

      assert.dom('input').hasValue(finalValue);
      assert.strictEqual(
        this.state.value,
        initialValue,
        `state value is ${inspect(initialValue)}`
      );
    });
  });

  [
    { inputValue: '', immediateValue: '', finalValue: '' },
    { inputValue: '  ', immediateValue: '', finalValue: '' },
    { inputValue: '-', immediateValue: '-', finalValue: '' },
    { inputValue: '.', immediateValue: '.', finalValue: '' },
    { inputValue: '1', immediateValue: '1', finalValue: '1' },
    { inputValue: '0', immediateValue: '0', finalValue: '0' },
    { inputValue: '-1', immediateValue: '-1', finalValue: '-1' },
    { inputValue: '42.36', immediateValue: '42.36', finalValue: '42.36' },
    { inputValue: '1,000', immediateValue: '1000', finalValue: '1000' },
    { inputValue: 'hello', immediateValue: '', finalValue: '' },
    { inputValue: '1hello', immediateValue: '1', finalValue: '1' },
    { inputValue: 'hello1', immediateValue: '1', finalValue: '1' },
    { inputValue: 'hel1lo', immediateValue: '1', finalValue: '1' },
    { inputValue: '1.2.3', immediateValue: '1.23', finalValue: '1.23' },
  ].forEach(({ inputValue, immediateValue, finalValue }) => {
    test(`it handles an input of ${inspect(
      inputValue
    )}`, async function (this: Context, assert) {
      this.state = new State();

      await render<Context>(
        hbs`
          <Input::Number @value={{this.state.value}} @onValueUpdate={{fn (mut this.state.value)}} />
          <a href="#">Click outside</a>
        `
      );

      assert.dom('input').hasValue('', 'setup');

      await fillIn('input', inputValue);

      assert
        .dom('input')
        .hasValue(
          immediateValue,
          'immediate normalization removes non-numeric characters'
        );

      await tab();

      assert
        .dom('input')
        .hasValue(
          finalValue,
          'final normalization removes nonsensical characters'
        );
      assert.strictEqual(
        this.state.value,
        finalValue,
        `state value is ${inspect(finalValue)}`
      );
    });
  });
});
