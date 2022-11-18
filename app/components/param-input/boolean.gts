import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import Component from '@glimmer/component';

import Checkbox from 'okapi/components/input/checkbox';
import type { BooleanParam } from 'okapi/models/param/index';
import type { ParamSig } from './index';

export default class BooleanInput extends Component<ParamSig<BooleanParam>> {
  <template>
    <Checkbox
      ...attributes
      id={{@id}}
      data-test-param-input={{@id}}
      aria-labelledby="{{@id}}-label"
      @readonly={{@readonly}}
      @checked={{@param.inputValue}}
      {{on "change" (fn @onChange @param.inputValue)}}
    />
  </template>
}
