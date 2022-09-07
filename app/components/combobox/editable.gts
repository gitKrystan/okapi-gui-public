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

import Dropdown from 'okapi/components/dropdown/index';
// Ideally we'd re-export from the dropdown component but that's not working yet
// with GTS.
import DropdownApi from 'okapi/components/dropdown/private/api';
import Icon from 'okapi/components/icon';
import ComboboxButton from './button';

type Autocomplete = 'none' | 'list' | 'inline' | 'both';

export interface EditableComboboxSignature<T extends { id: string }> {
  Element: HTMLDivElement;
  Args: {
    options: T[];
    autocomplete?: Autocomplete;
    caseSensitive?: boolean;
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
 * An editable combobox widget as described by the WAI ARIA Authoring Practices
 * Guide linked below.
 *
 * Supports four potential `autocomplete` behaviors:
 *
 * - `none` (default): No list filtration or inline autofill (except for on commit).
 * - `list`: List will filter based on input. Input will only be autofilled on commit.
 * - `inline`: Input will be autofilled. List will never filter.
 * - `both`: List will filter based on input AND input will be autofilled.
 *
 * @see { @link https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ }
 * @see { @link https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-none.html }
 * @see { @link https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-list.html }
 * @see { @link https://www.w3.org/WAI/ARIA/apg/example-index/combobox/combobox-autocomplete-both.html }
 */
export default class EditableCombobox<T extends { id: string }> extends Component<
  EditableComboboxSignature<T>
> {
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
          {{on "focus" this.handleInputFocus}}
          {{on "blur" this.handleInputBlur}}
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

  private get caseSensitive(): boolean {
    return this.args.caseSensitive ?? false;
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

  @action private handleInputKeyDown(
    d: DropdownApi,
    event: KeyboardEvent
  ): void {
    let { key, altKey, ctrlKey, shiftKey, metaKey } = event;

    if (ctrlKey || shiftKey || metaKey) {
      return;
    }

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

  @action private handleInput(d: DropdownApi, event: Event): void {
    assert(
      'Input event should be InputEvent. If you are writing a test, use the `fireInputEvent` helper instead of `fillIn`.',
      event instanceof InputEvent
    );

    let value = this.inputEl.value;

    this.setValue({ filter: value });
    if (value) {
      let match = this.filteredOptions[0] ?? null;
      this.setSelection(match, {
        updateAutocomplete:
          !!match &&
          // If `event.data` is null, the user is deleting text, so don't update
          // the autocomplete, because this will likely just replace the text
          // they just deleted. There is no good way to test this behavior,
          // so be very careful if you delete this line.
          event.data !== null
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

    if (typeof newFilter === 'string') {
      this.filter = newFilter;
    }

    let { filterPredicate } = this;
    this.filteredOptions = this.args.options.filter(filterPredicate);
  }

  private get filterPredicate(): (option: T) => boolean {
    let { caseSensitive, filter } = this;

    if (filter.length) {
      let transform = (text: string): string =>
        caseSensitive ? text : text.toLowerCase();
      filter = transform(filter);
      return (option: T) => transform(option.id).startsWith(filter);
    } else {
      return () => true;
    }
  }

  private setSelection(
    selection: T | null,
    { updateAutocomplete = true, clearFilter = false } = {}
  ): void {
    this.selection = selection;

    if (updateAutocomplete && this.hasInlineAutocomplete) {
      if (selection) {
        let filter = clearFilter ? '' : this.filter;
        let value = selection?.id ?? '';
        let filterTest = new RegExp(`^${filter}`, 'i');
        let suggestion = value.replace(filterTest, '');
        this.setValue({ filter, suggestion });
      } else {
        this.setValue({ filter: null, suggestion: null });
      }
    }

    this.args.onSelect?.(selection);
  }

  private commitSelection(): void {
    let { selection } = this;
    this.setValue({ filter: selection?.id ?? '' });
    this.args.onCommit?.(selection);
  }

  // Misc

  @action private idFor(option: T | null): string | undefined {
    return option ? `${this.id}-option-${dasherize(option.id)}` : undefined;
  }
}
