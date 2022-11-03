import Component from '@glimmer/component';

export interface ButtonSig {
  Element: HTMLButtonElement;
  Blocks: { default: [] };
}

export default class Button extends Component<ButtonSig> {
  <template>
    <button type="button" ...attributes>
      {{yield}}
    </button>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Button: typeof Button;
  }
}
