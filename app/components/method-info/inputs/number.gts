import { fn } from '@ember/helper';
import Component from '@glimmer/component';

import { default as BaseNumberInput } from 'okapi/components/input/number';
import { NumberParam } from 'okapi/models/method-call';
import ParamInputSig from './signature';

export default class NumberInput extends Component<ParamInputSig<NumberParam>> {
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
    />
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'MethodInfo::Inputs::Number': typeof NumberInput;
  }
}
