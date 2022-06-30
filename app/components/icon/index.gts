import Component from '@glimmer/component';

export interface IconSig {
  Element: SVGElement;
  Args: {
    type: 'outline' | 'solid';
    id: string;
  }
}

export default class Icon extends Component<IconSig> {
  <template>
    <svg class="Icon  Icon--{{@type}}" ...attributes>
      <use xlink:href="#{{@type}}__{{@id}}" />
    </svg>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Icon: typeof Icon;
  }
}
