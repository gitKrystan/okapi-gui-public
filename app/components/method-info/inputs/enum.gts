import { action } from '@ember/object';
import { isPresent } from '@ember/utils';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import eq from 'ember-truth-helpers/helpers/eq';
import or from 'ember-truth-helpers/helpers/or';

import Combobox from 'okapi/components/combobox/select-only';
import { EnumMethodParamOption } from 'okapi/models/method';
import { EnumParam } from 'okapi/models/method-call';
import ParamInputSig from './signature';

export default class EnumInput extends Component<ParamInputSig<EnumParam>> {
  private get items(): [null, ...EnumMethodParamOption[]] {
    return [null, ...this.args.param.info.options];
  }

  private get showDescription(): boolean {
    return this.items.any(i => isPresent(i?.description));
  }

  private get selection(): EnumMethodParamOption | null | undefined {
    return this.args.param.inputValue;
  }

  @action private handleSelect(item: EnumMethodParamOption | null): void {
    this.descriptionItem = item;
    this.args.param.inputValue = item;
  }

  @tracked private descriptionItem?: EnumMethodParamOption | null;

  @action private updateDescription(item: EnumMethodParamOption | null): void {
    this.descriptionItem = item;
  }

  <template>
    <Combobox
      @items={{this.items}}
      @onItemMousemove={{this.updateDescription}}
      @onFocus={{this.updateDescription}}
      @onSelect={{this.handleSelect}}
      @initialSelection={{this.selection}}
      @readonly={{@readonly}}
      ...attributes
    >
      <:trigger as |Trigger|>
        <Trigger
          id={{@id}}
          aria-labelledby="{{@id}}-label"
          data-test-param-input={{@id}}
        >
          {{#if this.selection}}
            {{this.selection.name}}
          {{else}}
            <span class="Combobox__button--empty">
              {{if @readonly "..." "Click to select."}}
            </span>
          {{/if}}
        </Trigger>
      </:trigger>
      <:content as |List|>
        <List data-test-enum-input-list aria-labelledby="listbox-label">
          <:items as |item|>
            <div class="Combobox__item {{if (eq item this.descriptionItem) 'Combobox__item--is-description-item'}}">
              {{or item.name "undefined"}}
            </div>
          </:items>
        </List>
        {{#if this.showDescription}}
          <div class="Combobox__dropdown__info">
            {{#if (eq this.descriptionItem null)}}
              If selected, this field will not be sent.
            {{else}}
              {{or this.descriptionItem.description "No description provided."}}
            {{/if}}
          </div>
        {{/if}}
      </:content>
    </Combobox>
  </template>
}
