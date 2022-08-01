import { on } from '@ember/modifier';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';
import Button from 'okapi/components/button';
import Icon from 'okapi/components/icon';

export interface ComboboxButtonSignature {
  Element: HTMLButtonElement;
  Args: {
    listboxId: string;
    expanded: boolean;
    onInsert(target: HTMLElement): void;
    onKeydown(e: KeyboardEvent): void;
    onClick(e: Event): void;
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
      class="Combobox__button"
      role="combobox"
      aria-haspopup="listbox"
      aria-controls="{{@listboxId}}"
      aria-expanded="{{@expanded}}"
      data-test-combobox-button
      {{this.didInsert}}
      {{on "keydown" @onKeydown}}
      {{on "click" @onClick}}
    >
      {{yield}} <Icon @type="solid" @id={{if @expanded "chevron-up" "chevron-down"}} />
    </Button>
  </template>

  private didInsert = modifier(
    (element: HTMLButtonElement) => {
      this.args.onInsert(element);
    },
    { eager: false }
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'combobox/button': typeof ComboboxButton;
  }
}
