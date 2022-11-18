import type ArrayProxy from '@ember/array/proxy';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import eq from 'ember-truth-helpers/helpers/eq';

import type ListNav from 'okapi/components/list-nav/index';

export interface ListboxSelectionSignature<T> {
  Element: HTMLDivElement;
  Args: {
    /**
     * An optional ID to be applied to the element.
     * (We can't use splattributes because we need to add the id when we yield
     * this component.)
     */
    id?: string;

    /**
     * The items in the list. An item can be `null` but not `undefined`.
     */
    items: T[] | ArrayProxy<T>;

    /**
     * Optionally pass in the initially selected item.
     */
    initialSelection?: T | undefined;

    /**
     * Action to call when an item is "selected" via click/Enter.
     */
    onSelect: (item: T) => void;

    /**
     * Optional action to call when the focused item is updated.
     */
    onFocus?: ((item: T) => void) | undefined;

    /**
     * Optional action to call when an item has a keydown event.
     */
    onItemKeydown?: ((item: T, e: KeyboardEvent) => void) | undefined;

    /**
     * Optional action to call when an item has a mouseenter event.
     */
    onItemMousemove?: ((item: T, e: MouseEvent) => void) | undefined;

    /**
     * Handles 'keydown' actions for the listbox.
     */
    list: ListNav['list'];
  };
  Blocks: {
    /**
     * The item inside an <li> in a listbox.
     */
    items: [item: T];
    /**
     * A block for rendering extra list-items in the Selection's ListNav that
     * are not items for selection (e.g. an "add another item" link at the
     * bottom of the list)
     */
    extras: [];
  };
}

/**
 * Manages selection of Listbox items.
 *
 * Currently only single selection is supported.
 *
 * NOTE: This component must be wrapped in `<ListNav>` to be compliant and is
 * not meant to be used on its own.
 */
export default class ListboxSelection<T> extends Component<
  ListboxSelectionSignature<T>
> {
  <template>
    <div
      role="listbox"
      tabindex={{if (eq this.selection undefined) "0" ""}}
      {{@list}}
      class="Listbox"
      ...attributes
      id={{@id}}
      data-test-listbox
    >
      <ul data-test-listbox-item-list class="Listbox__item-list" role="group">
        {{#each @items as |item|}}
          {{#let (eq item this.selection) as |isSelected|}}
            {{! This is the markup recommended by wai-aria best practices }}
            {{! template-lint-disable require-context-role }}
            <li
              {{on "mousemove" (fn this.onItemMousemove item)}}
              {{on "focus" (fn this.onItemFocus item)}}
              {{on "click" (fn this.onItemClick item)}}
              {{on "keydown" (fn this.onItemKeydown item)}}
              role="option"
              tabindex={{if isSelected "0" "-1"}}
              aria-selected={{if isSelected "true" "false"}}
            >
              {{yield item to="items"}}
            </li>
          {{/let}}
        {{/each}}
      </ul>

      {{#if (has-block "extras")}}
        <ul
          data-test-listbox-extras-list
          class="Listbox__extras-list"
          role="group"
        >
          {{yield to="extras"}}
        </ul>
      {{/if}}
    </div>
  </template>

  // NOTE: Do not default this to `null` as the user might pass `null` as
  // an option.
  @tracked private selection = this.args.initialSelection;

  @action private onItemMousemove(item: T, e: MouseEvent): void {
    this.args.onItemMousemove?.(item, e);
  }

  @action private onItemFocus(item: T): void {
    this.args.onFocus?.(item);
  }

  @action private onItemClick(item: T, e?: Event): void {
    this.selection = item;
    this.args.onSelect(item);
    if (e) {
      e.preventDefault();
    }
  }

  @action private onItemKeydown(item: T, e: KeyboardEvent): void {
    if (e.key === 'Enter' || (e.key === 'ArrowUp' && e.altKey)) {
      e.preventDefault();
      this.onItemClick(item);
    } else if (e.key === 'Tab') {
      this.onItemClick(item);
    }

    this.args.onItemKeydown?.(item, e);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Listbox::Selection': typeof ListboxSelection;
    'listbox/selection': typeof ListboxSelection;
  }
}
