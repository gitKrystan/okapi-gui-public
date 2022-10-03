import { action } from '@ember/object';
import { fn } from '@ember/helper';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import eq from 'ember-truth-helpers/helpers/eq';

import Combobox, { Autocomplete } from 'okapi/components/combobox/editable';
import type { MatchItem } from 'okapi/utils/filter-search';
import type Search from 'okapi/utils/filter-search';

interface EditableComboboxWithDescriptionSignature<
  K extends string,
  T extends Record<K, string> & { description?: string }
> {
  Element: HTMLDivElement;
  Args: {
    valueField: K;
    search: Search<T, unknown>;
    autocomplete?: Autocomplete;
    resetOnCommit?: boolean;
    readonly?: boolean;
    labelClass?: string;
    onSelect?: (selection: MatchItem<T> | null) => void;
    onCommit?: (selection: MatchItem<T> | null) => void;
    onItemMousemove?: (result: MatchItem<T>) => void;
    onItemFocus?: (result: MatchItem<T>) => void;
  };
  Blocks: {
    label: [];
    button: [];
    options: [result: MatchItem<T>];
    description: [item: MatchItem<T> | null];
    extra: [];
  };
}

/**
 * Editable Combobox with item description at the bottom of the dropdown.
 */
export default class EditableComboboxWithDescription<
  K extends string,
  T extends Record<K, string> & { description?: string }
> extends Component<EditableComboboxWithDescriptionSignature<K, T>> {
  <template>
    <Combobox
      ...attributes
      @valueField={{@valueField}}
      @search={{@search}}
      @autocomplete={{@autocomplete}}
      @resetOnCommit={{@resetOnCommit}}
      @labelClass={{@labelClass}}
      @onCommit={{fn this.passthrough "onCommit"}}
      @onSelect={{fn this.passthrough "onSelect"}}
      @onItemMousemove={{fn this.passthrough "onItemMousemove"}}
      @onItemFocus={{fn this.passthrough "onItemFocus"}}
    >
      <:label>
        {{yield to="label"}}
      </:label>
      <:button>
        {{yield to="button"}}
      </:button>
      <:options as |Item result|>
        <Item
          class="{{if
              (eq result.item this.descriptionItem.item)
              'ComboboxItem--is-description-item'
            }}"
        >
          {{yield result to="options"}}
          <p class="u_visually-hidden">
            Description:
            {{yield result to="description"}}
          </p>
        </Item>
      </:options>
      <:extra>
        {{! Hide this item from aria because we have a visually hidden description above. }}
        <div class="Combobox__description" aria-hidden="true">
          {{yield this.descriptionItem to="description"}}
        </div>
        {{yield to="extra"}}
      </:extra>
    </Combobox>
  </template>

  @tracked private _descriptionItem: MatchItem<T> | null = null;

  private get descriptionItem(): MatchItem<T> | null {
    if (
      this._descriptionItem === null ||
      !this.args.search.items.includes(this._descriptionItem.item)
    ) {
      return null;
    } else {
      return this._descriptionItem;
    }
  }

   private set descriptionItem(newSelection: MatchItem<T> | null ){
    this._descriptionItem = newSelection;
  }

  @action private passthrough(
    method: 'onSelect' | 'onCommit' | 'onItemMousemove' | 'onItemFocus',
    result: MatchItem<T> | null
  ): void {
    this.updateDescription(result);
    if (result) {
      this.args[method]?.(result);
    }
  }

  @action private updateDescription(result: MatchItem<T> | null): void {
    this.descriptionItem = result;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Combobox::EditableWithDescription': typeof EditableComboboxWithDescription;
  }
}
