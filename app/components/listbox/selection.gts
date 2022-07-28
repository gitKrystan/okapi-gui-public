import ArrayProxy from '@ember/array/proxy';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import eq from 'ember-truth-helpers/helpers/eq';
import { tracked } from 'tracked-built-ins';

import ListNav from 'okapi/components/list-nav/index';

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
    initialSelection?: T;

    /**
     * Action to call when an item is "committed" via click/Enter.
     */
    onCommit: (item: T) => void;

    /**
     * Optional action to call when the "selected" item is updated.
     */
    onSelection?: (item: T) => void;

    /**
     * Optional action to call when an item has a keydown event.
     */
    onItemKeydown?: (item: T, e: KeyboardEvent) => void;

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
  // @ts-expect-error FIXME
  <template>
    <div
      role="listbox"
      tabindex={{if (eq this.selection undefined) "0" ""}}
      {{@list}}
      class="listbox"
      ...attributes
      id={{@id}}
      data-test-listbox-selection
    >
      <ul class="list-none listbox-item-list" role="group">
        {{#each @items as |item|}}
          {{#let (eq item this.selection) as |isSelected|}}
            {{! This is the markup recommended by wai-aria best practices }}
            {{! template-lint-disable require-context-role }}
            <li
              {{on "focus" (fn this.onItemFocus item)}}
              {{on "click" (fn this.onItemClick item)}}
              {{on "keydown" (fn this.onItemKeydown item)}}
              role="option"
              tabindex={{if isSelected "0" "-1"}}
              aria-selected={{if isSelected "true" "false"}}
              class="Listbox__item {{if isSelected 'Listbox__item--selected'}}"
            >
              {{yield item to="items"}}
            </li>
          {{/let}}
        {{/each}}
      </ul>

      {{#if (has-block "extras")}}
        <ul class="Listbox__extras-list" role="group">
          {{yield to="extras"}}
        </ul>
      {{/if}}
    </div>
  </template>

  // NOTE: Do not default this to `null` as the user might pass `null` as
  // an option.
  @tracked private selection = this.args.initialSelection;

  @action private onItemFocus(item: T): void {
    this.selection = item;
    this.args.onSelection?.(item);
  }

  @action private onItemClick(item: T): void {
    this.selection = item;
    this.args.onCommit(item);
  }

  @action private onItemKeydown(item: T, e: KeyboardEvent): void {
    if (e.key === 'Enter' || (e.key === 'ArrowUp' && e.altKey)) {
      e.preventDefault();
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
