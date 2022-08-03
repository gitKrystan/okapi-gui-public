import { Input } from '@ember/component';
import Component from '@glimmer/component';

import { NumberParam } from 'okapi/models/method-call';
import ParamInputSig from './signature';

export default class NumberInput extends Component<ParamInputSig<NumberParam>> {
  <template>
    <Input
      ...attributes
      id={{@id}}
      class="MethodInfo__text-input"
      aria-labelledby="{{@id}}-label"
      data-test-param-input={{@id}}
      placeholder={{if @readonly "..." "Input a number value here."}}
      inputmode="number"
      readonly={{@readonly}}
      @type="text"
      @value={{@param.inputValue}}
    />
  </template>
}
