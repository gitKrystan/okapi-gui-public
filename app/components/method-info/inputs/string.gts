import { Textarea } from '@ember/component';
import Component from '@glimmer/component';
import { StringParam } from 'okapi/models/method-call';
import expandingTextarea from 'okapi/modifiers/expanding-textarea';
import ParamInputSig from './signature';

export default class StringInput extends Component<ParamInputSig<StringParam>> {
  <template>
    <Textarea
      id={{@id}}
      class="MethodInfo__text-input"
      data-test-param-input={{@id}}
      placeholder={{if @readonly "..." "Input a string value here."}}
      readonly={{@readonly}}
      @value={{@param.value}}
      {{expandingTextarea @param.value}}
    />
  </template>
}
