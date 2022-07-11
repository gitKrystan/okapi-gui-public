import { concat } from '@ember/helper';
import Component from '@glimmer/component';
import Token from 'okapi/components/syntax/token';
import Method from 'okapi/models/method';
import ScrollAnchor from 'okapi/modifiers/scroll-anchor';
import ParamList from './param-list';

export interface MethodInfoSig {
  Element: HTMLDivElement;
  Args: { method: Method };
}

export default class MethodInfo extends Component<MethodInfoSig> {
  <template>
    <div ...attributes>
      <p class="MethodInfo__description">{{@method.description}}</p>
      <ParamList @params={{@method.request}}>
        <a {{ScrollAnchor (concat @method.id "Request")}}>
          <code class="Syntax">
            <Token @type="type">{{@method.name}}Request</Token>
          </code>
        </a>
      </ParamList>
      <ParamList @params={{@method.response}}>
        <a {{ScrollAnchor (concat @method.id "Response")}}>
          <code class="Syntax">
            <Token @type="type">{{@method.name}}Response</Token>
          </code>
        </a>
      </ParamList>
    </div>
  </template>
}
