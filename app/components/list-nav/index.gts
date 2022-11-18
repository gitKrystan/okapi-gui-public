import { assert } from '@ember/debug';
// @ts-expect-error This is actually used
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import { schedule } from '@ember/runloop';
import Component from '@glimmer/component';
import Ember from 'ember';

import { task, timeout } from 'ember-concurrency';
import { modifier } from 'ember-modifier';

import isHTMLElement from 'okapi/utils/is-html-element';
import isPrintableCharacter from 'okapi/utils/is-printable-character';
import { FocusDirection } from './types';
import type { MoveFocusSignature } from './types';

interface ListNavSignature {
  Element: null;
  Args: {
    itemRole: 'menuitem' | 'option';
  };
  Blocks: {
    default: [
      {
        list: ListNav['list'];
        moveFocusTo: MoveFocusSignature;
      }
    ];
  };
}

/**
 * Implements the wai-aria design pattern for keyboard and mouse interactions
 * shared between listbox and menu widgets. Yields a `list` modifier to handle
 * the following interactions:
 *
 * _List keydown:_
 * - _Down Arrow:_ Moves focus to the next option.
 * - _Up Arrow:_ Moves focus to the previous option.
 * - _Home:_ Moves focus to first option.
 * - _End:_ Moves focus to last option.
 * - _Type-ahead search:_
 *     - _Type a character:_ focus moves to the next item with a name that
 *       starts with the typed character.
 *     - _Type multiple characters in rapid succession:_ focus moves to the
 *       next item with a name that starts with the string of characters typed.
 */
export default class ListNav extends Component<ListNavSignature> {
  <template>
    {{yield (hash list=this.list moveFocusTo=this.moveFocusTo)}}
  </template>

  /**
   * Handles 'keydown' events for the listbox.
   */
  list = modifier(
    (el: HTMLElement) => {
      let items = [...el.querySelectorAll(`[role="${this.args.itemRole}"]`)];
      assert('not all items are HTMLElements', items.every(isHTMLElement));

      this._items = items;

      el.addEventListener('keydown', this.onKeydown);

      return () => {
        el.removeEventListener('keydown', this.onKeydown);
      };
    },
    { eager: false }
  );

  /**
   * Focuses specified item
   */
  moveFocusTo(
    focusTarget: FocusDirection.First | FocusDirection.Last | number
  ): void;
  /**
   * Manages focus for `Next` and `Previous` states, which need to know about
   * the currently focused item.
   *
   * @param current The currently focused item.
   */
  moveFocusTo(
    focusTarget: FocusDirection.Next | FocusDirection.Previous,
    currentIndex: number
  ): void;
  /**
   * Manages focus for a `startsWith` search, which needs to know about the
   * currently focused item as well the character the user typed.
   */
  moveFocusTo(
    focusTarget: FocusDirection.StartsWith,
    currentIndex: number,
    char: string
  ): void;
  /**
   * Manages focus for list items.
   */
  @action moveFocusTo(
    focusTarget: FocusDirection | number,
    currentIndex?: number,
    char?: string
  ): void {
    schedule('afterRender', () => {
      let { items } = this;

      let target: HTMLElement | undefined;

      // eslint-disable-next-line unicorn/prefer-switch
      if (
        focusTarget === FocusDirection.Next ||
        focusTarget === FocusDirection.Previous
      ) {
        assert(
          'currentIndex is not a number',
          typeof currentIndex === 'number'
        );

        let targetIndex =
          focusTarget === FocusDirection.Next
            ? currentIndex + 1
            : currentIndex - 1;

        // The targetIndex will be negative when Focus.Previous is called and the first item is focused, or when the listbox is closed and the user hits the 'ArrowUp' key.
        if (targetIndex < 0) {
          target = items[items.length - 1];
        } else if (targetIndex >= items.length) {
          target = items[0];
        } else {
          target = items[targetIndex];
        }

        assert("target doesn't exist", isHTMLElement(target));
      } else if (focusTarget === FocusDirection.First) {
        target = items[0];
        assert("target doesn't exist", isHTMLElement(target));
      } else if (focusTarget === FocusDirection.Last) {
        target = items[items.length - 1];
        assert("target doesn't exist", isHTMLElement(target));
      } else if (typeof focusTarget === 'number') {
        target = this.items[focusTarget];
      } else if (FocusDirection.StartsWith) {
        assert(
          'currentIndex is not a number',
          typeof currentIndex === 'number'
        );
        assert('char is not a string', typeof char === 'string');

        if (!this.keysSoFar) {
          // user just started typing a new search
          this.indexAtSearchStart = currentIndex;
        }
        this.keysSoFar += char.toLowerCase();

        this.debouncedSearch.perform();

        currentIndex = this.indexAtSearchStart ?? currentIndex;
        target = this.search(items, currentIndex) ?? items[currentIndex];
      }

      if (target) {
        target.focus();
      }
    });
  }

  private _items: HTMLElement[] | null = null;

  private get items(): HTMLElement[] {
    let items = this._items;
    assert('Tried to use items before set', items !== null);
    return items;
  }

  /**
   * Keys typed within a specific time window.
   */
  private keysSoFar = '';

  /**
   * The index at the time that a `startsWith` search has begun so we know where
   * to move focus from and aren't always selecting the first instance of a given
   * letter combination.
   */
  private indexAtSearchStart: number | null = null;

  /**
   * Finds the next match in `items` based on the currently focused
   * item.
   */
  private search(
    items: HTMLElement[],
    currentIndex: number
  ): HTMLElement | undefined {
    let nextMatch = this.findMatchInRange(
      items,
      currentIndex + 1,
      items.length
    );
    if (!nextMatch) {
      nextMatch = this.findMatchInRange(items, 0, currentIndex);
    }

    return nextMatch;
  }

  /**
   * Within a `startsWith` search, clears `keysSorFar` if it's not
   * restarted within 500 milliseconds (or 0 in tests).
   */
  private debouncedSearch = task(
    { restartable: true },
    async (): Promise<void> => {
      await timeout(Ember.testing ? 0 : 500);
      this.keysSoFar = '';
    }
  );

  /**
   * Finds a character match within a given range of `items`.
   */
  private findMatchInRange(
    items: HTMLElement[],
    startIndex: number,
    endIndex: number
  ): HTMLElement | undefined {
    for (let i = startIndex; i < endIndex; i++) {
      let item = items[i];
      assert(`expected item at index ${i}`, item);
      // eslint-disable-next-line unicorn/prefer-dom-node-text-content
      let label = item.innerText;
      if (label?.toLowerCase().startsWith(this.keysSoFar)) {
        return item;
      }
    }
    return;
  }

  /**
   * Moves focus on ArrowUp/ArrowDown, Home/End and "PrintableCharacters"
   * i.e., letters that potentially match a list item.
   */
  @action private onKeydown(e: KeyboardEvent): void {
    if (!e.defaultPrevented) {
      assert('e.target exists', isHTMLElement(e.target));
      let currentIndex = this.items.indexOf(e.target);

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          this.moveFocusTo(FocusDirection.Previous, currentIndex);
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          this.moveFocusTo(FocusDirection.Next, currentIndex);
          break;
        }
        case 'Home': {
          e.preventDefault();
          this.moveFocusTo(FocusDirection.First);
          break;
        }
        case 'End': {
          e.preventDefault();
          this.moveFocusTo(FocusDirection.Last);
          break;
        }
        default: {
          if (isPrintableCharacter(e.key)) {
            this.moveFocusTo(FocusDirection.StartsWith, currentIndex, e.key);
          }
        }
      }
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ListNav: typeof ListNav;
  }
}
