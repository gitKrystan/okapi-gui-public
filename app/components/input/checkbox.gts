import { Input } from '@ember/component';
import { modifier } from 'ember-modifier';
import Component from '@glimmer/component';
import Icon from 'okapi/components/icon';

function enforceReadonly(this: HTMLInputElement): void {
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
  }
);

interface CheckboxSignature {
  Element: HTMLInputElement;
  Args: {
    checked: boolean | undefined;
    readonly?: boolean | undefined;
  };
  Blocks: {
    before: [];
    after: [];
  };
}

/**
 * A basic reusable checkbox component with custom styles.
 *
 * Can be made "readonly" by passing `@readonly={{true}}`. (Because the
 * `readonly` attribute is essentially no-op for checkbox inputs.)
 */
export default class Checkbox extends Component<CheckboxSignature> {
  <template>
    <label class="Checkbox">
      {{yield to="before"}}
      <Input
        @type="checkbox"
        @checked={{@checked}}
        class="Checkbox__input"
        ...attributes
        {{maybeReadonly @readonly}}
        readonly={{@readonly}}
      />
      <div class="Checkbox__icon">
        {{#if @checked}}
          <Icon @type="mini" @id="check" />
        {{/if}}
      </div>
      {{yield to="after"}}
    </label>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'Input::Checkbox': typeof Checkbox;
  }
}
