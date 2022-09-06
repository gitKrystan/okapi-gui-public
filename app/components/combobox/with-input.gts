import { assert } from '@ember/debug';
import { concat, fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { dasherize } from '@ember/string';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import { modifier } from 'ember-modifier';
import eq from 'ember-truth-helpers/helpers/eq';

import Button from 'okapi/components/button';
import Dropdown from 'okapi/components/dropdown/index';
// Ideally we'd re-export from the dropdown component but that's not working yet
// with GTS.
import DropdownApi from 'okapi/components/dropdown/private/api';
import Icon from 'okapi/components/icon';

type Autocomplete =
  /** No list filtration or inline autofill (except for on commit). */
  | 'none'
  /** List will filter based on input. Input will only be autofilled on commit. */
  | 'list'
  /** Input will be autofilled. List will never filter. */
  | 'inline'
  /** List will filter based on input and input will be autofilled. */
  | 'both';

export interface ComboboxSignature<T extends { id: string }> {
  Element: HTMLDivElement;
  Args: {
    options: T[];
    autocomplete?: Autocomplete;
    readonly?: boolean;
    labelClass?: string;
    onSelect?: (selection: T | null) => void;
    onCommit?: (selection: T | null) => void;
    onItemMousemove?: (option: T) => void;
    onItemFocus?: (option: T) => void;
  };
  Blocks: {
    label: [];
    button: [];
    options: [option: T];
    empty: [];
    extra: [];
  };
}

/**
 * FIXME
 */
export default class Combobox<T extends { id: string }> extends Component<
  ComboboxSignature<T>
> {
  <template>
    <label id="{{this.id}}-label" for="{{this.id}}-input" class={{@labelClass}}>
      {{yield to="label"}}
    </label>
    <Dropdown ...attributes class="Combobox--has-input">
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
        {{on "focus" this.handleInputFocus}}
        {{on "blur" this.handleInputBlur}}
        {{on "click" (fn this.handleInputClick d)}}
        {{on "keydown" (fn this.handleInputKeyDown d)}}
        {{on "input" (fn this.handleInput d)}}
      />
      {{!-- FIXME: Use component --}}
      <Button
        data-test-combobox-button
        class="Combobox__button {{if @readonly 'Combobox__button--readonly'}}"
        role="combobox"
        aria-haspopup="listbox"
        aria-controls="{{this.id}}-listbox"
        aria-expanded="{{d.isExpanded}}"
        aria-labelledby="{{this.id}}-label"
        tabindex="-1"
        {{on "click" (fn this.handleButtonClick d)}}
      >
        {{#if (has-block "button")}}
          {{yield to="button"}}
        {{/if}}
        {{#if this.isEnabled}}
          <Icon
            @type="solid"
            @id={{if d.isExpanded "chevron-up" "chevron-down"}}
          />
        {{/if}}
      </Button>
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
            (if this.hasListAutocomplete this.filteredOptions @options)
            as |option|
          }}
            {{#let (eq option this.selection) as |isSelected|}}
              <li
                id={{this.idFor option}}
                role="option"
                {{on "click" (fn this.handleOptionClick d option)}}
                {{on "mousemove" (fn this.onItemMousemove option)}}
                {{on "focus" (fn this.onItemFocus option)}}
                aria-selected={{if isSelected "true" "false"}}
              >
                {{yield option to="options"}}
              </li>
            {{/let}}
          {{else}}
            <li>
              {{#if (has-block "empty")}}
                {{yield to="empty"}}
              {{else}}
                <div class="Combobox__item">
                  No items{{if
                    this.filter
                    (concat ' match the filter "' this.filter '"')
                  }}.
                </div>
              {{/if}}
            </li>
          {{/each}}
          {{yield to="extra"}}
        </ul>
      </:content>
    </Dropdown>
  </template>

  private id = guidFor(this);

  @tracked private hasFocus = false;

  @tracked private filter = '';

  @tracked private filteredOptions: T[] = this.args.options;

  @tracked private selection: T | null = null;

  private get options(): T[] {
    return this.hasListAutocomplete ? this.filteredOptions : this.args.options;
  }

  private get firstOption(): T | null {
    return this.options[0] ?? null;
  }

  private get lastOption(): T | null {
    let { options } = this;
    return options[options.length - 1] ?? null;
  }

  private get nextOption(): T | null {
    let { selection } = this;
    if (selection && selection !== this.lastOption) {
      let index = this.options.indexOf(selection);
      return this.options[index + 1] ?? null;
    }
    return this.firstOption;
  }

  private get previousOption(): T | null {
    let { selection } = this;
    if (selection && selection !== this.firstOption) {
      let index = this.options.indexOf(selection);
      return this.options[index - 1] ?? null;
    }
    return this.lastOption;
  }

  get inputHasActiveFocus(): boolean {
    return this.hasFocus && !this.selection;
  }

  get listboxHasActiveFocus(): boolean {
    return this.hasFocus && !!this.selection;
  }

  private get isEnabled(): boolean {
    return !this.args.readonly;
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

  // Element registration

  private registerInput = modifier(
    (el: HTMLInputElement) => {
      this._inputEl = el;
    },
    { eager: false }
  );

  private _inputEl?: HTMLElement;

  private get inputEl(): HTMLInputElement {
    assert(
      `incorrect comboboxEl, was ${this._inputEl}`,
      this._inputEl instanceof HTMLInputElement
    );
    return this._inputEl;
  }

  // Input events

  @action private handleInputFocus(): void {
    this.hasFocus = true;
  }

  @action private handleInputBlur(): void {
    this.hasFocus = false;
  }

  @action private handleInputClick(d: DropdownApi): void {
    d.toggle();
  }

  @action private handleInputKeyDown(d: DropdownApi, event: KeyboardEvent): void {
    let { key, altKey, ctrlKey, shiftKey, metaKey } = event;

    if (ctrlKey || shiftKey || metaKey) {
      return;
    }

    console.warn('handleInputKeyDown', { key });

    let value = this.inputEl.value;
    let shouldConsumeEvent = false;

    switch (key) {
      case 'Enter':
        d.toggle({
          didClose: () => this.commitSelection()
        });

        shouldConsumeEvent = true;
        break;

      case 'Down':
      case 'ArrowDown':
        this.setSelection(
          altKey
            ? this.selection
            : this.nextOption ?? this.selection ?? this.firstOption,
          {
            updateAutocomplete: !altKey,
            clearFilter: !this.hasListAutocomplete
          }
        );
        d.open();
        shouldConsumeEvent = true;
        break;

      case 'Up':
      case 'ArrowUp':
        this.setSelection(
          altKey
            ? this.selection
            : this.previousOption ?? this.selection ?? this.lastOption,
          {
            updateAutocomplete: !altKey,
            clearFilter: !this.hasListAutocomplete
          }
        );
        d.open();
        shouldConsumeEvent = true;
        break;

      case 'Left':
      case 'ArrowLeft':
      case 'Right':
      case 'ArrowRight':
        this.acceptSuggestion(d, value);
        // NOTE: Do not set `shouldConsumeEvent = true` here. It will prevent
        // the cursor from moving. Unfortunately, there is no good way to test
        // this behavior.
        break;

      case 'Esc':
      case 'Escape':
        // NOTE: Dismissible will handle the first time Escape is pressed
        if (!d.isExpanded) {
          this.setSelection(null);
          this.commitSelection();
        }
        break;

      case 'Home':
        this.acceptSuggestion(d, value);
        this.inputEl.setSelectionRange(0, 0);
        shouldConsumeEvent = true;
        break;

      case 'End':
        this.acceptSuggestion(d, value);
        this.inputEl.setSelectionRange(value.length, value.length);
        shouldConsumeEvent = true;
        break;
    }

    if (shouldConsumeEvent) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  @action private handleInput(d: DropdownApi, _event: Event): void {
    let value = this.inputEl.value;

    console.warn('handleInput', { value, filter: this.filter });

    this.setValue({ filter: value });
    if (value) {
      let match = this.filteredOptions[0] ?? null;
      this.setSelection(match, {
        updateAutocomplete: !!match
      });
      d.open();
    } else {
      this.setSelection(null);
    }
  }

  // Button events

  @action private handleButtonClick(d: DropdownApi): void {
    this.inputEl.focus();
    this.handleInputClick(d);
  }

  // Listbox events

  @action private handleOptionClick(d: DropdownApi, option: T): void {
    this.setSelection(option);
    this.commitSelection();
    d.close();
    this.inputEl.focus();
  }

  @action private onItemMousemove(option: T): void {
    this.args.onItemMousemove?.(option);
  }

  @action private onItemFocus(option: T): void {
    this.args.onItemFocus?.(option);
  }

  // State management

  private acceptSuggestion(d: DropdownApi, filter: string): void {
    this.setValue({ filter }, { setSelectionRange: false });
    if (filter) {
      d.open();
    } else {
      this.setSelection(null);
    }
  }

  private setValue(
    {
      filter = null,
      suggestion = null
    }: { filter?: string | null; suggestion?: string | null },
    { setSelectionRange = true } = {}
  ) {
    console.warn('setValue', { filter, suggestion, setSelectionRange }); // FIXME

    if (!this.hasInlineAutocomplete) {
      suggestion = '';
    }
    this.filterOptions(filter ?? '');
    this.inputEl.value = `${filter ?? ''}${suggestion ?? ''}`;

    if (setSelectionRange) {
      let selectionStart = filter?.length ?? 0;
      let selectionEnd = selectionStart + (suggestion?.length ?? 0);
      this.inputEl.setSelectionRange(selectionStart, selectionEnd);
    }
  }

  private filterOptions(newFilter?: string): void {
    if (newFilter === this.filter) {
      return;
    }

    console.warn('filterOptions', { newFilter, oldFilter: this.filter }); // FIXME

    if (typeof newFilter === 'string') {
      this.filter = newFilter;
    }

    let filter = this.filter.toLowerCase();
    if (filter.length) {
      this.filteredOptions = this.args.options.filter(o =>
        this.getLowercaseContent(o).startsWith(filter)
      );
    } else {
      this.filteredOptions = this.args.options;
    }
  }

  private setSelection(
    selection: T | null,
    { updateAutocomplete = true, clearFilter = false } = {}
  ): void {
    console.warn('setSelection', { selection, updateAutocomplete }); // FIXME

    this.selection = selection;

    if (updateAutocomplete && this.hasInlineAutocomplete) {
      if (selection) {
        let filter = clearFilter ? '' : this.filter;
        let value = selection?.id ?? '';
        let filterTest = new RegExp(`^${filter}`);
        let suggestion = value.replace(filterTest, '');
        this.setValue({ filter, suggestion });
      } else {
        this.setValue({ filter: null, suggestion: null });
      }
    }

    this.args.onSelect?.(selection);
  }

  private commitSelection(): void {
    console.warn('commitSelection', { selection: this.selection }); // FIXME
    let { selection } = this;
    this.setValue({ filter: selection?.id ?? '' });
    this.args.onCommit?.(selection);
  }

  // Misc

  @action private idFor(option: T | null): string | undefined {
    return option ? `${this.id}-option-${dasherize(option.id)}` : undefined;
  }

  private getLowercaseContent(option: T): string {
    // FIXME: Allow dev to specify inner El for content
    return option.id.toLowerCase();
  }
}

// FIXME: BUGS
// Backspace not working w/ inline?
// Case insensitive search broken w/ inline
