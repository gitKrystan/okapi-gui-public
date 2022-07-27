import { fn } from '@ember/helper';
import Component from '@glimmer/component';
import { default as BaseNumberInput } from 'okapi/components/input/number';
import { NumberParam } from 'okapi/models/method-call';
import ParamInputSig from './signature';

export default class NumberInput extends Component<ParamInputSig<NumberParam>> {
  <template>
    <BaseNumberInput
      id={{@id}}
      class="MethodInfo__text-input"
      data-test-param-input={{@id}}
      placeholder={{if @readonly "..." "Input a number value here."}}
      readonly={{@readonly}}
      @value={{@param.value}}
      @onChange={{fn (mut @param.value)}}
    />
  </template>
}