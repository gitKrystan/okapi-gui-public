import { assert as emberAssert } from '@ember/debug';
import type { TestContext } from '@ember/test-helpers';
import { click, focus, render, tab } from '@ember/test-helpers';
import triggerKeyEvent from '@ember/test-helpers/dom/trigger-key-event';
import { setupRenderingTest } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import type { MoveFocusSignature } from 'okapi/components/list-nav/types';
import { FocusDirection } from 'okapi/components/list-nav/types';
import { module, test } from 'qunit';

interface Context extends TestContext {
  state: State;
}

class State {
  handleClick(moveFocusTo: MoveFocusSignature): void {
    moveFocusTo(FocusDirection.First);
  }

  handleKeydown(moveFocusTo: MoveFocusSignature, e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowUp':
        moveFocusTo(FocusDirection.Last);
        break;
      case 'ArrowDown':
        moveFocusTo(FocusDirection.First);
        break;
    }
  }
}

module('Integration | Component | list-nav', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function (this: Context) {
    this.state = new State();
  });

  module('@itemRole="menuitem"', function () {
    module('implicit trigger', function (hooks) {
      hooks.beforeEach(async function () {
        await render(hbs`
          <ListNav @itemRole="menuitem" as |nav|>
            <ul {{nav.list}} tabindex="0" role="menu">
              <li role="menuitem" tabindex="-1">Aardvark</li>
              <li role="menuitem" tabindex="-1">Ant</li>
              <li role="menuitem" tabindex="-1">Zebra</li>
            </ul>
          </ListNav>
          <div id="outside" tabindex="0">Outside</div>
        `);
      });

      itHandlesKeydown('ul');
    });

    module('explicit trigger', function (hooks) {
      hooks.beforeEach(async function () {
        await render(hbs`
          <ListNav @itemRole="menuitem" as |nav|>
            <button
              {{on "click" (fn this.state.handleClick nav.moveFocusTo)}}
              {{on "keydown" (fn this.state.handleKeydown nav.moveFocusTo)}}
            >
              Click Me
            </button>
            <ul {{nav.list}} role="menu">
              <li role="menuitem" tabindex="-1">Aardvark</li>
              <li role="menuitem" tabindex="-1">Ant</li>
              <li role="menuitem" tabindex="-1">Zebra</li>
            </ul>
          </ListNav>
          <div id="outside" tabindex="0">Outside</div>
        `);
      });

      itHandlesKeydown('button');
      itHandlesClick('button');
    });
  });

  module('@itemRole="option"', function () {
    module('implicit trigger', function (hooks) {
      hooks.beforeEach(async function () {
        await render(hbs`
        <ListNav @itemRole="option" as |nav|>
          <ul {{nav.list}} tabindex="0" role="listbox">
            <li role="option" tabindex="-1">Aardvark</li>
            <li role="option" tabindex="-1">Ant</li>
            <li role="option" tabindex="-1">Zebra</li>
          </ul>
        </ListNav>
        <div id="outside" tabindex="0">Outside</div>
      `);
      });

      itHandlesKeydown('ul');
    });

    module('explicit trigger', function (hooks) {
      hooks.beforeEach(async function () {
        await render(hbs`
          <ListNav @itemRole="option" as |nav|>
            <button
              {{on "click" (fn this.state.handleClick nav.moveFocusTo)}}
              {{on "keydown" (fn this.state.handleKeydown nav.moveFocusTo)}}
            >
              Click Me
            </button>
            <ul {{nav.list}} role="listbox">
              <li role="option" tabindex="-1">Aardvark</li>
              <li role="option" tabindex="-1">Ant</li>
              <li role="option" tabindex="-1">Zebra</li>
            </ul>
          </ListNav>
          <div id="outside" tabindex="0">Outside</div>
        `);
      });

      itHandlesKeydown('button');
      itHandlesClick('button');
    });
  });
});

function itHandlesKeydown(trigger: string): void {
  test('it handles keydown', async function (assert) {
    await focus(trigger);

    assert.dom(trigger).isFocused();

    await keydown('ArrowDown');

    assert.dom(item(1)).isFocused();

    await keydown('ArrowDown');

    assert.dom(item(2)).isFocused();

    await keydown('ArrowDown');

    assert.dom(item(3)).isFocused();

    await keydown('ArrowDown');

    assert.dom(item(1)).isFocused('Focus wraps with ArrowDown');

    await keydown('ArrowUp');

    assert.dom(item(3)).isFocused('Focus wraps with ArrowUp');

    await keydown('ArrowUp');

    assert.dom(item(2)).isFocused();

    await keydown('ArrowUp');

    assert.dom(item(1)).isFocused();

    await keydown('End');

    assert.dom(item(3)).isFocused('End key focuses last item');

    await keydown('Home');

    assert.dom(item(1)).isFocused('Home key focuses first item');

    await keydown('Z');

    assert.dom(item(3)).isFocused('Z key focuses "Zebra"');

    await keydown('A');

    assert.dom(item(1)).isFocused('A key focuses "Aardvark"');

    await keydown('A');

    assert.dom(item(2)).isFocused('A key again focuses "Ant"');

    await keydown('X');

    assert.dom(item(2)).isFocused('X key does not change focus (no matches)');

    await tab();

    assert.dom('#outside').isFocused('Tab focuses next focusable element');

    await tab({ backwards: true });

    assert.dom(trigger).isFocused('Back-tab re-focuses trigger');
  });
}

function itHandlesClick(trigger: string): void {
  test('it handles click', async function (assert) {
    await click(trigger);

    assert.dom(item(1)).isFocused();
  });
}

async function keydown(key: string): Promise<void> {
  let el = document.activeElement;
  emberAssert('expected active element', el instanceof HTMLElement);
  await triggerKeyEvent(el, 'keydown', key);
}

function item(n: number): string {
  return `li:nth-child(${n})`;
}
