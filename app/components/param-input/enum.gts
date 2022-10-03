import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import eq from 'ember-truth-helpers/helpers/eq';
import or from 'ember-truth-helpers/helpers/or';

import Combobox from 'okapi/components/combobox/select-only';
import { EnumParam, EnumParamOption } from 'okapi/models/param/index';
import { ParamSig } from './index';

export default class EnumInput extends Component<ParamSig<EnumParam>> {
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
        <List data-test-enum-input-list>
          <:items as |item|>
            <div
              class="ComboboxItem
                {{if
                  (eq item this.descriptionItem)
                  'ComboboxItem--is-description-item'
                }}"
            >
              {{or item.name "undefined"}}
              <p class="u_visually-hidden">
                Description:
                {{this.descriptionFor item}}
              </p>
            </div>
          </:items>
        </List>
        {{! Hide this item from aria because we have a visually hidden description above. }}
        <div class="Combobox__description" aria-hidden="true">
          {{this.descriptionFor this.descriptionItem}}
        </div>
      </:content>
    </Combobox>
  </template>

  private get items(): [null, ...EnumParamOption[]] {
    return [null, ...this.args.param.info.options];
  }

  private get selection(): EnumParamOption | null | undefined {
    return this.args.param.inputValue;
  }

  @action private handleSelect(item: EnumParamOption | null): void {
    this.descriptionItem = item;
    this.args.param.inputValue = item;
    this.args.onChange(this.args.param.value);
  }

  @tracked private descriptionItem?: EnumParamOption | null;

  @action private updateDescription(item: EnumParamOption | null): void {
    this.descriptionItem = item;
  }

  @action private descriptionFor(
    item: EnumParamOption | null | undefined
  ): string {
    if (item === null) {
      return 'If selected, this field will not be set.';
    } else if (item === undefined) {
      return 'No item selected.';
    } else if (item.description) {
      return item.description;
    } else {
      return 'No description provided.';
    }
  }
}
