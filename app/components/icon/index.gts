import Component from '@glimmer/component';

export interface IconSig {
  Element: SVGElement;
  Args: {
    id: string;
    type: 'outline' | 'solid' | 'mini';
  };
}

export default class Icon extends Component<IconSig> {
  get class(): string {
    return `Icon  Icon--${this.args.type}`;
  }

  <template>
    <svg class={{this.class}} ...attributes>
      <use xlink:href="#{{@type}}__{{@id}}"></use>
    </svg>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Icon: typeof Icon;
  }
}
