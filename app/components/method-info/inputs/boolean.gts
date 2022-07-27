import Component from '@glimmer/component';
import Checkbox from 'okapi/components/input/checkbox';
import { BooleanParam } from 'okapi/models/method-call';
import ParamInputSig from './signature';

export default class BooleanInput extends Component<ParamInputSig<BooleanParam>> {
  <template>
    <Checkbox
      id={{@id}}
      data-test-param-input={{@id}}
      @readonly={{@readonly}}
      @checked={{@param.value}}
    />
  </template>
}
