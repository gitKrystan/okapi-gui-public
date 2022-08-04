import { fillIn, render, tab, TestContext } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import { NumberMethodParam } from 'okapi/models/method';
import { NumberParam } from 'okapi/models/method-call/index';
import { setupRenderingTest } from 'okapi/tests/helpers';
import inspect from 'okapi/utils/inspect';
import { module, test } from 'qunit';

interface Context extends TestContext {
  state: State;
}

type TestCase = {
  inputValue: string;
  value: number | undefined;
  expectedErrors: string[];
};

class State {
  readonly id = 'an-id';

  readonly param: NumberParam;

  @tracked readonly readonly = false;

  constructor(type: NumberMethodParam['type']) {
    this.param = new NumberParam({
      type,
      name: 'A number',
      description: 'It is a number',
    });
  }
}

const IntegerError = 'Value must be an integer';
const NegativeError = 'Value cannot be negative';

module('Integration | Component | method-info/input/number', function (hooks) {
  setupRenderingTest(hooks);

  itHandlesValueInput('f32', [
    { inputValue: '', value: undefined, expectedErrors: [] },
    { inputValue: '  ', value: undefined, expectedErrors: [] },
    { inputValue: '-', value: undefined, expectedErrors: [] },
    { inputValue: '.', value: undefined, expectedErrors: [] },
    { inputValue: '1', value: 1, expectedErrors: [] },
    { inputValue: '0', value: 0, expectedErrors: [] },
    { inputValue: '-1', value: -1, expectedErrors: [] },
    { inputValue: '42.36', value: 42.36, expectedErrors: [] },
    { inputValue: '1,000', value: 1000, expectedErrors: [] },
    { inputValue: 'hello', value: undefined, expectedErrors: [] },
    { inputValue: '1hello', value: 1, expectedErrors: [] },
    { inputValue: 'hello1', value: 1, expectedErrors: [] },
    { inputValue: 'hel1lo', value: 1, expectedErrors: [] },
    { inputValue: '42.36.78', value: 42.3678, expectedErrors: [] },
  ]);

  itHandlesValueInput('i32', [
    { inputValue: '', value: undefined, expectedErrors: [] },
    { inputValue: '  ', value: undefined, expectedErrors: [] },
    { inputValue: '-', value: undefined, expectedErrors: [] },
    { inputValue: '.', value: undefined, expectedErrors: [] },
    { inputValue: '1', value: 1, expectedErrors: [] },
    { inputValue: '0', value: 0, expectedErrors: [] },
    { inputValue: '-1', value: -1, expectedErrors: [] },
    { inputValue: '42.36', value: 42.36, expectedErrors: [IntegerError] },
    { inputValue: '1,000', value: 1000, expectedErrors: [] },
    { inputValue: 'hello', value: undefined, expectedErrors: [] },
    { inputValue: '1hello', value: 1, expectedErrors: [] },
    { inputValue: 'hello1', value: 1, expectedErrors: [] },
    { inputValue: 'hel1lo', value: 1, expectedErrors: [] },
    {
      inputValue: '42.36.78',
      value: 42.3678,
      expectedErrors: [IntegerError],
    },
  ]);

  itHandlesValueInput('u32', [
    { inputValue: '', value: undefined, expectedErrors: [] },
    { inputValue: '  ', value: undefined, expectedErrors: [] },
    { inputValue: '-', value: undefined, expectedErrors: [] },
    { inputValue: '.', value: undefined, expectedErrors: [] },
    { inputValue: '1', value: 1, expectedErrors: [] },
    { inputValue: '0', value: 0, expectedErrors: [] },
    { inputValue: '-1', value: -1, expectedErrors: [NegativeError] },
    { inputValue: '42.36', value: 42.36, expectedErrors: [IntegerError] },
    { inputValue: '1,000', value: 1000, expectedErrors: [] },
    { inputValue: 'hello', value: undefined, expectedErrors: [] },
    { inputValue: '1hello', value: 1, expectedErrors: [] },
    { inputValue: 'hello1', value: 1, expectedErrors: [] },
    { inputValue: 'hel1lo', value: 1, expectedErrors: [] },
    {
      inputValue: '42.36.78',
      value: 42.3678,
      expectedErrors: [IntegerError],
    },
  ]);
});

function itHandlesValueInput(
  type: NumberMethodParam['type'],
  cases: TestCase[]
): void {
  module(type, function () {
    cases.forEach(({ inputValue, value, expectedErrors }) => {
      test(`it handles an input of ${inspect(
        inputValue
      )}`, async function (this: Context, assert) {
        this.state = new State(type);

        await render(
          hbs`
            <MethodInfo::Validator @param={{this.state.param}} as |validator|>
              <MethodInfo::Inputs::Number
                @id={{this.state.id}}
                @param={{this.state.param}}
                @readonly={{this.state.readonly}}
                {{validator}}
              />
            </MethodInfo::Validator>
            <a href="#">Click outside</a>
          `
        );

        assert.dom('input').hasValue('', 'setup');

        await fillIn('input', inputValue);
        await tab();

        assert
          .dom('input')
          .hasValue(typeof value === 'number' ? value.toString() : '');
        assert.deepEqual([...this.state.param.errorSet], expectedErrors);
        assert.strictEqual(
          this.state.param.value,
          value,
          `state value is ${inspect(value)}`
        );
      });
    });
  });
}
