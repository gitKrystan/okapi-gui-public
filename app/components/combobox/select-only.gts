import { assert } from '@ember/debug';
import { fn } from '@ember/helper';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import type { ComponentLike, WithBoundArgs } from '@glint/template';

import Dropdown from 'okapi/components/dropdown/index';
// Ideally we'd re-export from the dropdown component but that's not working yet
// with GTS.
import type DropdownApi from 'okapi/components/dropdown/private/api';
import ListNav from 'okapi/components/list-nav/index';
import { FocusDirection } from 'okapi/components/list-nav/types';
import type { MoveFocusSignature } from 'okapi/components/list-nav/types';
import ComboboxButton from 'okapi/components/combobox/button';
import type { ComboboxButtonSignature } from 'okapi/components/combobox/button';
import Selection from 'okapi/components/listbox/selection';
import type { ListboxSelectionSignature } from 'okapi/components/listbox/selection';
import isPrintableCharacter from 'okapi/utils/is-printable-character';

interface SelectOnlyComboboxSignature<T> {
  Element: HTMLDivElement;
  Args: Omit<ListboxSelectionSignature<T>['Args'], 'list'> & {
    readonly?: boolean | undefined;
  };
  Blocks: {
    trigger: [
      Button: WithBoundArgs<
        typeof ComboboxButton,
        keyof ComboboxButtonSignature['Args']
      >
    ];

    content: [
      // HACK: Ideally we'd be able to do `typeof ListboxSelection<T>` here, but
      // that's not possible with our current version of TS. It might be
      // possible in future versions.
      List: WithBoundArgs<
        ComponentLike<ListboxSelectionSignature<T>>,
        keyof ListboxSelectionSignature<T>['Args']
      >
    ];
  };
}

/**
 * A single-select combobox widget that is functionally similar to an HTML
 * `<select>` input with the attribute `size="1"`. The widget consists of a
 * button that triggers the display of a listbox. In its default state, the
 * listbox is collapsed.
 *
 * In addition to the keyboard interactions described in `<ListNav>`, also
 * supports:
 *
 * _Trigger click:_ Toggle dropdown. Focus the first item when opening.
 *
 * _Trigger keydown:_
 * - _Down Arrow:_ Open dropdown and move focus to the first or next option.
 * - _Up Arrow:_ Open dropdown and move focus to the last or previous option.
 *
 * Based on the example here:
 * https://www.w3.org/TR/wai-aria-practices/examples/combobox/combobox-select-only.html
 * (One significant difference between our version and the example is that we
 * use actual `focus` for selection vs `aria-activedescendant`)
 */
export default class SelectOnlyCombobox<T> extends Component<
  SelectOnlyComboboxSignature<T>
> {
  <template>
    <ListNav @itemRole="option" as |nav|>
      <Dropdown ...attributes @didDismiss={{this.didDismiss}}>
        <:trigger as |d|>
          {{yield
            (component
              ComboboxButton
              listboxId=this.id
              expanded=d.isExpanded
              onInsert=this.registerButton
              onKeydown=(fn this.handleTriggerKeydown d nav.moveFocusTo)
              onClick=(fn this.handleTriggerClick d nav.moveFocusTo)
              readonly=@readonly
            )
            to="trigger"
          }}
        </:trigger>
        {{!
          We need to ignore prettier here because otherwise the formatting breaks
          glint-expect-error below.
        }}
        {{! prettier-ignore }}
        <:content as |d|>
          {{! @glint-expect-error See Signature type for explanation. }}
          {{yield (component Selection id=this.id items=@items initialSelection=@initialSelection onFocus=@onFocus onSelect=(fn this.onSelect d) onItemMousemove=@onItemMousemove onItemKeydown=(fn this.handleItemKeydown d) list=nav.list) to="content"}}
        </:content>
      </Dropdown>
    </ListNav>
  </template>

  private id = guidFor(this);

  private get items(): T[] {
    return 'toArray' in this.args.items
      ? this.args.items.toArray()
      : this.args.items;
  }

  @action private handleTriggerClick(
    d: DropdownApi,
    moveFocusTo: MoveFocusSignature
  ): void {
    d.toggle({
      didOpen: () => moveFocusTo(this.currentIndex ?? 0),
    });
  }

  @action private handleTriggerKeydown(
    d: DropdownApi,
    moveFocusTo: MoveFocusSignature,
    e: KeyboardEvent
  ): void {
    let currentIndex = this.currentIndex ?? -1;

    switch (e.key) {
      case 'ArrowUp': {
        e.preventDefault();
        d.open({
          didOpen: () => moveFocusTo(FocusDirection.Previous, currentIndex),
        });
        break;
      }
      case 'ArrowDown': {
        e.preventDefault();
        d.open({
          didOpen: () => {
            if (e.altKey) {
              moveFocusTo(currentIndex);
            } else {
              moveFocusTo(FocusDirection.Next, currentIndex);
            }
          },
        });
        break;
      }
      default: {
        if (isPrintableCharacter(e.key)) {
          e.preventDefault();
          d.open({
            didOpen: () =>
              moveFocusTo(FocusDirection.StartsWith, currentIndex, e.key),
          });
        }
      }
    }
  }

  /**
   * When the user hits "Escape", "cancel" the selection and refocus the anchor.
   */
  @action private didDismiss(e: Event): void {
    if (e instanceof KeyboardEvent && e.key === 'Escape') {
      assert('Button element must exist', this.buttonEl);
      this.buttonEl.focus();
    }
  }

  @action private onSelect(d: DropdownApi, item: T): void {
    d.close();
    assert('Button element must exist', this.buttonEl);
    this.buttonEl.focus();
    this.args.onSelect?.(item);
  }

  @action private handleItemKeydown(
    d: DropdownApi,
    item: T,
    e: KeyboardEvent
  ): void {
    if (e.key === ' ') {
      this.onSelect(d, item);
    }
  }

  private get currentIndex(): number | null {
    let { initialSelection } = this.args;
    if (initialSelection === undefined) {
      return null;
    } else {
      let index = this.items.indexOf(initialSelection);
      assert('expected current item to be found in items', index >= 0);
      return index;
    }
  }

  // Element registration

  @action private registerButton(el: HTMLElement): void {
    this._buttonEl = el;
  }

  private _buttonEl?: HTMLElement;

  private get buttonEl(): HTMLButtonElement {
    assert(
      `incorrect comboboxEl, was ${this._buttonEl}`,
      this._buttonEl instanceof HTMLButtonElement
    );
    return this._buttonEl;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Combobox::SelectOnly': typeof SelectOnlyCombobox;
  }
}
