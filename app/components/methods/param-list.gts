import Component from '@glimmer/component';
import Token from 'okapi/components/syntax/token';
import { ApiMethodArg } from 'okapi/models/method';

export interface ParamListSig {
  Args: {
    params: ApiMethodArg[];
  },
  Blocks: {
    default: [];
  }
}

export default class ParamList extends Component<ParamListSig> {
  <template>
    {{#if @params}}
      <h3 class="MethodInfo__ParamsList__heading">
        {{yield}}
      </h3>
      <ul>
        {{#each @params as |param|}}
          <li>
            <h4 class="MethodInfo__ParamsList__item-heading">
              <code class="Syntax">
                <Token @type="param">{{param.name}}</Token>
                <Token @type="type"> {{param.type}}</Token>
                <Token @type="punctuation">;</Token>
              </code>
            </h4>
            <p>{{param.description}}</p>
          </li>
        {{/each}}
      </ul>
    {{/if}}
  </template>
}
