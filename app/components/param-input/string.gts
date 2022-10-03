import { Textarea } from '@ember/component';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';

import { StringParam } from 'okapi/models/param/index';
import expandingTextarea from 'okapi/modifiers/expanding-textarea';
import { ParamSig } from './index';

export default class StringInput extends Component<ParamSig<StringParam>> {
  <template>
    <Textarea
      ...attributes
      id={{@id}}
      class="MethodInfo__text-input"
      aria-labelledby="{{@id}}-label"
      data-test-param-input={{@id}}
      placeholder={{if @readonly "..." "Input a string value here."}}
      readonly={{@readonly}}
      @value={{@param.inputValue}}
      {{expandingTextarea @param.inputValue}}
      {{on "change" (fn @onChange @param.value)}}
    />
  </template>
}
