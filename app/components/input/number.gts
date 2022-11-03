import { assert } from '@ember/debug';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

export interface NumberInputSig {
  Element: HTMLInputElement;
  Args: {
    value: string | null | undefined;
    onValueUpdate(newValue: string | null | undefined): void;
  };
}

/**
 * A reusable Number Input element with a better UX for mode use-cases than the
 * default "spinbutton" behavior of `<input type="number" />`.
 */
export default class NumberInput extends Component<NumberInputSig> {
  <template>
    <input
      ...attributes
      type="text"
      inputmode="number"
      value={{this.value}}
      {{on "input" this.updateValue}}
      {{on "focusout" this.normalizeValue}}
    />
  </template>

  private get value(): string | null | undefined {
    return this.args.value;
  }

  private set value(newValue: string | null | undefined) {
    this.args.onValueUpdate(newValue);
  }

  /**
   * Remove any non-numeric characters and additional decimals on input.
   * It's OK to remove these on `change` because the user should not be
   * intentionally typing these characters. This behavior mimics the built-in
   * number input.
   */
  @action updateValue(event: Event): void {
    assert(
      'expected event target to be an input element',
      event.target instanceof HTMLInputElement
    );

    let [value, ...parts] = event.target.value
      .replace(/[^-0-9.]/g, '')
      .split('.');

    assert('expected value to exist', typeof value === 'string');

    parts.forEach((part, i) => {
      if (i === 0) {
        value += '.';
      }
      value += part;
    });

    this.value = value;
  }

  /**
   * Set value to empty string if it's just a '.' or '-'.
   * We can't do this on `change` because the user may still be typing.
   */
  @action normalizeValue(event: Event): void {
    assert(
      'expected event target to be an input element',
      event.target instanceof HTMLInputElement
    );

    if (['.', '-'].includes(event.target.value)) {
      this.value = '';
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Input::Number': typeof NumberInput;
  }
}
