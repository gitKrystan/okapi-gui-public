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

export default class ComboboxItem extends Component<ComboboxItemSignature> {
  <template>
    <div class="ComboboxItem" ...attributes>
      <div>
        {{yield}}
      </div>
      <div class="Icon-wrapper--mini">
        {{#if @isSelected}}
          <Icon @type="mini" @id="check" />
        {{/if}}
      </div>
    </div>
  </template>
}
