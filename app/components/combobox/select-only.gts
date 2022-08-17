import { assert } from '@ember/debug';
import { fn } from '@ember/helper';
import { guidFor } from '@ember/object/internals';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { ComponentLike, WithBoundArgs } from '@glint/template';
import Positioner, { PositionerAPI } from 'ember-positioner';
import ListNav from 'okapi/components/list-nav/index';
import {
  FocusDirection,
  MoveFocusSignature,
} from 'okapi/components/list-nav/types';
import ComboboxButton, {
  ComboboxButtonSignature,
} from 'okapi/components/combobox/button';
import Selection, { ListboxSelectionSignature } from 'okapi/components/listbox/selection';
import dismissible from 'okapi/modifiers/dismissible';
import isPrintableCharacter from 'okapi/utils/is-printable-character';

interface SelectOnlyComboboxSignature<T> {
  Element: HTMLDivElement;
  Args: Omit<ListboxSelectionSignature<T>['Args'], 'list'> & {
    readonly: boolean
  };
  Blocks: {
    trigger: [
      Button: WithBoundArgs<
        typeof ComboboxButton,
        keyof ComboboxButtonSignature['Args']
      >,
      positioner: PositionerAPI,
    ];

    content: [
      // HACK: Ideally we'd be able to do `typeof ListboxSelection<T>` here, but
      // that's not possible with our current version of TS. It might be
      // possible in future versions.
      List: WithBoundArgs<
        ComponentLike<ListboxSelectionSignature<T>>,
        keyof ListboxSelectionSignature<T>['Args']
      >,
      positioner: PositionerAPI,
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
  // @ts-expect-error FIXME
  <template>
    <ListNav @itemRole="option" as |nav|>
      <div ...attributes class="Combobox">
        <Positioner
          @placement="bottom"
          @hideArrow={{true}}
          @offsetDistance={{0}}
        >
          <:trigger as |p|>
            {{yield
                (component
                  ComboboxButton
                  listboxId=this.id
                  expanded=p.isOpened
                  onInsert=p.registerAnchor
                  onKeydown=(fn this.handleTriggerKeydown p nav.moveFocusTo)
                  onClick=(fn this.handleTriggerClick p nav.moveFocusTo)
                  readonly=@readonly
                )
                p
              to="trigger"
            }}
          </:trigger>
          <:content as |p|>
            <div
              class="Combobox__dropdown"
              {{dismissible
                dismissed=(fn this.handleDismiss p)
                related=p.anchor
              }}
            >
              {{! @glint-expect-error See Signature type for explanation. }}
              {{yield (component Selection id=this.id items=@items initialSelection=this.focusedItem onFocus=this.onFocus onSelect=(fn this.onSelect p) onItemMousemove=this.onItemMousemove onItemKeydown=(fn this.handleItemKeydown p) list=nav.list)
                p
                to="content"
              }}
            </div>
          </:content>
        </Positioner>
      </div>
    </ListNav>
  </template>

  private id = guidFor(this);

  @tracked private focusedItem = this.args.initialSelection;

  @action private onFocus(item = this.args.initialSelection): void {
    this.focusedItem = item;
    if (item !== undefined) {
      this.args.onFocus?.(item);
    }
  }

  @action private handleTriggerClick(
    p: PositionerAPI,
    moveFocusTo: MoveFocusSignature
  ): void {
    if (p.isHidden) {
      void p.open();
      moveFocusTo(this.currentIndex ?? 0);
    } else {
      void p.close();
    }
  }

  @action private handleTriggerKeydown(
    p: PositionerAPI,
    moveFocusTo: MoveFocusSignature,
    e: KeyboardEvent
  ): void {
    let currentIndex = this.currentIndex ?? -1;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        p.open();
        moveFocusTo(FocusDirection.Previous, currentIndex);
        break;
      case 'ArrowDown':
        e.preventDefault();
        p.open();
        if (e.altKey) {
          moveFocusTo(currentIndex);
        } else {
          moveFocusTo(FocusDirection.Next, currentIndex);
        }
        break;
      default:
        if (isPrintableCharacter(e.key)) {
          e.preventDefault();
          p.open();
          moveFocusTo(FocusDirection.StartsWith, currentIndex, e.key);
        }
    }
  }

  /**
   * When the user hits "Escape", "cancel" the selection and refocus the anchor.
   */
  @action private handleDismiss(p: PositionerAPI, e: Event): void {
    this.onFocus();
    p.close();

    if (e instanceof KeyboardEvent && e.key === 'Escape') {
      assert('Positioner anchor must exist', p.anchor);
      p.anchor.focus();
    }
  }

  @action private onSelect(p: PositionerAPI, item: T): void {
    p.close();
    assert('Positioner anchor must exist', p.anchor);
    p.anchor.focus();
    this.args.onSelect?.(item);
  }

  @action private onItemMousemove(
    item: T,
    e: MouseEvent
  ): void {
    this.args.onItemMousemove?.(item, e)
  }

  @action private handleItemKeydown(
    p: PositionerAPI,
    item: T,
    e: KeyboardEvent
  ): void {
    if (e.key === ' ') {
      this.onSelect(p, item);
    }
  }

  private get currentIndex(): number | null {
    let { focusedItem } = this;
    if (focusedItem === undefined) {
      return null;
    } else {
      let index = this.args.items.indexOf(focusedItem);
      assert('expected current focusedItem to be found in items', index >= 0);
      return index;
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Combobox::SelectOnly': typeof SelectOnlyCombobox;
  }
}
