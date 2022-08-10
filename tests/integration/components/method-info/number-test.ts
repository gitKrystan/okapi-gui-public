import { fillIn, render, tab, TestContext } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import { NumberMethodParam } from 'okapi/models/method';
import { NumberParam } from 'okapi/models/method-call/index';
import { setupRenderingTest } from 'okapi/tests/helpers';
import inspect from 'okapi/utils/inspect';
import { module, test } from 'qunit';

const MAX_8 = 127;
const MIN_8 = -128;

const MAX_16 = 32_767;
const MIN_16 = -32_768;

const MAX_32 = 2_147_483_647;
const MIN_32 = -2_147_483_648;

// eslint-disable-next-line @typescript-eslint/no-loss-of-precision
const MAX_64 = 9_223_372_036_854_775_807;
const MIN_64 = -9_223_372_036_854_775_808;

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
    { inputValue: MAX_32.toLocaleString(), value: MAX_32, expectedErrors: [] },
    {
      inputValue: (MAX_32 + 1).toLocaleString(),
      value: MAX_32 + 1,
      expectedErrors: [],
    },
    { inputValue: MIN_32.toLocaleString(), value: MIN_32, expectedErrors: [] },
    {
      inputValue: (MIN_32 - 1).toLocaleString(),
      value: MIN_32 - 1,
      expectedErrors: [],
    },
  ]);

  itHandlesValueInput('f64', [
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
    {
      inputValue: MAX_64.toLocaleString(),
      value: MAX_64,
      expectedErrors: ['Value is too large to be handled by JavaScript 😬'],
    },
    {
      inputValue: (MAX_64 + 1).toLocaleString(),
      value: MAX_64 + 1,
      expectedErrors: ['Value is too large to be handled by JavaScript 😬'],
    },
    {
      inputValue: MIN_64.toLocaleString(),
      value: MIN_64,
      expectedErrors: ['Value is too small to be handled by JavaScript 😬'],
    },
    {
      inputValue: (MIN_64 - 1).toLocaleString(),
      value: MIN_64 - 1,
      expectedErrors: ['Value is too small to be handled by JavaScript 😬'],
    },
  ]);

  itHandlesValueInput('i8', [
    { inputValue: '', value: undefined, expectedErrors: [] },
    { inputValue: '  ', value: undefined, expectedErrors: [] },
    { inputValue: '-', value: undefined, expectedErrors: [] },
    { inputValue: '.', value: undefined, expectedErrors: [] },
    { inputValue: '1', value: 1, expectedErrors: [] },
    { inputValue: '0', value: 0, expectedErrors: [] },
    { inputValue: '-1', value: -1, expectedErrors: [] },
    { inputValue: '42.36', value: 42.36, expectedErrors: [IntegerError] },
    {
      inputValue: '1,000',
      value: 1000,
      expectedErrors: [
        `Value exceeds maximum of ${MAX_8.toLocaleString()} for type i8`,
      ],
    },
    { inputValue: 'hello', value: undefined, expectedErrors: [] },
    { inputValue: '1hello', value: 1, expectedErrors: [] },
    { inputValue: 'hello1', value: 1, expectedErrors: [] },
    { inputValue: 'hel1lo', value: 1, expectedErrors: [] },
    {
      inputValue: '42.36.78',
      value: 42.3678,
      expectedErrors: [IntegerError],
    },
    { inputValue: MAX_8.toLocaleString(), value: MAX_8, expectedErrors: [] },
    {
      inputValue: (MAX_8 + 1).toLocaleString(),
      value: MAX_8 + 1,
      expectedErrors: [
        `Value exceeds maximum of ${MAX_8.toLocaleString()} for type i8`,
      ],
    },
    { inputValue: MIN_8.toLocaleString(), value: MIN_8, expectedErrors: [] },
    {
      inputValue: (MIN_8 - 1).toLocaleString(),
      value: MIN_8 - 1,
      expectedErrors: [
        `Value is less than the minimum of ${MIN_8.toLocaleString()} for type i8`,
      ],
    },
  ]);

  itHandlesValueInput('i16', [
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
    { inputValue: MAX_16.toLocaleString(), value: MAX_16, expectedErrors: [] },
    {
      inputValue: (MAX_16 + 1).toLocaleString(),
      value: MAX_16 + 1,
      expectedErrors: [
        `Value exceeds maximum of ${MAX_16.toLocaleString()} for type i16`,
      ],
    },
    { inputValue: MIN_16.toLocaleString(), value: MIN_16, expectedErrors: [] },
    {
      inputValue: (MIN_16 - 1).toLocaleString(),
      value: MIN_16 - 1,
      expectedErrors: [
        `Value is less than the minimum of ${MIN_16.toLocaleString()} for type i16`,
      ],
    },
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
    { inputValue: MAX_32.toLocaleString(), value: MAX_32, expectedErrors: [] },
    {
      inputValue: (MAX_32 + 1).toLocaleString(),
      value: MAX_32 + 1,
      expectedErrors: [
        `Value exceeds maximum of ${MAX_32.toLocaleString()} for type i32`,
      ],
    },
    { inputValue: MIN_32.toLocaleString(), value: MIN_32, expectedErrors: [] },
    {
      inputValue: (MIN_32 - 1).toLocaleString(),
      value: MIN_32 - 1,
      expectedErrors: [
        `Value is less than the minimum of ${MIN_32.toLocaleString()} for type i32`,
      ],
    },
  ]);

  itHandlesValueInput('i64', [
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
    {
      inputValue: MAX_64.toLocaleString(),
      value: MAX_64,
      expectedErrors: ['Value is too large to be handled by JavaScript 😬'],
    },
    {
      inputValue: (MAX_64 + 1).toLocaleString(),
      value: MAX_64 + 1,
      expectedErrors: ['Value is too large to be handled by JavaScript 😬'],
    },
    {
      inputValue: MIN_64.toLocaleString(),
      value: MIN_64,
      expectedErrors: ['Value is too small to be handled by JavaScript 😬'],
    },
    {
      inputValue: (MIN_64 - 1).toLocaleString(),
      value: MIN_64 - 1,
      expectedErrors: ['Value is too small to be handled by JavaScript 😬'],
    },
  ]);

  itHandlesValueInput('u8', [
    { inputValue: '', value: undefined, expectedErrors: [] },
    { inputValue: '  ', value: undefined, expectedErrors: [] },
    { inputValue: '-', value: undefined, expectedErrors: [] },
    { inputValue: '.', value: undefined, expectedErrors: [] },
    { inputValue: '1', value: 1, expectedErrors: [] },
    { inputValue: '0', value: 0, expectedErrors: [] },
    { inputValue: '-1', value: -1, expectedErrors: [NegativeError] },
    { inputValue: '42.36', value: 42.36, expectedErrors: [IntegerError] },
    {
      inputValue: '1,000',
      value: 1000,
      expectedErrors: [
        `Value exceeds maximum of ${MAX_8.toLocaleString()} for type u8`,
      ],
    },
    { inputValue: 'hello', value: undefined, expectedErrors: [] },
    { inputValue: '1hello', value: 1, expectedErrors: [] },
    { inputValue: 'hello1', value: 1, expectedErrors: [] },
    { inputValue: 'hel1lo', value: 1, expectedErrors: [] },
    {
      inputValue: '42.36.78',
      value: 42.3678,
      expectedErrors: [IntegerError],
    },
    { inputValue: MAX_8.toLocaleString(), value: MAX_8, expectedErrors: [] },
    {
      inputValue: (MAX_8 + 1).toLocaleString(),
      value: MAX_8 + 1,
      expectedErrors: [
        `Value exceeds maximum of ${MAX_8.toLocaleString()} for type u8`,
      ],
    },
    {
      inputValue: MIN_8.toLocaleString(),
      value: MIN_8,
      expectedErrors: ['Value cannot be negative'],
    },
    {
      inputValue: (MIN_8 - 1).toLocaleString(),
      value: MIN_8 - 1,
      expectedErrors: ['Value cannot be negative'],
    },
  ]);

  itHandlesValueInput('u16', [
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
    { inputValue: MAX_16.toLocaleString(), value: MAX_16, expectedErrors: [] },
    {
      inputValue: (MAX_16 + 1).toLocaleString(),
      value: MAX_16 + 1,
      expectedErrors: [
        `Value exceeds maximum of ${MAX_16.toLocaleString()} for type u16`,
      ],
    },
    {
      inputValue: MIN_16.toLocaleString(),
      value: MIN_16,
      expectedErrors: ['Value cannot be negative'],
    },
    {
      inputValue: (MIN_16 - 1).toLocaleString(),
      value: MIN_16 - 1,
      expectedErrors: ['Value cannot be negative'],
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
    { inputValue: MAX_32.toLocaleString(), value: MAX_32, expectedErrors: [] },
    {
      inputValue: (MAX_32 + 1).toLocaleString(),
      value: MAX_32 + 1,
      expectedErrors: [
        `Value exceeds maximum of ${MAX_32.toLocaleString()} for type u32`,
      ],
    },
    {
      inputValue: MIN_32.toLocaleString(),
      value: MIN_32,
      expectedErrors: ['Value cannot be negative'],
    },
    {
      inputValue: (MIN_32 - 1).toLocaleString(),
      value: MIN_32 - 1,
      expectedErrors: ['Value cannot be negative'],
    },
  ]);

  itHandlesValueInput('u64', [
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
    {
      inputValue: MAX_64.toLocaleString(),
      value: MAX_64,
      expectedErrors: ['Value is too large to be handled by JavaScript 😬'],
    },
    {
      inputValue: (MAX_64 + 1).toLocaleString(),
      value: MAX_64 + 1,
      expectedErrors: ['Value is too large to be handled by JavaScript 😬'],
    },
    {
      inputValue: MIN_64.toLocaleString(),
      value: MIN_64,
      expectedErrors: [
        'Value cannot be negative',
        'Value is too small to be handled by JavaScript 😬',
      ],
    },
    {
      inputValue: (MIN_64 - 1).toLocaleString(),
      value: MIN_64 - 1,
      expectedErrors: [
        'Value cannot be negative',
        'Value is too small to be handled by JavaScript 😬',
      ],
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
