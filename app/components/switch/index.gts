import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';

interface SwitchSig {
  Element: HTMLButtonElement;
  Args: {
    value: boolean;
    onToggle: (value: boolean) => void;
  };
  Blocks: {
    label: [];
    off: [];
    on: [];
  };
}

export default class Switch extends Component<SwitchSig> {
  private get checked(): boolean {
    return this.args.value;
  }

  @action private toggle(): void {
    this.args.onToggle(!this.args.value);
  }

  <template>
    <button
      class="Switch"
      ...attributes
      type="button"
      role="switch"
      aria-checked="{{this.checked}}"
      {{on "click" this.toggle}}
    >
      {{#if (has-block "label")}}
        <span class="Switch__label" data-test-switch-label>
          {{yield to="label"}}
        </span>
      {{/if}}
      <span class="Switch__icon">
        <span
          class="Switch__icon__toggle
            {{if this.checked 'Switch__icon__toggle--checked'}}"
        ></span>
      </span>
      <span class="Switch__option" data-test-switch-option>
        {{#if this.checked}}
          {{#if (has-block "on")}}
            {{yield to="on"}}
          {{else}}
            {{! role="switch" on the button means "on" will already be read }}
            <span aria-hidden="true">on</span>
          {{/if}}
        {{else}}
          {{#if (has-block "off")}}
            {{yield to="off"}}
          {{else}}
            {{! role="switch" on the button means "off" will already be read }}
            <span aria-hidden="true">off</span>
          {{/if}}
        {{/if}}
      </span>
    </button>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Switch: typeof Switch;
  }
}
