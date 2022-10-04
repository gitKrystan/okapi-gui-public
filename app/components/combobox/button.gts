import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

import Button from 'okapi/components/button';
import Icon from 'okapi/components/icon';

export interface ComboboxButtonSignature {
  Element: HTMLButtonElement;
  Args: {
    listboxId: string;
    expanded: boolean;
    readonly: boolean;
    onClick(e: Event): void;
    onInsert?(target: HTMLElement): void;
    onKeydown?(e: KeyboardEvent): void;
  };
  Blocks: {
    default: [];
  };
}

/**
 * This component is not meant to be used outside of Combobox::SelectOnly.
 *
 * A button to toggle the collapsible listbox.
 */
export default class ComboboxButton extends Component<ComboboxButtonSignature> {
  <template>
    <Button
      ...attributes
      class="Combobox__button {{if @readonly 'Combobox__button--readonly'}}"
      role="combobox"
      aria-haspopup="listbox"
      aria-controls="{{@listboxId}}"
      aria-expanded="{{@expanded}}"
      data-test-combobox-button
      {{this.didInsert}}
      {{on "keydown" this.onKeydown}}
      {{on "click" this.onClick}}
    >
      {{yield}}
      {{#if this.enabled}}
        <Icon @type="mini" @id={{if @expanded "chevron-up" "chevron-down"}} />
      {{/if}}
    </Button>
  </template>

  private get enabled(): boolean {
    return !this.args.readonly;
  }

  private didInsert = modifier(
    (element: HTMLButtonElement) => {
      this.args.onInsert?.(element);
    },
    { eager: false }
  );

  @action private onKeydown(e: KeyboardEvent): void {
    if (this.enabled) {
      this.args.onKeydown?.(e);
    }
  }

  @action private onClick(e: Event): void {
    if (this.enabled) {
      this.args.onClick(e);
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'combobox/button': typeof ComboboxButton;
  }
}
