import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';

import { default as BaseNumberInput } from 'okapi/components/input/number';
import { NumberParam } from 'okapi/models/param/index';
import { ParamSig } from './index';

export default class NumberInput extends Component<ParamSig<NumberParam>> {
  <template>
    <BaseNumberInput
      ...attributes
      id={{@id}}
      class="MethodInfo__text-input"
      aria-labelledby="{{@id}}-label"
      data-test-param-input={{@id}}
      placeholder={{if @readonly "..." "Input a number value here."}}
      readonly={{@readonly}}
      @value={{@param.inputValue}}
      @onValueUpdate={{fn (mut @param.inputValue)}}
      {{on "change" (fn @onChange @param.value)}}
    />
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ParamInput::Number': typeof NumberInput;
  }
}
