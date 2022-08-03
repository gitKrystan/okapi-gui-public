// FIXME: delete











import { Input } from '@ember/component';
import Component from '@glimmer/component';
import { on } from '@ember/modifier';
import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';

interface NumberInputSignature {
  Element: HTMLInputElement;
  Args: {
    value: number | null | undefined;
    onChange(value: number | null | undefined): void;
  };
}

/**
 * A reusable Number Input element with a better UX for mode use-cases than the
 * "spinbutton"
 */
export default class NumberInput extends Component<NumberInputSignature> {
  private pattern = '^[-,0-9.]+$';

  @tracked private stringValue = format(this.args.value);

  @action private handleChange(e: Event): void {
    assert('e.target should exist', e.target instanceof HTMLInputElement);

    let stringValue = e.target.value;
    let numericValue: number | null = null;

    if (stringValue) {
      let test = new RegExp(this.pattern);
      if (test.test(stringValue)) {
        let sign = stringValue.startsWith('-') ? -1 : 1;
        stringValue = stringValue.replace(/[^0-9.]/g, '');
        numericValue = sign * parseFloat(stringValue);

        if (isNaN(numericValue)) {
          e.target.setCustomValidity('Value is not a valid number.');
          numericValue = null;
        } else {
          e.target.setCustomValidity('');
          this.args.onChange(numericValue);
        }
      } else {
        e.target.setCustomValidity('Value is not a valid number. Contains invalid characters.');
      }
    }
  }

  private handleValueUpdate = modifier(
    (_element: HTMLInputElement, [value]: [number | null | undefined]) => {
      this.stringValue = format(value);
    },
    { eager: false }
  );

  <template>
    <Input
      @type="text"
      @value={{this.stringValue}}
      ...attributes
      inputmode="number"
      pattern={{this.pattern}}
      {{on "change" this.handleChange}}
      {{this.handleValueUpdate @value}}
    />
  </template>
}

function format(value: number | null | undefined): string | null {
  if (value === undefined || value === null) {
    return null;
  } else {
    return value.toLocaleString();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Input::Number': typeof NumberInput;
  }
}
