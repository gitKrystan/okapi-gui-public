import { Input } from '@ember/component';
import { modifier } from 'ember-modifier';
import { guidFor } from '@ember/object/internals';
import Component from '@glimmer/component';
import Icon from 'okapi/components/icon';

function enforceReadonly(this: HTMLInputElement) {
  // HACK: Undo the input event.
  this.checked = !this.checked;
}

const maybeReadonly = modifier(
  (element: HTMLInputElement, [isReadonly]: [boolean | undefined]) => {
    if (isReadonly) {
      element.addEventListener('input', enforceReadonly);
    } else {
      element.removeEventListener('input', enforceReadonly);
    }

    return () => {
      element.removeEventListener('input', enforceReadonly);
    };
  },
  { eager: false }
);

interface CheckboxSignature {
  Element: HTMLInputElement;
  Args: {
    checked: boolean | undefined;
    readonly?: boolean;
  };
}

/**
 * A basic reusable checkbox component with custom styles.
 * Must be placed inside of a `<label>` element.
 * Can be made "readonly" by passing `@readonly={{true}}`. (Because the
 * `readonly` attribute is essentially no-op for checkbox inputs.)
 */
export default class Checkbox extends Component<CheckboxSignature> {
  <template>
    <Input
      @type="checkbox"
      @checked={{@checked}}
      class="Checkbox"
      ...attributes
      {{maybeReadonly @readonly}}
      readonly={{@readonly}}
    />
    <div class="Checkbox-icon">
      {{#if @checked}}
        <Icon @type="solid" @id="check" />
      {{/if}}
    </div>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Checkbox: typeof Checkbox;
  }
}
