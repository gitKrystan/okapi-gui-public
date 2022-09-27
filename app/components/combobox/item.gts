import Component from '@glimmer/component';

import Icon from 'okapi/components/icon';

export interface ComboboxItemSignature {
  Element: HTMLDivElement;
  Args: {
    isSelected: boolean;
  };
  Blocks: {
    default: [];
  };
}

export default class ComboboxItem<T> extends Component<ComboboxItemSignature> {
  <template>
    <div class="ComboboxItem" ...attributes>
      <div>
        {{yield}}
      </div>
      <div class="ComboboxItem__icon-wrapper">
        {{#if @isSelected}}
          <Icon @type="solid" @id="check" />
        {{/if}}
      </div>
    </div>
  </template>
}
