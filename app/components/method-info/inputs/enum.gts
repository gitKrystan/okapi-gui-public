import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import eq from 'ember-truth-helpers/helpers/eq';
import or from 'ember-truth-helpers/helpers/or';

import Combobox from 'okapi/components/combobox/select-only';

export interface ParamListSig {
  Element: HTMLElement;
  Args: {},
  Blocks: {
    default: [];
  }
}

type EnumItem = {
  name: string;
  description: string;
}

export default class ParamList extends Component<ParamListSig> {
  private get showDescription(): boolean {
    return this.todoEnumItems.any(i => isPresent(i.description));
  }

  private get todoEnumItems(): EnumItem[] {
    return [
      { name: 'yes', description: 'Absolutely yes' },
      { name: 'no', description: 'Absolutely no' },
      { name: 'maybe', description: 'Absolutely maybe' }
    ];
  }

  @tracked private committedItem?: EnumItem;

  @action private commitItem(item: EnumItem): void {
    this.descriptionItem = item;
    this.committedItem = item;
  }

  @tracked private descriptionItem?: EnumItem;

  @action private updateDescription(item: EnumItem): void {
    this.descriptionItem = item;
  }

  <template>
    <Combobox
      @items={{this.todoEnumItems}}
      @onItemMousemove={{this.updateDescription}}
      @onSelection={{this.updateDescription}}
      @onCommit={{this.commitItem}}
      @initialSelection={{this.committedItem}}
    >
      <:trigger as |Trigger|>
        <Trigger aria-labelledby="listbox-label">
          {{or this.committedItem.name "Click to select."}}
        </Trigger>
      </:trigger>
      <:content as |List|>
        <List aria-labelledby="listbox-label">
          <:items as |item|>
            <div class="Combobox__item {{if (eq item this.descriptionItem) 'Combobox__item--is-description-item'}}">
              {{item.name}}
            </div>
          </:items>
        </List>
        {{#if this.showDescription}}
          <div class="Combobox__dropdown__info">
            {{or this.descriptionItem.description "No description provided."}}
          </div>
        {{/if}}
      </:content>
    </Combobox>
  </template>
}
