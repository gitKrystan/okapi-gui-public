import { assert } from '@ember/debug';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { dasherize } from '@ember/string';
import { isBlank } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked, cached } from '@glimmer/tracking';
import type { WithBoundArgs } from '@glint/template';
import Ember from 'ember';

import { didCancel, task, timeout } from 'ember-concurrency';
import { modifier } from 'ember-modifier';

import Dropdown from 'okapi/components/dropdown/index';
// Ideally we'd re-export from the dropdown component but that's not working yet
// with GTS.
import type DropdownApi from 'okapi/components/dropdown/private/api';
import type Search from 'okapi/utils/filter-search';
import type { MatchItem } from 'okapi/utils/filter-search';
import { squish } from 'okapi/utils/string';
import ComboboxButton from './button';
import ComboboxItem from './item';

export type Autocomplete = 'none' | 'list' | 'inline' | 'both';

export interface EditableComboboxSignature<
  K extends string,
  T extends Record<K, string>
> {
  Element: HTMLDivElement;
  Args: {
    valueField: K;
    search: Search<T, unknown>;
    autocomplete?: Autocomplete | undefined;
    resetOnCommit?: boolean | undefined;
    readonly?: boolean | undefined;
    labelClass?: string | undefined;
    onSelect?: (selection: MatchItem<T> | null) => void;
    onCommit?: (selection: MatchItem<T> | null) => void;
    onItemMousemove?: (result: MatchItem<T>) => void;
    onItemFocus?: (result: MatchItem<T>) => void;
  };
  Blocks: {
    label: [];
    button: [];
    options: [
      component: WithBoundArgs<typeof ComboboxItem, 'isSelected'>,
      result: MatchItem<T>
    ];
    extra: [];
  };
}

/**
 * An editable combobox widget as described by the WAI ARIA Authoring Practices
 * Guide linked below.
 *
 * Supports four potential `autocomplete` behaviors:
 *
 * - `none` (default): No list filtration or inline autofill (except for on
 *   commit).
 * - `list`: List will filter based on input. Input will only be autofilled on
 *   commit.
 * - `inline`: Input will be autofilled. List will never filter.
 * - `both`: List will filter based on input AND input will be autofilled.
 *
 * @see {@link https://www.w3.org/WAI/ARIA/apg/patterns/combobox/}
 * @see {@link https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-none.html}
 * @see {@link https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-list.html}
 * @see {@link https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-both.html}
 */
export default class EditableCombobox<
  K extends string,
  T extends Record<K, string>
> extends Component<EditableComboboxSignature<K, T>> {
  <template>
    <label id="{{this.id}}-label" for="{{this.id}}-input" class={{@labelClass}}>
      {{yield to="label"}}
    </label>
    <Dropdown ...attributes class="Combobox--editable">
      <:trigger as |d|>
        <input
          data-test-combobox-input
          id="{{this.id}}-input"
          class="Combobox__input"
          type="text"
          role="combobox"
          autocomplete="off"
          aria-controls="{{this.id}}-listbox"
          aria-autocomplete={{this.autocomplete}}
          aria-expanded="{{d.isExpanded}}"
          {{this.registerInput}}
          {{on "click" (fn this.handleInputClick d)}}
          {{on "keydown" (fn this.handleInputKeyDown d)}}
          {{on "input" (fn this.handleInput d)}}
        />
        <ComboboxButton
          @listboxId="{{this.id}}-listbox"
          @expanded={{d.isExpanded}}
          @onClick={{fn this.handleButtonClick d}}
          @readonly={{this.readonly}}
          aria-labelledby="{{this.id}}-label"
          tabindex="-1"
        >
          {{#if (has-block "button")}}
            {{yield to="button"}}
          {{/if}}
        </ComboboxButton>
      </:trigger>
      <:content as |d|>
        <ul
          data-test-combobox-listbox
          id="{{this.id}}-listbox"
          class="Combobox__dropdown"
          role="listbox"
          aria-activedescendant={{this.idFor this.selection}}
          aria-labelledby="{{this.id}}-label"
        >
          {{#each
            (if this.hasListAutocomplete this.filteredList this.unfilteredList)
            key="refIndex"
            as |option|
          }}
            {{#let (this.isSelected option) as |isSelected|}}
              <li
                id={{this.idFor option}}
                role="option"
                {{on "click" (fn this.handleOptionClick d option)}}
                {{on "mousemove" (fn this.onItemMousemove option)}}
                {{on "focus" (fn this.onItemFocus option)}}
                aria-selected={{if isSelected "true" "false"}}
                {{this.scrollIntoView isSelected}}
              >
                {{yield
                  (component ComboboxItem isSelected=isSelected)
                  option
                  to="options"
                }}
              </li>
            {{/let}}
          {{else}}
            <li>
              <div class="ComboboxItem">
                No items{{if
                  this.query
                  (concat ' match the filter "' this.query '"')
                }}.
              </div>
            </li>
          {{/each}}
        </ul>
        {{yield to="extra"}}
      </:content>
    </Dropdown>
  </template>

  private id = guidFor(this);

  private get query(): string {
    return this.args.search.query;
  }

  @cached private get unfilteredList(): ReadonlyArray<MatchItem<T>> {
    return this.args.search.unfilteredResults;
  }

  @cached private get filteredList(): ReadonlyArray<MatchItem<T>> {
    return this.query ? this.args.search.results : this.unfilteredList;
  }

  @tracked private _selection: MatchItem<T> | null = null;

  private get selection(): MatchItem<T> | null {
    if (
      this._selection === null ||
      !this.args.search.items.includes(this._selection.item)
    ) {
      return null;
    } else {
      return this._selection;
    }
  }

  private set selection(newSelection: MatchItem<T> | null) {
    this._selection = newSelection;
  }

  private get list(): ReadonlyArray<MatchItem<T>> {
    return this.hasListAutocomplete ? this.filteredList : this.unfilteredList;
  }

  private get firstOption(): MatchItem<T> | null {
    return this.list[0] ?? null;
  }

  private get lastOption(): MatchItem<T> | null {
    let { list } = this;
    return list[list.length - 1] ?? null;
  }

  private get nextOption(): MatchItem<T> | null {
    const { selection } = this;
    let nextOption: MatchItem<T> | undefined;
    if (selection) {
      let currentIndex = this.list.findIndex((r) => r.item === selection.item);
      nextOption = this.list[currentIndex + 1];
    }
    return nextOption ?? this.firstOption;
  }

  private get previousOption(): MatchItem<T> | null {
    const { selection } = this;
    let previousOption: MatchItem<T> | undefined;
    if (selection) {
      let currentIndex = this.list.findIndex((r) => r.item === selection.item);
      previousOption = this.list[currentIndex - 1];
    }
    return previousOption ?? this.lastOption;
  }

  private get readonly(): boolean {
    return this.args.readonly ?? false;
  }

  private get autocomplete(): Autocomplete {
    return this.args.autocomplete ?? 'none';
  }

  private get hasListAutocomplete(): boolean {
    return ['list', 'both'].includes(this.autocomplete);
  }

  private get hasInlineAutocomplete(): boolean {
    return ['inline', 'both'].includes(this.autocomplete);
  }

  private get resetOnCommit(): boolean {
    return this.args.resetOnCommit ?? false;
  }

  // Element registration

  private registerInput = modifier((el: HTMLInputElement) => {
    this._inputEl = el;
  });

  private _inputEl?: HTMLElement;

  private get inputEl(): HTMLInputElement {
    assert(
      `incorrect comboboxEl, was ${this._inputEl}`,
      this._inputEl instanceof HTMLInputElement
    );
    return this._inputEl;
  }

  // Input events

  @action private handleInputClick(d: DropdownApi): void {
    this.acceptSuggestion(this.inputEl.value);
    d.toggle();
  }

  @action private handleInputKeyDown(
    d: DropdownApi,
    event: KeyboardEvent
  ): void {
    let { key, altKey, ctrlKey, shiftKey } = event;

    if (ctrlKey || shiftKey) {
      return;
    }

    let value = squish(this.inputEl.value);
    let shouldConsumeEvent = false;

    switch (key) {
      case 'Enter': {
        this.acceptSuggestion(value, null);
        d.toggle({
          didClose: () => {
            if (this.selection) {
              this.commitSelection();
            }
          },
        });

        shouldConsumeEvent = true;
        break;
      }
      case 'Down':
      case 'ArrowDown': {
        this.setSelection(
          this.selectionForArrow(altKey, value, {
            selection: this.selection,
            incrementedSelection: this.nextOption,
            initialSelection: this.firstOption,
          }),
          {
            updateAutocomplete: !altKey,
          }
        );
        d.open();
        shouldConsumeEvent = true;
        break;
      }
      case 'Up':
      case 'ArrowUp': {
        this.setSelection(
          altKey
            ? this.selection
            : this.selection
            ? this.previousOption
            : this.lastOption,
          {
            updateAutocomplete: !altKey,
          }
        );
        d.open();
        shouldConsumeEvent = true;
        break;
      }
      case 'Left':
      case 'ArrowLeft':
      case 'Right':
      case 'ArrowRight': {
        this.acceptSuggestion(value, null);
        if (value) {
          d.open();
        }
        // NOTE: Do not set `shouldConsumeEvent = true` here. It will prevent
        // the cursor from moving. Unfortunately, there is no good way to test
        // this behavior.
        break;
      }
      case 'Esc':
      case 'Escape': {
        // NOTE: Dismissible will handle the first time Escape is pressed
        if (!d.isExpanded) {
          this.setSelection(null);
          this.commitSelection();
        }
        break;
      }
      case 'Home': {
        this.acceptSuggestion(value, [0, 0]);
        if (value) {
          d.open();
        }
        shouldConsumeEvent = true;
        break;
      }
      case 'End': {
        this.acceptSuggestion(value);
        if (value) {
          d.open();
        }
        shouldConsumeEvent = true;
        break;
      }
    }

    if (shouldConsumeEvent) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  private selectionForArrow(
    altKey: boolean,
    inputValue: string,
    {
      selection,
      incrementedSelection,
      initialSelection,
    }: {
      selection: MatchItem<T> | null;
      incrementedSelection: MatchItem<T> | null;
      initialSelection: MatchItem<T> | null;
    }
  ): MatchItem<T> | null {
    let { hasInlineAutocomplete } = this;
    if (
      altKey ||
      (hasInlineAutocomplete &&
        selection &&
        this.valueFor(selection) !== inputValue)
    ) {
      return selection;
    } else if (selection) {
      return incrementedSelection;
    } else {
      return initialSelection;
    }
  }

  @action private async handleInput(
    d: DropdownApi,
    _event: Event
  ): Promise<void> {
    let inputValue = squish(this.inputEl.value);

    await this.setFilter(inputValue, false);
    if (inputValue) {
      let match = this.filteredList[0] ?? null;
      this.setSelection(match, { updateAutocomplete: false });
    } else {
      this.setSelection(null);
    }

    if (inputValue) {
      d.open();
    }
  }

  // Button events

  @action private handleButtonClick(d: DropdownApi): void {
    this.inputEl.focus();
    this.handleInputClick(d);
  }

  // Listbox events

  @action private handleOptionClick(
    d: DropdownApi,
    option: MatchItem<T>
  ): void {
    this.setSelection(option, { updateAutocomplete: false });
    this.commitSelection();
    d.close();
    this.inputEl.focus();
  }

  @action private onItemMousemove(option: MatchItem<T>): void {
    this.args.onItemMousemove?.(option);
  }

  @action private onItemFocus(option: MatchItem<T>): void {
    this.args.onItemFocus?.(option);
  }

  // State management

  private async setValue(
    selection: MatchItem<T> | null,
    { forceInlineAutocomplete = false, updateFilter = false } = {}
  ): Promise<void> {
    let value = this.valueFor(selection);
    if (forceInlineAutocomplete || this.hasInlineAutocomplete) {
      this.inputEl.value = value ?? '';
    }

    if (updateFilter) {
      await this.setFilter(value, true);
    } else {
      this.inputEl.setSelectionRange(0, value?.length ?? 0);
    }
  }

  private async acceptSuggestion(
    value: string,
    selectionRange: [start: number, end: number] | null = null
  ): Promise<void> {
    if (this.hasInlineAutocomplete) {
      await this.setFilter(value, true);
    }
    if (selectionRange) {
      this.inputEl.setSelectionRange(...selectionRange);
    } else {
      let selectionValue = this.valueFor(this.selection);
      this.inputEl.setSelectionRange(
        selectionValue.length,
        selectionValue.length
      );
    }
  }

  private async setFilter(
    newFilter: string,
    skipTimeout: boolean
  ): Promise<void> {
    try {
      await this.debouncedSetFilter.perform(
        newFilter,
        isBlank(this.query) || skipTimeout
      );
    } catch (error: unknown) {
      if (!didCancel(error)) {
        throw error;
      }
    }
  }

  private debouncedSetFilter = task(
    { restartable: true },
    async (newFilter: string, skipTimeout: boolean): Promise<void> => {
      if (newFilter === this.query) {
        return;
      }

      if (!skipTimeout) {
        await timeout(Ember.testing ? 0 : 250);
      }

      this.args.search.query = newFilter;

      // Remove selection if the newly filtered list doesn't contain it
      let { selection } = this;
      if (
        !this.filteredList.some((r) => selection && r.item === selection.item)
      ) {
        this.selection = null;
      }
    }
  );

  private valueFor(option: MatchItem<T> | null): string {
    return option ? option.item[this.args.valueField] : '';
  }

  private setSelection(
    selection: MatchItem<T> | null,
    { updateAutocomplete = true } = {}
  ): void {
    this.selection = selection;

    if (updateAutocomplete && this.hasInlineAutocomplete) {
      this.setValue(selection);
    }

    this.args.onSelect?.(selection);
  }

  private commitSelection(): void {
    let { selection } = this;
    this.args.onCommit?.(selection);
    this.setValue(this.resetOnCommit ? null : selection, {
      forceInlineAutocomplete: true,
      updateFilter: true,
    });
  }

  // Misc

  @action private idFor(option: MatchItem<T> | null): string | undefined {
    return option
      ? `${this.id}-option-${dasherize(this.valueFor(option))}`
      : undefined;
  }

  @action private isSelected(option: MatchItem<T>): boolean {
    let { selection } = this;
    return !!selection && selection.item === option.item;
  }

  // NOTE: This assumes we'll only have one selection. If we implement
  // multi-select, we'll have to get more creative
  private scrollIntoView = modifier(
    (el: HTMLLIElement, [isSelected]: [isSelected: boolean]) => {
      if (isSelected) {
        el.scrollIntoView(false);
      }
    }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Combobox::Editable': typeof EditableCombobox;
  }
}
