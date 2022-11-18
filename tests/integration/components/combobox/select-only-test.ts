import { assert as emberAssert } from '@ember/debug';
import { action } from '@ember/object';
import type { TestContext } from '@ember/test-helpers';
import { click, focus, render, rerender, tab } from '@ember/test-helpers';
import type { KeyModifiers } from '@ember/test-helpers/dom/trigger-key-event';
import triggerKeyEvent from '@ember/test-helpers/dom/trigger-key-event';
import { tracked } from '@glimmer/tracking';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import { setupRenderingTest } from 'okapi/tests/helpers';
import { keyboardClick } from 'okapi/tests/helpers/dom-interaction';

interface Context<T> extends TestContext {
  state: State<T>;
}

class State<T> {
  constructor(private assert: Assert, readonly items: T[]) {}

  @tracked initialSelection?: T | undefined;

  @tracked selection?: T;

  @tracked focusedItem?: T;

  @action handleSelect(item: T): void {
    this.initialSelection = item;
    this.selection = item;
  }

  @action handleFocus(item: T): void {
    this.focusedItem = item;
  }

  extraClicks = 0;

  @action onClickExtra(): void {
    this.extraClicks++;
  }

  assertFocus(n: number): void {
    this.assert.dom(listItem(n)).isFocused();
    this.assert.strictEqual(
      this.focusedItem,
      this.items[n],
      `Item at index ${n} is focused`
    );
  }

  assertSelect(n: number): void {
    this.assert.strictEqual(
      this.focusedItem,
      this.items[n],
      `Item at index ${n} is focused`
    );
    this.assert.strictEqual(
      this.selection,
      this.items[n],
      `Item at index ${n} is selected`
    );
  }
}

module('Integration | Component | combobox/select-only', function (hooks) {
  setupRenderingTest(hooks);

  module('with no extras', function (hooks) {
    hooks.beforeEach(async function (this: Context<string | null>, assert) {
      this.state = new State(assert, ['Aardvark', null, 'Zebra']);

      await render<Context<string | null>>(hbs`
        <Combobox::SelectOnly
          @initialSelection={{this.state.initialSelection}}
          @onFocus={{this.state.handleFocus}}
          @onSelect={{this.state.handleSelect}}
          @items={{this.state.items}}
        >
          <:trigger as |Trigger|>
            <Trigger aria-label="Select your favorite animal">
              {{or this.state.selection "I hate animals"}}
            </Trigger>
          </:trigger>
          <:content as |List|>
            <List aria-label="Select your favorite animal">
              <:items as |item|>
                {{if (eq item null) "NULL" item}}
              </:items>
            </List>
          </:content>
        </Combobox::SelectOnly>
        <a id="outside" href="#">Click Outside</a>
      `);
    });

    module('with no initial selection', function () {
      test('it handles keydown', async function (this: Context<
        string | null
      >, assert) {
        let trigger = '[data-test-combobox-button]';
        let list = '[data-test-listbox]';

        assert.dom(list).doesNotExist();

        await focus(trigger);

        assert.dom(trigger).isFocused();

        await keydown('ArrowDown');

        assert.dom(list).exists('Trigger ArrowDown keydown opens list');
        this.state.assertFocus(0);

        await keydown('ArrowDown');

        this.state.assertFocus(1);

        await keydown('ArrowDown');

        this.state.assertFocus(2);

        await keydown('ArrowDown');

        this.state.assertFocus(0);

        await keydown('ArrowUp');

        this.state.assertFocus(2);

        await keydown('ArrowUp');

        this.state.assertFocus(1);

        await keydown('ArrowUp');

        this.state.assertFocus(0);

        await keydown('Enter');

        assert.dom(list).doesNotExist();
        this.state.assertSelect(0);
        assert.dom(trigger).isFocused();

        await keydown('ArrowDown');

        assert.dom(list).exists('Trigger ArrowDown keydown opens list again');
        this.state.assertFocus(1);

        await keydown('Enter');

        assert.dom(list).doesNotExist();
        this.state.assertSelect(1);
        assert.dom(trigger).isFocused();

        await keydown('A');

        assert.dom(list).exists('Keydown opens list again');
        this.state.assertFocus(0);

        await keydown('Enter');

        assert.dom(list).doesNotExist();
        this.state.assertSelect(0);
        assert.dom(trigger).isFocused();

        await keydown('ArrowDown');

        assert.dom(list).exists('Trigger ArrowDown keydown opens list again');
        this.state.assertFocus(1);

        await keydown('ArrowUp', { altKey: true });

        assert.dom(list).doesNotExist();
        this.state.assertSelect(1);
        assert.dom(trigger).isFocused();
      });

      test('it handles click', async function (this: Context<
        string | null
      >, assert) {
        let trigger = '[data-test-combobox-button]';
        let list = '[data-test-listbox]';

        assert.dom(list).doesNotExist();

        await click(trigger);

        assert.dom(list).exists('Trigger click opens list');
        this.state.assertFocus(0);

        await click(listItem(0));

        assert.dom(list).doesNotExist();
        this.state.assertSelect(0);
        assert.dom(trigger).isFocused();

        await click(trigger);

        assert.dom(list).exists('Trigger click opens list again');
        this.state.assertFocus(0);

        await click(listItem(1));

        assert.dom(list).doesNotExist();
        this.state.assertSelect(1);
        assert.dom(trigger).isFocused();
      });
    });

    module('with initial selection', function () {
      test('it handles keydown', async function (this: Context<
        string | null
      >, assert) {
        let trigger = '[data-test-combobox-button]';
        let list = '[data-test-listbox]';

        for (let item of this.state.items) {
          this.state.initialSelection = item;

          await rerender();

          assert.ok(true, `ITERATION: initialSelection set to ${String(item)}`);

          let index = this.state.items.indexOf(item);
          let nextIndex = (index + 1) % this.state.items.length;

          assert.dom(list).doesNotExist();

          await focus(trigger);

          assert.dom(trigger).isFocused();

          await keydown('ArrowDown');

          assert.dom(list).exists('Trigger ArrowDown keydown opens list');
          this.state.assertFocus(nextIndex);

          await keydown('Enter');

          assert.dom(list).doesNotExist();
          this.state.assertSelect(nextIndex);
          assert.dom(trigger).isFocused();

          await keydown('ArrowDown', { altKey: true });
          assert
            .dom(list)
            .exists('Trigger arrow keydown + alt opens list again');
          this.state.assertFocus(nextIndex);

          await tab();

          assert.dom(list).doesNotExist();
          this.state.assertSelect(nextIndex);

          await focus(trigger);
          await keydown('ArrowDown', { altKey: true });
          assert
            .dom(list)
            .exists('Trigger arrow keydown + alt opens list again');
          this.state.assertFocus(nextIndex);

          await keydown(' ');

          assert.dom(list).doesNotExist();
          this.state.assertSelect(nextIndex);
          assert.dom(trigger).isFocused();
        }
      });

      test('it handles click', async function (this: Context<
        string | null
      >, assert) {
        let trigger = '[data-test-combobox-button]';
        let list = '[data-test-listbox]';

        for (let item of this.state.items) {
          this.state.initialSelection = item;

          await rerender();

          assert.ok(true, `ITERATION: initialSelection set to ${String(item)}`);

          let index = this.state.items.indexOf(item);
          let nextIndex = (index + 1) % this.state.items.length;

          assert.dom(list).doesNotExist();

          await click(trigger);

          assert.dom(list).exists('Trigger click opens list');
          this.state.assertFocus(index);

          await click(listItem(nextIndex));

          assert.dom(list).doesNotExist();
          this.state.assertSelect(nextIndex);
          assert.dom(trigger).isFocused();

          await click(trigger);

          assert.dom(list).exists('Trigger click opens list again');
          this.state.assertFocus(nextIndex);

          await click('#outside');

          assert.dom(list).doesNotExist();
          this.state.assertSelect(nextIndex);
          assert.dom('#outside').isFocused();
        }
      });
    });
  });

  module('with extras', function (hooks) {
    hooks.beforeEach(async function (this: Context<string | null>, assert) {
      this.state = new State(assert, ['Aardvark', null, 'Zebra']);

      await render<Context<string | null>>(hbs`
        <Combobox::SelectOnly
          @initialSelection={{this.state.initialSelection}}
          @onFocus={{this.state.handleFocus}}
          @onSelect={{this.state.handleSelect}}
          @items={{this.state.items}}
        >
          <:trigger as |Trigger|>
            <Trigger aria-label="Select your favorite animal">
              {{or this.state.selection "I hate animals"}}
            </Trigger>
          </:trigger>
          <:content as |List|>
            <List aria-label="Select your favorite animal">
              <:items as |item|>
                {{if (eq item null) "NULL" item}}
              </:items>
              <:extras>
                <li role="none">
                  <Button
                    id="extra"
                    role="option"
                    tabindex="-1"
                    {{on "click" this.state.onClickExtra}}
                  >
                    Add new animal...
                  </Button>
                </li>
              </:extras>
            </List>
          </:content>
        </Combobox::SelectOnly>
        <a id="outside" href="#">Click Outside</a>
      `);
    });

    test('it handles keydown', async function (this: Context<
      string | null
    >, assert) {
      let trigger = '[data-test-combobox-button]';
      let list = '[data-test-listbox]';

      assert.dom(list).doesNotExist();
      assert.strictEqual(this.state.extraClicks, 0);

      await focus(trigger);

      assert.dom(trigger).isFocused();

      await keydown('ArrowDown');

      assert.dom(list).exists('Trigger ArrowDown keydown opens list');
      this.state.assertFocus(0);

      await keydown('ArrowDown');

      this.state.assertFocus(1);

      await keydown('ArrowDown');

      this.state.assertFocus(2);

      await keydown('ArrowDown');

      assert.dom(extraItem(0)).isFocused('Extra item is focused');

      await keydown('ArrowDown');

      this.state.assertFocus(0);

      await keydown('ArrowUp');

      assert.dom(extraItem(0)).isFocused('Extra item is focused');

      await keydown('ArrowUp');

      this.state.assertFocus(2);

      await keydown('ArrowUp');

      this.state.assertFocus(1);

      await keydown('ArrowUp');

      this.state.assertFocus(0);

      await keydown('Enter');

      assert.dom(list).doesNotExist();
      this.state.assertSelect(0);
      assert.dom(trigger).isFocused();

      await keydown('ArrowDown');

      assert.dom(list).exists('Trigger ArrowDown keydown opens list again');
      this.state.assertFocus(1);

      await keydown('Enter');

      assert.dom(list).doesNotExist();
      this.state.assertSelect(1);
      assert.dom(trigger).isFocused();

      await keydown('A');

      assert.dom(list).exists('Keydown opens list again');
      assert.dom(extraItem(0)).isFocused('Extra item is focused');

      await keydown('A');

      this.state.assertFocus(0);

      await keydown('Enter');

      assert.dom(list).doesNotExist();
      this.state.assertSelect(0);
      assert.dom(trigger).isFocused();

      await keydown('ArrowDown');
      await keydown('ArrowDown');
      await keydown('ArrowDown');

      assert.dom(extraItem(0)).isFocused('Extra item is focused');

      let el = document.activeElement;
      emberAssert('expected active element', el instanceof HTMLElement);
      await keyboardClick(el);

      assert.strictEqual(
        this.state.extraClicks,
        1,
        'extra click was triggered once'
      );
      assert.strictEqual(
        this.state.selection,
        this.state.items[0],
        'Item at index 0 is still selected'
      );
    });

    test('it handles click', async function (this: Context<
      string | null
    >, assert) {
      let trigger = '[data-test-combobox-button]';
      let list = '[data-test-listbox]';

      assert.dom(list).doesNotExist();
      assert.strictEqual(this.state.extraClicks, 0);

      await click(trigger);

      assert.dom(list).exists('Trigger click opens list');
      this.state.assertFocus(0);

      await click(listItem(0));

      assert.dom(list).doesNotExist();
      this.state.assertSelect(0);
      assert.dom(trigger).isFocused();

      await click(trigger);

      assert.dom(list).exists('Trigger click opens list again');
      this.state.assertFocus(0);

      await click(extraItem(0));

      assert.strictEqual(
        this.state.extraClicks,
        1,
        'extra click was triggered once'
      );
      assert.strictEqual(
        this.state.selection,
        this.state.items[0],
        'Item at index 0 is still selected'
      );
    });
  });
});

async function keydown(key: string, modifiers?: KeyModifiers): Promise<void> {
  let el = document.activeElement;
  emberAssert('expected active element', el instanceof HTMLElement);
  await triggerKeyEvent(el, 'keydown', key, modifiers);
}

function listItem(n: number): string {
  return `[data-test-listbox-item-list] li:nth-child(${n + 1})`;
}

function extraItem(n: number): string {
  return `[data-test-listbox-extras-list] li:nth-child(${n + 1}) button`;
}
