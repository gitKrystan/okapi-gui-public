import Component from '@glimmer/component';

export interface TokenSig {
  Element: HTMLElement;
  Args: {
    type: string;
  },
  Blocks: {
    default: [];
  }
}

export default class Token extends Component<TokenSig> {
  get classes(): string {
    return `Syntax__Token Syntax__Token--${
      this.args.type.split(' ').join(' Syntax__Token--')
    }`;
  }

  <template>
    <span class={{this.classes}} ...attributes>{{yield}}</span>
  </template>
}
