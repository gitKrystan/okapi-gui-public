import { assert as emberAssert } from '@ember/debug';
import { action } from '@ember/object';
import {
  find,
  findAll,
  focus,
  render,
  rerender,
  tab,
  TestContext,
} from '@ember/test-helpers';
import triggerKeyEvent, {
  KeyModifiers,
} from '@ember/test-helpers/dom/trigger-key-event';
import { tracked } from '@glimmer/tracking';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

import inspect from 'okapi/utils/inspect';
import {
  fireInputEvent,
  pointerClick,
} from 'okapi/tests/helpers/dom-interaction';

interface Context<T extends { id: string } = { id: string }>
  extends TestContext {
  state: State<T>;
}

const trigger = '[data-test-combobox-button]';
const input = '[data-test-combobox-input]';
const list = '[data-test-combobox-listbox]';
const listItems = '[data-test-combobox-listbox] li';
const selectedItem = '[data-test-combobox-listbox] [aria-selected="true"]';
const outside = '#outside';

class State<T extends { id: string } = { id: string }> {
  constructor(private assert: Assert, readonly options: T[]) {}

  @tracked autocomplete?: 'none' | 'list' | 'inline' | 'both';

  @tracked caseSensitive?: boolean;

  @tracked committed: T | null = null;

  @action handleCommit(item: T): void {
    this.committed = item;
    let { expectedCommit } = this;
    if (expectedCommit === false) {
      this.assert.ok(false, `Unexpectedly committed item ${inspect(item)}`);
    } else if (expectedCommit === null) {
      this.assert.strictEqual(
        this.committed,
        expectedCommit,
        'Null was committed'
      );
    } else {
      this.assert.strictEqual(
        this.committed,
        this.getOption(expectedCommit),
        `Item at index ${expectedCommit} was committed`
      );
    }
  }

  async expectCommit(n: number | null, callback: Promise<void>): Promise<void> {
    this.expectedCommit = n;
    await callback;
    this.expectedCommit = false;

    if (n === null) {
      assertInput(this.assert, '');
    } else {
      assertInput(this.assert, this.getOption(n).id);
    }
  }

  private expectedCommit: number | null | false = false;

  private getOption(n: number): T {
    let option = this.options[n];
    emberAssert(`could not find option at n=${n}`, option);
    return option;
  }
}

module('Integration | Component | combobox/with-input', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function (this: Context, assert) {
    this.state = new State(assert, [
      { id: 'Aardvark' },
      { id: 'Ant' },
      { id: 'Zebra' },
    ]);

    await render(hbs`
      <a id="outside" href="#">Click Outside</a>
      <Combobox::WithInput
        @options={{this.state.options}}
        @onCommit={{this.state.handleCommit}}
        @autocomplete={{this.state.autocomplete}}
        @caseSensitive={{this.state.caseSensitive}}
      >
        <:label>
          Committed: {{or this.state.committed.id "NULL"}}
        </:label>
        <:options as |option|>
          {{option.id}}
        </:options>
      </Combobox::WithInput>
    `);
  });

  module('autocomplete=none', function () {
    module('when starting CLOSED, WITHOUT input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');
        });

        test('it can be toggled via Enter', async function (this: Context, assert) {
          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Enter opens list; list is unfiltered');
          assertSelection(assert, null, 'Enter selects no item');
          assertInput(assert, '');

          await this.state.expectCommit(null, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist('Enter again closes list');
        });

        test('it can be opened via ArrowDown; subsequent ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowDown opens list; list is unfiltered');
          assertSelection(assert, 0, 'ArrowDown selects first item');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 1, 'ArrowDown selects next item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 2, 'ArrowDown selects next item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowDown+altKey; subsequent ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowDown+altKey opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp; subsequent ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowUp opens list; list is unfiltered');
          assertSelection(assert, 2, 'ArrowUp selects last item');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 1, 'ArrowUp selects previous item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 0, 'ArrowUp selects previous item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp cycles back to last item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp+altKey; subsequent ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowUp+altKey opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened and filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "A" opens list; list is unfiltered'
            );
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'A');

          await fireInputEvent(input, 'An');

          assertSelection(assert, 1, 'Input of "An" selects second item');
          assertInput(assert, 'An');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, 'And');

          await fireInputEvent(input, '');

          assertSelection(assert, null, 'Input of "" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, '');
        });

        test('it can be opened and filtered via input (case insensitive)', async function (this: Context, assert) {
          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "a" opens list; list is unfiltered'
            );
          assertSelection(assert, 0, 'Input of "a" selects first item');
          assertInput(assert, 'a');

          await fireInputEvent(input, 'an');

          assertSelection(assert, 1, 'Input of "an" selects second item');
          assertInput(assert, 'an');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await fireInputEvent(input, 'and');

          assertSelection(assert, null, 'Input of "and" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, 'and');

          await fireInputEvent(input, '');

          assertSelection(assert, null, 'Input of "" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, '');
        });

        test('it can be opened and filtered via input (case sensitive)', async function (this: Context, assert) {
          this.state.caseSensitive = true;
          await rerender();

          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "a" opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'Input of "a" has no matches');
          assertInput(assert, 'a');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');
        });

        test('it can be opened via input click', async function (this: Context, assert) {
          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, null, 'Input click makes no selection');
          assertInput(assert, '');
        });

        test('it can be opened via trigger click', async function (this: Context, assert) {
          await pointerClick(trigger);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, null, 'Input click makes no selection');
          assertInput(assert, '');
        });
      });
    });

    module('when starting CLOSED, WITH input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await fireInputEvent(input, 'An');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input of "An" opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'SETUP: Input of "An" selects second item'
          );
          assertInput(assert, 'An');

          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist('SETUP: List closed after Escape');
        });

        test('it can be toggled via Enter', async function (this: Context, assert) {
          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Enter opens list; list is unfiltered');
          assertSelection(assert, 1, 'Selection does not change');
          assertInput(assert, 'An');

          await this.state.expectCommit(1, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist('Enter again closes list');
        });

        test('it can be opened via ArrowDown; subsequent ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowDown opens list; list is unfiltered');
          assertSelection(assert, 2, 'ArrowDown selects next item');
          assertInput(assert, 'An');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, 'An');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowDown+altKey; subsequent ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowDown+altKey opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'ArrowDown+altKey does not change selection'
          );
          assertInput(assert, 'An');

          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(
            assert,
            1,
            'ArrowDown+altKey does not change selection'
          );
          assertInput(assert, 'An');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp; subsequent ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowUp opens list; list is unfiltered');
          assertSelection(assert, 0, 'ArrowUp selects previous item');
          assertInput(assert, 'An');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp cycles back to last item');
          assertInput(assert, 'An');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp+altKey; subsequent ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowUp+altKey opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'ArrowUp+altKey does not change selection'
          );
          assertInput(assert, 'An');

          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(
            assert,
            1,
            'ArrowUp+altKey does not change selection'
          );
          assertInput(assert, 'An');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened and filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "A" opens list; list is unfiltered'
            );
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'A');

          await fireInputEvent(input, 'An');

          assertSelection(assert, 1, 'Input of "An" selects second item');
          assertInput(assert, 'An');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert.dom(listItems).exists({ count: 3 });
          assertInput(assert, 'And');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened and filtered via input (case insensitive)', async function (this: Context, assert) {
          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "a" opens list; list is unfiltered'
            );
          assertSelection(assert, 0, 'Input of "a" selects first item');
          assertInput(assert, 'a');

          await fireInputEvent(input, 'an');

          assertSelection(assert, 1, 'Input of "an" selects second item');
          assertInput(assert, 'an');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await fireInputEvent(input, 'and');

          assertSelection(assert, null, 'Input of "and" has no matches');
          assert.dom(listItems).exists({ count: 3 });
          assertInput(assert, 'and');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened and filtered via input (case sensitive)', async function (this: Context, assert) {
          this.state.caseSensitive = true;
          await rerender();

          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "a" opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'Input of "a" has no matches');
          assertInput(assert, 'a');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await fireInputEvent(input, 'An');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input of "An" opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'SETUP: Input of "An" selects second item'
          );
          assertInput(assert, 'An');

          await pointerClick(outside);

          assert.dom(list).doesNotExist('SETUP: List closed');
        });

        test('it can be opened via input click', async function (this: Context, assert) {
          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, 1, 'Input selects first match');
          assertInput(assert, 'An');
        });

        test('it can be opened via trigger click', async function (this: Context, assert) {
          await pointerClick(trigger);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, 1, 'Input selects first match');
          assertInput(assert, 'An');
        });
      });
    });

    module('when starting OPEN, WITHOUT input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Enter opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'SETUP: Enter selects no item');
          assert.dom(input).hasNoValue('SETUP: No initial value');
        });

        test('ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown selects first item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 1, 'ArrowDown selects next item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 2, 'ArrowDown selects next item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp selects last item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 1, 'ArrowUp selects previous item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 0, 'ArrowUp selects previous item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp cycles back to last item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "A" opens list; list is unfiltered'
            );
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'A');

          await fireInputEvent(input, 'An');

          assertSelection(assert, 1, 'Input of "An" selects second item');
          assertInput(assert, 'An');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, 'And');
        });

        test('it can be dismissed via tab', async function (this: Context, assert) {
          await tab({ backwards: true });

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
        });

        test('it can be dismissed via Escape', async function (this: Context, assert) {
          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
          assertInput(assert, '');

          await this.state.expectCommit(null, keyboard(assert, 'Escape'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input click opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            null,
            'SETUP: Input click makes no selection'
          );
          assert.dom(input).hasNoValue('SETUP: Starts with no value');
        });

        test('it can be dismissed via click outside', async function (this: Context, assert) {
          await pointerClick(outside);

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
        });

        test('click commits an item', async function (this: Context, assert) {
          await this.state.expectCommit(1, pointerClick(listItem(1)));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });
    });

    module('when starting OPEN, WITH input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await fireInputEvent(input, 'An');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input of "An" opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'SETUP: Input of "An" selects second item'
          );
          assertInput(assert, 'An');
        });

        test('it can be dismissed via tab', async function (this: Context, assert) {
          await tab({ backwards: true });

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
        });

        test('it can be dismissed via Escape', async function (this: Context, assert) {
          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
          assertInput(assert, 'An');

          await this.state.expectCommit(null, keyboard(assert, 'Escape'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });

        test('Enter commits the item', async function (this: Context, assert) {
          await this.state.expectCommit(1, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });

        test('Home moves selection to beginning of input', async function (this: Context, assert) {
          await keyboard(assert, 'Home');

          assertInput(assert, 'An', [0, 0]);
        });

        test('End moves selection to end of input', async function (this: Context, assert) {
          let el = find(input);
          emberAssert(
            'expected input to be HTMLInputElement',
            el instanceof HTMLInputElement
          );
          el.setSelectionRange(0, 0);
          assertInput(assert, 'An', [0, 0]);

          await keyboard(assert, 'End');

          assertInput(assert, 'An');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input click opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            null,
            'SETUP: Input click makes no selection'
          );
          assert.dom(input).hasNoValue('SETUP: Starts with no value');

          await fireInputEvent(input, 'An');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input of "An" opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'SETUP: Input of "An" selects second item'
          );
          assertInput(assert, 'An');
        });

        test('it can be dismissed via click outside', async function (this: Context, assert) {
          await pointerClick(outside);

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
        });

        test('click commits an item', async function (this: Context, assert) {
          await this.state.expectCommit(1, pointerClick(listItem(1)));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });
    });
  });

  module('autocomplete=inline', function (hooks) {
    hooks.beforeEach(async function (this: Context) {
      this.state.autocomplete = 'inline';
      await rerender();
    });

    module('when starting CLOSED, WITHOUT input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');
        });

        test('it can be toggled via Enter', async function (this: Context, assert) {
          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Enter opens list; list is unfiltered');
          assertSelection(assert, null, 'Enter selects no item');
          assertInput(assert, '');

          await this.state.expectCommit(null, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist('Enter again closes list');
        });

        test('it can be opened via ArrowDown; subsequent ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowDown opens list; list is unfiltered');
          assertSelection(assert, 0, 'ArrowDown selects first item');
          assertInput(assert, 'Aardvark', [0, 8]);

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 1, 'ArrowDown selects next item');
          assertInput(assert, 'Ant', [0, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 2, 'ArrowDown selects next item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowDown+altKey; subsequent ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowDown+altKey opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp; subsequent ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowUp opens list; list is unfiltered');
          assertSelection(assert, 2, 'ArrowUp selects last item');
          assertInput(assert, 'Zebra', [0, 5]);

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 1, 'ArrowUp selects previous item');
          assertInput(assert, 'Ant', [0, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 0, 'ArrowUp selects previous item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp cycles back to last item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp+altKey; subsequent ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowUp+altKey opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened and filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "A" opens list; list is unfiltered'
            );
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'Aardvark', [1, 8]);

          await fireInputEvent(input, 'An');

          assertSelection(assert, 1, 'Input of "An" selects second item');
          assertInput(assert, 'Ant', [2, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, 'And');

          await fireInputEvent(input, '');

          assertSelection(assert, null, 'Input of "" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, '');
        });

        test('it can be opened and filtered via input (case insensitive)', async function (this: Context, assert) {
          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "a" opens list; list is unfiltered'
            );
          assertSelection(assert, 0, 'Input of "a" selects first item');
          assertInput(assert, 'aardvark', [1, 8]);

          await fireInputEvent(input, 'an');

          assertSelection(assert, 1, 'Input of "an" selects second item');
          assertInput(assert, 'ant', [2, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await fireInputEvent(input, 'and');

          assertSelection(assert, null, 'Input of "and" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, 'and');

          await fireInputEvent(input, '');

          assertSelection(assert, null, 'Input of "" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, '');
        });

        test('it can be opened and filtered via input (case sensitive)', async function (this: Context, assert) {
          this.state.caseSensitive = true;
          await rerender();

          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "a" opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'Input of "a" has no matches');
          assertInput(assert, 'a');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');
        });

        test('it can be opened via input click', async function (this: Context, assert) {
          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, null, 'Input click makes no selection');
          assertInput(assert, '');
        });

        test('it can be opened via trigger click', async function (this: Context, assert) {
          await pointerClick(trigger);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, null, 'Input click makes no selection');
          assertInput(assert, '');
        });
      });
    });

    module('when starting CLOSED, WITH input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await fireInputEvent(input, 'Ant');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input of "Ant" opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'SETUP: Input of "Ant" selects second item'
          );
          assertInput(assert, 'Ant');

          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist('SETUP: List closed after Escape');
        });

        test('it can be toggled via Enter', async function (this: Context, assert) {
          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Enter opens list; list is unfiltered');
          assertSelection(assert, 1, 'Selection does not change');
          assertInput(assert, 'Ant');

          await this.state.expectCommit(1, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist('Enter again closes list');
        });

        test('it can be opened via ArrowDown; subsequent ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowDown opens list; list is unfiltered');
          assertSelection(assert, 2, 'ArrowDown selects next item');
          assertInput(assert, 'Zebra', [0, 5]);

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowDown+altKey; subsequent ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowDown+altKey opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'ArrowDown+altKey does not change selection'
          );
          assertInput(assert, 'Ant');

          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(
            assert,
            1,
            'ArrowDown+altKey does not change selection'
          );
          assertInput(assert, 'Ant');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp; subsequent ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowUp opens list; list is unfiltered');
          assertSelection(assert, 0, 'ArrowUp selects previous item');
          assertInput(assert, 'Aardvark', [0, 8]);

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp cycles back to last item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp+altKey; subsequent ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowUp+altKey opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'ArrowUp+altKey does not change selection'
          );
          assertInput(assert, 'Ant');

          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(
            assert,
            1,
            'ArrowUp+altKey does not change selection'
          );
          assertInput(assert, 'Ant');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened and filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "A" opens list; list is unfiltered'
            );
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'Aardvark', [1, 8]);

          await fireInputEvent(input, 'An');

          assertSelection(assert, 1, 'Input of "An" selects second item');
          assertInput(assert, 'Ant', [2, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert.dom(listItems).exists({ count: 3 });
          assertInput(assert, 'And');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened and filtered via input (case insensitive)', async function (this: Context, assert) {
          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "a" opens list; list is unfiltered'
            );
          assertSelection(assert, 0, 'Input of "a" selects first item');
          assertInput(assert, 'aardvark', [1, 8]);

          await fireInputEvent(input, 'an');

          assertSelection(assert, 1, 'Input of "an" selects second item');
          assertInput(assert, 'ant', [2, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await fireInputEvent(input, 'and');

          assertSelection(assert, null, 'Input of "and" has no matches');
          assert.dom(listItems).exists({ count: 3 });
          assertInput(assert, 'and');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened and filtered via input (case sensitive)', async function (this: Context, assert) {
          this.state.caseSensitive = true;
          await rerender();

          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "a" opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'Input of "a" has no matches');
          assertInput(assert, 'a');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await fireInputEvent(input, 'Ant');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input of "Ant" opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'SETUP: Input of "Ant" selects second item'
          );
          assertInput(assert, 'Ant');

          await pointerClick(outside);

          assert.dom(list).doesNotExist('SETUP: List closed');
        });

        test('it can be opened via input click', async function (this: Context, assert) {
          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, 1, 'Input selects first match');
          assertInput(assert, 'Ant');
        });

        test('it can be opened via trigger click', async function (this: Context, assert) {
          await pointerClick(trigger);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, 1, 'Input selects first match');
          assertInput(assert, 'Ant');
        });
      });
    });

    module('when starting OPEN, WITHOUT input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Enter opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'SETUP: Enter selects no item');
          assert.dom(input).hasNoValue('SETUP: No initial value');
          assert.ok(true, 'SETUP COMPLETE');
        });

        test('ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown selects first item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 1, 'ArrowDown selects next item');
          assertInput(assert, 'Ant', [0, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 2, 'ArrowDown selects next item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp selects last item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 1, 'ArrowUp selects previous item');
          assertInput(assert, 'Ant', [0, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 0, 'ArrowUp selects previous item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp cycles back to last item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'Input of "A" opens list; list is unfiltered'
            );
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'Aardvark', [1, 8]);

          await fireInputEvent(input, 'An');

          assertSelection(assert, 1, 'Input of "An" selects second item');
          assertInput(assert, 'Ant', [2, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, 'And');
        });

        test('it can be dismissed via tab', async function (this: Context, assert) {
          await tab({ backwards: true });

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
          assertInput(assert, '');
        });

        test('it can be dismissed via Escape', async function (this: Context, assert) {
          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
          assertInput(assert, '');

          await this.state.expectCommit(null, keyboard(assert, 'Escape'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input click opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            null,
            'SETUP: Input click makes no selection'
          );
          assert.dom(input).hasNoValue('SETUP: Starts with no value');
        });

        test('it can be dismissed via click outside', async function (this: Context, assert) {
          await pointerClick(outside);

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
        });

        test('click commits an item', async function (this: Context, assert) {
          await this.state.expectCommit(1, pointerClick(listItem(1)));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });
    });

    module('when starting OPEN, WITH input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await fireInputEvent(input, 'Ant');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input of "Ant" opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'SETUP: Input of "Ant" selects second item'
          );
          assertInput(assert, 'Ant');
        });

        test('it can be dismissed via tab', async function (this: Context, assert) {
          await tab({ backwards: true });

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
          assertInput(assert, 'Ant');
        });

        test('it can be dismissed via Escape', async function (this: Context, assert) {
          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
          assertInput(assert, 'Ant');

          await this.state.expectCommit(null, keyboard(assert, 'Escape'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });

        test('Enter commits the item', async function (this: Context, assert) {
          await this.state.expectCommit(1, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });

        test('Home moves selection to beginning of input', async function (this: Context, assert) {
          await keyboard(assert, 'Home');

          assertInput(assert, 'Ant', [0, 0]);
        });

        test('End moves selection to end of input', async function (this: Context, assert) {
          let el = find(input);
          emberAssert(
            'expected input to be HTMLInputElement',
            el instanceof HTMLInputElement
          );
          el.setSelectionRange(0, 0);
          assertInput(assert, 'Ant', [0, 0]);

          await keyboard(assert, 'End');

          assertInput(assert, 'Ant');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input click opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            null,
            'SETUP: Input click makes no selection'
          );
          assert.dom(input).hasNoValue('SETUP: Starts with no value');

          await fireInputEvent(input, 'Ant');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input of "Ant" opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            1,
            'SETUP: Input of "Ant" selects second item'
          );
          assertInput(assert, 'Ant');
        });

        test('it can be dismissed via click outside', async function (this: Context, assert) {
          await pointerClick(outside);

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
        });

        test('click commits an item', async function (this: Context, assert) {
          await this.state.expectCommit(1, pointerClick(listItem(1)));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });
    });
  });

  module('autocomplete=list', function (hooks) {
    hooks.beforeEach(async function (this: Context) {
      this.state.autocomplete = 'list';
      await rerender();
    });

    module('when starting CLOSED, WITHOUT input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');
        });

        test('it can be toggled via Enter', async function (this: Context, assert) {
          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Enter opens list; list is unfiltered');
          assertSelection(assert, null, 'Enter selects no item');
          assertInput(assert, '');

          await this.state.expectCommit(null, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist('Enter again closes list');
        });

        test('it can be opened via ArrowDown; subsequent ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowDown opens list; list is unfiltered');
          assertSelection(assert, 0, 'ArrowDown selects first item');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 1, 'ArrowDown selects next item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 2, 'ArrowDown selects next item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowDown+altKey; subsequent ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowDown+altKey opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp; subsequent ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowUp opens list; list is unfiltered');
          assertSelection(assert, 2, 'ArrowUp selects last item');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 1, 'ArrowUp selects previous item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 0, 'ArrowUp selects previous item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp cycles back to last item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp+altKey; subsequent ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowUp+altKey opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened and filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Input of "A" opens list; list is filtered');
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'A');

          await fireInputEvent(input, 'An');

          assertSelection(assert, 0, 'Input of "An" selects only item');
          assertInput(assert, 'An');
          assert.dom(listItems).exists({ count: 1 }, 'List is filtered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "And".');
          assertInput(assert, 'And');

          await fireInputEvent(input, '');

          assertSelection(assert, null, 'Input of "" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, '');
        });

        test('it can be opened and filtered via input (case insensitive)', async function (this: Context, assert) {
          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Input of "a" opens list; list is filtered');
          assertSelection(assert, 0, 'Input of "a" selects first item');
          assertInput(assert, 'a');

          await fireInputEvent(input, 'an');

          assertSelection(assert, 0, 'Input of "an" selects only item');
          assertInput(assert, 'an');
          assert.dom(listItems).exists({ count: 1 }, 'List is filtered');

          await fireInputEvent(input, 'and');

          assertSelection(assert, null, 'Input of "and" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "and".');
          assertInput(assert, 'and');

          await fireInputEvent(input, '');

          assertSelection(assert, null, 'Input of "" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, '');
        });

        test('it can be opened and filtered via input (case sensitive)', async function (this: Context, assert) {
          this.state.caseSensitive = true;
          await rerender();

          await fireInputEvent(input, 'a');

          assertSelection(assert, null, 'Input of "a" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "a".');
          assertInput(assert, 'a');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');
        });

        test('it can be opened via input click', async function (this: Context, assert) {
          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, null, 'Input click makes no selection');
          assertInput(assert, '');
        });

        test('it can be opened via trigger click', async function (this: Context, assert) {
          await pointerClick(trigger);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, null, 'Input click makes no selection');
          assertInput(assert, '');
        });
      });
    });

    module('when starting CLOSED, WITH input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists(
              { count: 2 },
              'SETUP: Input of "A" opens list; list is filtered'
            );
          assertSelection(assert, 0, 'SETUP: Input of "A" selects only item');
          assertInput(assert, 'A');

          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist('SETUP: List closed after Escape');
          assertInput(assert, 'A');
        });

        test('it can be toggled via Enter', async function (this: Context, assert) {
          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Enter opens list; list is filtered');
          assertSelection(assert, 0, 'Selection does not change');
          assertInput(assert, 'A');

          await this.state.expectCommit(0, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist('Enter again closes list');
        });

        test('it can be opened via ArrowDown; subsequent ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'ArrowDown opens list; list is filtered');
          assertSelection(assert, 1, 'ArrowDown selects next item');
          assertInput(assert, 'A');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, 'A');
          assert.dom(listItems).exists({ count: 2 }, 'List is filtered');
        });

        test('it can be opened via ArrowDown+altKey; subsequent ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 2 },
              'ArrowDown+altKey opens list; list is filtered'
            );
          assertSelection(
            assert,
            0,
            'ArrowDown+altKey does not change selection'
          );
          assertInput(assert, 'A');

          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(
            assert,
            0,
            'ArrowDown+altKey does not change selection'
          );
          assertInput(assert, 'A');
          assert.dom(listItems).exists({ count: 2 }, 'List is filtered');
        });

        test('it can be opened via ArrowUp; subsequent ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'ArrowUp opens list; list is unfiltered');
          assertSelection(assert, 1, 'ArrowUp selects last item');
          assertInput(assert, 'A');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 0, 'ArrowUp cycles back to first item');
          assertInput(assert, 'A');
          assert.dom(listItems).exists({ count: 2 }, 'List is filtered');
        });

        test('it can be opened via ArrowUp+altKey; subsequent ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 2 },
              'ArrowUp+altKey opens list; list is filtered'
            );
          assertSelection(
            assert,
            0,
            'ArrowUp+altKey does not change selection'
          );
          assertInput(assert, 'A');

          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(
            assert,
            0,
            'ArrowUp+altKey does not change selection'
          );
          assertInput(assert, 'A');
          assert.dom(listItems).exists({ count: 2 }, 'List is filtered');
        });

        test('it can be opened and filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Input of "A" opens list; list is filtered');
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'A');

          await fireInputEvent(input, 'An');

          assertSelection(assert, 0, 'Input of "An" selects second item');
          assertInput(assert, 'An');
          assert.dom(listItems).exists({ count: 1 }, 'List is filtered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "And".');
          assertInput(assert, 'And');
        });

        test('it can be opened and filtered via input (case insensitive)', async function (this: Context, assert) {
          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Input of "a" opens list; list is filtered');
          assertSelection(assert, 0, 'Input of "a" selects first item');
          assertInput(assert, 'a');

          await fireInputEvent(input, 'an');

          assertSelection(assert, 0, 'Input of "an" selects second item');
          assertInput(assert, 'an');
          assert.dom(listItems).exists({ count: 1 }, 'List is filtered');

          await fireInputEvent(input, 'and');

          assertSelection(assert, null, 'Input of "and" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "and".');
          assertInput(assert, 'and');
        });

        test('it can be opened and filtered via input (case sensitive)', async function (this: Context, assert) {
          this.state.caseSensitive = true;
          await rerender();

          await fireInputEvent(input, 'a');

          assertSelection(assert, null, 'Input of "a" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "a".');
          assertInput(assert, 'a');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await fireInputEvent(input, 'Ant');

          assert
            .dom(listItems)
            .exists(
              { count: 1 },
              'SETUP: Input of "Ant" opens list; list is filtered'
            );
          assertSelection(assert, 0, 'SETUP: Input of "Ant" selects only item');
          assertInput(assert, 'Ant');

          await pointerClick(outside);

          assert.dom(list).doesNotExist('SETUP: List closed');
        });

        test('it can be opened via input click', async function (this: Context, assert) {
          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 1 }, 'Input click opens list; list is filtered');
          assertSelection(assert, 0, 'Input selects first match');
          assertInput(assert, 'Ant');
        });

        test('it can be opened via trigger click', async function (this: Context, assert) {
          await pointerClick(trigger);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 1 }, 'Input click opens list; list is filtered');
          assertSelection(assert, 0, 'Input selects only match');
          assertInput(assert, 'Ant');
        });
      });
    });

    module('when starting OPEN, WITHOUT input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Enter opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'SETUP: Enter selects no item');
          assert.dom(input).hasNoValue('SETUP: No initial value');
          assert.ok(true, 'SETUP COMPLETE');
        });

        test('ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown selects first item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 1, 'ArrowDown selects next item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 2, 'ArrowDown selects next item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp selects last item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 1, 'ArrowUp selects previous item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 0, 'ArrowUp selects previous item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp cycles back to last item');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Input of "A" opens list; list is filtered');
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'A');

          await fireInputEvent(input, 'An');

          assertSelection(assert, 0, 'Input of "An" selects only item');
          assertInput(assert, 'An');
          assert.dom(listItems).exists({ count: 1 }, 'List is filtered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "And".');
          assertInput(assert, 'And');
        });

        test('it can be dismissed via tab', async function (this: Context, assert) {
          await tab({ backwards: true });

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
          assertInput(assert, '');
        });

        test('it can be dismissed via Escape', async function (this: Context, assert) {
          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
          assertInput(assert, '');

          await this.state.expectCommit(null, keyboard(assert, 'Escape'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input click opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            null,
            'SETUP: Input click makes no selection'
          );
          assert.dom(input).hasNoValue('SETUP: Starts with no value');
        });

        test('it can be dismissed via click outside', async function (this: Context, assert) {
          await pointerClick(outside);

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
        });

        test('click commits an item', async function (this: Context, assert) {
          await this.state.expectCommit(1, pointerClick(listItem(1)));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });
    });

    module('when starting OPEN, WITH input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await fireInputEvent(input, 'Ant');

          assert
            .dom(listItems)
            .exists(
              { count: 1 },
              'SETUP: Input of "Ant" opens list; list is filtered'
            );
          assertSelection(assert, 0, 'SETUP: Input of "Ant" selects only item');
          assertInput(assert, 'Ant');
        });

        test('it can be dismissed via tab', async function (this: Context, assert) {
          await tab({ backwards: true });

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
          assertInput(assert, 'Ant');
        });

        test('it can be dismissed via Escape', async function (this: Context, assert) {
          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
          assertInput(assert, 'Ant');

          await this.state.expectCommit(null, keyboard(assert, 'Escape'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });

        test('Enter commits the item', async function (this: Context, assert) {
          await this.state.expectCommit(1, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });

        test('Home moves selection to beginning of input', async function (this: Context, assert) {
          await keyboard(assert, 'Home');

          assertInput(assert, 'Ant', [0, 0]);
        });

        test('End moves selection to end of input', async function (this: Context, assert) {
          let el = find(input);
          emberAssert(
            'expected input to be HTMLInputElement',
            el instanceof HTMLInputElement
          );
          el.setSelectionRange(0, 0);
          assertInput(assert, 'Ant', [0, 0]);

          await keyboard(assert, 'End');

          assertInput(assert, 'Ant');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input click opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            null,
            'SETUP: Input click makes no selection'
          );
          assert.dom(input).hasNoValue('SETUP: Starts with no value');

          await fireInputEvent(input, 'Ant');

          assert
            .dom(listItems)
            .exists(
              { count: 1 },
              'SETUP: Input of "Ant" opens list; list is filtered'
            );
          assertSelection(assert, 0, 'SETUP: Input of "Ant" selects only item');
          assertInput(assert, 'Ant');
        });

        test('it can be dismissed via click outside', async function (this: Context, assert) {
          await pointerClick(outside);

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
        });

        test('click commits an item', async function (this: Context, assert) {
          await this.state.expectCommit(1, pointerClick(listItem(0)));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });
    });
  });

  module('autocomplete=both', function (hooks) {
    hooks.beforeEach(async function (this: Context) {
      this.state.autocomplete = 'both';
      await rerender();
    });

    module('when starting CLOSED, WITHOUT input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');
        });

        test('it can be toggled via Enter', async function (this: Context, assert) {
          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Enter opens list; list is unfiltered');
          assertSelection(assert, null, 'Enter selects no item');
          assertInput(assert, '');

          await this.state.expectCommit(null, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist('Enter again closes list');
        });

        test('it can be opened via ArrowDown; subsequent ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowDown opens list; list is unfiltered');
          assertSelection(assert, 0, 'ArrowDown selects first item');
          assertInput(assert, 'Aardvark', [0, 8]);

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 1, 'ArrowDown selects next item');
          assertInput(assert, 'Ant', [0, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 2, 'ArrowDown selects next item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowDown+altKey; subsequent ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowDown+altKey opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp; subsequent ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assert
            .dom(listItems)
            .exists({ count: 3 }, 'ArrowUp opens list; list is unfiltered');
          assertSelection(assert, 2, 'ArrowUp selects last item');
          assertInput(assert, 'Zebra', [0, 5]);

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 1, 'ArrowUp selects previous item');
          assertInput(assert, 'Ant', [0, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 0, 'ArrowUp selects previous item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp cycles back to last item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened via ArrowUp+altKey; subsequent ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'ArrowUp+altKey opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');

          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be opened and filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Input of "A" opens list; list is filtered');
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'Aardvark', [1, 8]);

          await fireInputEvent(input, 'An');

          assertSelection(assert, 0, 'Input of "An" selects only item');
          assertInput(assert, 'Ant', [2, 3]);
          assert.dom(listItems).exists({ count: 1 }, 'List is filtered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "And".');
          assertInput(assert, 'And');

          await fireInputEvent(input, '');

          assertSelection(assert, null, 'Input of "" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, '');
        });

        test('it can be opened and filtered via input (case insensitive)', async function (this: Context, assert) {
          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Input of "a" opens list; list is filtered');
          assertSelection(assert, 0, 'Input of "a" selects first item');
          assertInput(assert, 'aardvark', [1, 8]);

          await fireInputEvent(input, 'an');

          assertSelection(assert, 0, 'Input of "an" selects only item');
          assertInput(assert, 'ant', [2, 3]);
          assert.dom(listItems).exists({ count: 1 }, 'List is filtered');

          await fireInputEvent(input, 'and');

          assertSelection(assert, null, 'Input of "and" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "and".');
          assertInput(assert, 'and');

          await fireInputEvent(input, '');

          assertSelection(assert, null, 'Input of "" has no matches');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
          assertInput(assert, '');
        });

        test('it can be opened and filtered via input (case sensitive)', async function (this: Context, assert) {
          this.state.caseSensitive = true;
          await rerender();

          await fireInputEvent(input, 'a');

          assertSelection(assert, null, 'Input of "a" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "a".');
          assertInput(assert, 'a');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');
        });

        test('it can be opened via input click', async function (this: Context, assert) {
          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, null, 'Input click makes no selection');
          assertInput(assert, '');
        });

        test('it can be opened via trigger click', async function (this: Context, assert) {
          await pointerClick(trigger);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 3 }, 'Input click opens list; list is unfiltered');
          assertSelection(assert, null, 'Input click makes no selection');
          assertInput(assert, '');
        });
      });
    });

    module('when starting CLOSED, WITH input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists(
              { count: 2 },
              'SETUP: Input of "A" opens list; list is filtered'
            );
          assertSelection(assert, 0, 'SETUP: Input of "A" selects only item');
          assertInput(assert, 'Aardvark', [1, 8]);

          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist('SETUP: List closed after Escape');
          assertInput(assert, 'Aardvark', [1, 8]);
        });

        test('it can be toggled via Enter', async function (this: Context, assert) {
          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Enter opens list; list is filtered');
          assertSelection(assert, 0, 'Selection does not change');
          assertInput(assert, 'Aardvark', [1, 8]);

          await this.state.expectCommit(0, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist('Enter again closes list');
        });

        test('it can be opened via ArrowDown; subsequent ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'ArrowDown opens list; list is filtered');
          assertSelection(assert, 1, 'ArrowDown selects next item');
          assertInput(assert, 'Ant', [1, 3]);

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, 'Aardvark', [1, 8]);
          assert.dom(listItems).exists({ count: 2 }, 'List is filtered');
        });

        test('it can be opened via ArrowDown+altKey; subsequent ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 2 },
              'ArrowDown+altKey opens list; list is filtered'
            );
          assertSelection(
            assert,
            0,
            'ArrowDown+altKey does not change selection'
          );
          assertInput(assert, 'Aardvark', [1, 8]);

          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(
            assert,
            0,
            'ArrowDown+altKey does not change selection'
          );
          assertInput(assert, 'Aardvark', [1, 8]);
          assert.dom(listItems).exists({ count: 2 }, 'List is filtered');
        });

        test('it can be opened via ArrowUp; subsequent ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'ArrowUp opens list; list is unfiltered');
          assertSelection(assert, 1, 'ArrowUp selects last item');
          assertInput(assert, 'Ant', [1, 3]);

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 0, 'ArrowUp cycles back to first item');
          assertInput(assert, 'Aardvark', [1, 8]);
          assert.dom(listItems).exists({ count: 2 }, 'List is filtered');
        });

        test('it can be opened via ArrowUp+altKey; subsequent ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assert
            .dom(listItems)
            .exists(
              { count: 2 },
              'ArrowUp+altKey opens list; list is filtered'
            );
          assertSelection(
            assert,
            0,
            'ArrowUp+altKey does not change selection'
          );
          assertInput(assert, 'Aardvark', [1, 8]);

          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(
            assert,
            0,
            'ArrowUp+altKey does not change selection'
          );
          assertInput(assert, 'Aardvark', [1, 8]);
          assert.dom(listItems).exists({ count: 2 }, 'List is filtered');
        });

        test('it can be opened and filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Input of "A" opens list; list is filtered');
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'Aardvark', [1, 8]);

          await fireInputEvent(input, 'An');

          assertSelection(assert, 0, 'Input of "An" selects second item');
          assertInput(assert, 'Ant', [2, 3]);
          assert.dom(listItems).exists({ count: 1 }, 'List is filtered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "And".');
          assertInput(assert, 'And');
        });

        test('it can be opened and filtered via input (case insensitive)', async function (this: Context, assert) {
          await fireInputEvent(input, 'a');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Input of "a" opens list; list is filtered');
          assertSelection(assert, 0, 'Input of "a" selects first item');
          assertInput(assert, 'aardvark', [1, 8]);

          await fireInputEvent(input, 'an');

          assertSelection(assert, 0, 'Input of "an" selects second item');
          assertInput(assert, 'ant', [2, 3]);
          assert.dom(listItems).exists({ count: 1 }, 'List is filtered');

          await fireInputEvent(input, 'and');

          assertSelection(assert, null, 'Input of "and" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "and".');
          assertInput(assert, 'and');
        });

        test('it can be opened and filtered via input (case sensitive)', async function (this: Context, assert) {
          this.state.caseSensitive = true;
          await rerender();

          await fireInputEvent(input, 'a');

          assertSelection(assert, null, 'Input of "a" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "a".');
          assertInput(assert, 'a');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await fireInputEvent(input, 'Ant');

          assert
            .dom(listItems)
            .exists(
              { count: 1 },
              'SETUP: Input of "Ant" opens list; list is filtered'
            );
          assertSelection(assert, 0, 'SETUP: Input of "Ant" selects only item');
          assertInput(assert, 'Ant');

          await pointerClick(outside);

          assert.dom(list).doesNotExist('SETUP: List closed');
        });

        test('it can be opened via input click', async function (this: Context, assert) {
          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 1 }, 'Input click opens list; list is filtered');
          assertSelection(assert, 0, 'Input selects first match');
          assertInput(assert, 'Ant');
        });

        test('it can be opened via trigger click', async function (this: Context, assert) {
          await pointerClick(trigger);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists({ count: 1 }, 'Input click opens list; list is filtered');
          assertSelection(assert, 0, 'Input selects only match');
          assertInput(assert, 'Ant');
        });
      });
    });

    module('when starting OPEN, WITHOUT input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await keyboard(assert, 'Enter');

          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Enter opens list; list is unfiltered'
            );
          assertSelection(assert, null, 'SETUP: Enter selects no item');
          assert.dom(input).hasNoValue('SETUP: No initial value');
          assert.ok(true, 'SETUP COMPLETE');
        });

        test('ArrowDowns cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown selects first item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 1, 'ArrowDown selects next item');
          assertInput(assert, 'Ant', [0, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 2, 'ArrowDown selects next item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowDown');

          assertSelection(assert, 0, 'ArrowDown cycles through to first item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowDown+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowDown', { altKey: true });

          assertSelection(assert, null, 'ArrowDown+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowUps cycle through list', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp selects last item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 1, 'ArrowUp selects previous item');
          assertInput(assert, 'Ant', [0, 3]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 0, 'ArrowUp selects previous item');
          assertInput(assert, 'Aardvark', [0, 8]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');

          await keyboard(assert, 'ArrowUp');

          assertSelection(assert, 2, 'ArrowUp cycles back to last item');
          assertInput(assert, 'Zebra', [0, 5]);
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('ArrowUp+altKey does nothing', async function (this: Context, assert) {
          await keyboard(assert, 'ArrowUp', { altKey: true });

          assertSelection(assert, null, 'ArrowUp+altKey makes no selection');
          assertInput(assert, '');
          assert.dom(listItems).exists({ count: 3 }, 'List is unfiltered');
        });

        test('it can be filtered via input', async function (this: Context, assert) {
          await fireInputEvent(input, 'A');

          assert
            .dom(listItems)
            .exists({ count: 2 }, 'Input of "A" opens list; list is filtered');
          assertSelection(assert, 0, 'Input of "A" selects first item');
          assertInput(assert, 'Aardvark', [1, 8]);

          await fireInputEvent(input, 'An');

          assertSelection(assert, 0, 'Input of "An" selects only item');
          assertInput(assert, 'Ant', [2, 3]);
          assert.dom(listItems).exists({ count: 1 }, 'List is filtered');

          await fireInputEvent(input, 'And');

          assertSelection(assert, null, 'Input of "And" has no matches');
          assert
            .dom(listItems)
            .exists({ count: 1 })
            .containsText('No items match the filter "And".');
          assertInput(assert, 'And');
        });

        test('it can be dismissed via tab', async function (this: Context, assert) {
          await tab({ backwards: true });

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
          assertInput(assert, '');
        });

        test('it can be dismissed via Escape', async function (this: Context, assert) {
          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
          assertInput(assert, '');

          await this.state.expectCommit(null, keyboard(assert, 'Escape'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input click opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            null,
            'SETUP: Input click makes no selection'
          );
          assert.dom(input).hasNoValue('SETUP: Starts with no value');
        });

        test('it can be dismissed via click outside', async function (this: Context, assert) {
          await pointerClick(outside);

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
        });

        test('click commits an item', async function (this: Context, assert) {
          await this.state.expectCommit(1, pointerClick(listItem(1)));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });
    });

    module('when starting OPEN, WITH input', function () {
      module('keyboard', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed before focus');

          await focus(outside);
          await tab();

          assert.dom(input).isFocused('SETUP: Input focused');
          assert.dom(list).doesNotExist('SETUP: Focus does not open list');

          await fireInputEvent(input, 'Ant');

          assert
            .dom(listItems)
            .exists(
              { count: 1 },
              'SETUP: Input of "Ant" opens list; list is filtered'
            );
          assertSelection(assert, 0, 'SETUP: Input of "Ant" selects only item');
          assertInput(assert, 'Ant');
        });

        test('it can be dismissed via tab', async function (this: Context, assert) {
          await tab({ backwards: true });

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
          assertInput(assert, 'Ant');
        });

        test('it can be dismissed via Escape', async function (this: Context, assert) {
          await keyboard(assert, 'Escape');

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
          assertInput(assert, 'Ant');

          await this.state.expectCommit(null, keyboard(assert, 'Escape'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });

        test('Enter commits the item', async function (this: Context, assert) {
          await this.state.expectCommit(1, keyboard(assert, 'Enter'));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });

        test('Home moves selection to beginning of input', async function (this: Context, assert) {
          await keyboard(assert, 'Home');

          assertInput(assert, 'Ant', [0, 0]);
        });

        test('End moves selection to end of input', async function (this: Context, assert) {
          let el = find(input);
          emberAssert(
            'expected input to be HTMLInputElement',
            el instanceof HTMLInputElement
          );
          el.setSelectionRange(0, 0);
          assertInput(assert, 'Ant', [0, 0]);

          await keyboard(assert, 'End');

          assertInput(assert, 'Ant');
        });
      });

      module('mouse', function (hooks) {
        hooks.beforeEach(async function (assert) {
          assert.dom(list).doesNotExist('SETUP: List closed');

          await pointerClick(input);

          assert.dom(input).isFocused();
          assert
            .dom(listItems)
            .exists(
              { count: 3 },
              'SETUP: Input click opens list; list is unfiltered'
            );
          assertSelection(
            assert,
            null,
            'SETUP: Input click makes no selection'
          );
          assert.dom(input).hasNoValue('SETUP: Starts with no value');

          await fireInputEvent(input, 'Ant');

          assert
            .dom(listItems)
            .exists(
              { count: 1 },
              'SETUP: Input of "Ant" opens list; list is filtered'
            );
          assertSelection(assert, 0, 'SETUP: Input of "Ant" selects only item');
          assertInput(assert, 'Ant');
        });

        test('it can be dismissed via click outside', async function (this: Context, assert) {
          await pointerClick(outside);

          assert.dom(list).doesNotExist();
          assert.dom(input).isNotFocused();
          assert.dom(outside).isFocused();
        });

        test('click commits an item', async function (this: Context, assert) {
          await this.state.expectCommit(1, pointerClick(listItem(0)));

          assert.dom(list).doesNotExist();
          assert.dom(input).isFocused();
        });
      });
    });
  });
});

async function keyboard(
  assert: Assert,
  key: string,
  modifiers?: KeyModifiers
): Promise<void> {
  let el = document.activeElement;
  emberAssert('expected active element', el instanceof HTMLElement);
  await triggerKeyEvent(el, 'keydown', key, modifiers);
  if (
    el instanceof HTMLInputElement &&
    (key === 'Backspace' || key === 'Delete')
  ) {
    el.value = el.value.slice(0, el.value.length - 1);
  }
  await triggerKeyEvent(el, 'keyup', key, modifiers);
  assert.ok(true, `Keyboard ${key} with modifiers ${inspect(modifiers)}`);
}

function listItem(n: number): string {
  return `[data-test-combobox-listbox] li:nth-child(${n + 1})`;
}

function assertSelection(assert: Assert, n: number | null, note: string): void {
  assert.dom(input).isFocused();
  let selectedItems = findAll(selectedItem);
  if (!note) {
    assert.ok(false, 'Debug note is empty');
  }
  if (typeof n === 'number') {
    let li = find(listItem(n));
    emberAssert(`could not find list item at n=${n}`, li);
    assert.strictEqual(
      selectedItems.length,
      1,
      `[${note}] There is a single aria-selected item`
    );
    assert
      .dom(li)
      .hasAria(
        'selected',
        'true',
        `[${note}] Item ${n} has aria-selected=true`
      );
    assert
      .dom(list)
      .hasAria(
        'activedescendant',
        li.id,
        `[${note}] The listbox aria-activedescendant is set to the id for list item ${n}`
      );
  } else {
    assert.dom(list).hasNoAttribute('aria-activedescendant');
    assert.strictEqual(
      selectedItems.length,
      0,
      `[${note}] There are no aria-selected items`
    );
  }
}

function assertInput(
  assert: Assert,
  value: string,
  [selectionStart, selectionEnd] = [value.length, value.length]
): void {
  let el = find(input);
  emberAssert(
    'expected input to be an HTMLInputElement',
    el instanceof HTMLInputElement
  );
  assert.dom(el).hasValue(value);
  assert.strictEqual(
    el.selectionStart,
    selectionStart,
    `Input selection starts at ${selectionStart}`
  );
  assert.strictEqual(
    el.selectionEnd,
    selectionEnd,
    `Input selection ends at ${selectionEnd}`
  );
}
