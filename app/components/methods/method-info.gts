import { concat } from '@ember/helper';
import { TemplateOnlyComponent } from '@ember/component/template-only';
import Component from '@glimmer/component';
import Token from 'okapi/components/syntax/token';
import Method, { ApiMethodArg } from 'okapi/models/method';
import ScrollAnchor from 'okapi/modifiers/scroll-anchor';

const ParamList: TemplateOnlyComponent<{
  Args: {
    params: ApiMethodArg[];
  },
  Blocks: {
    default: [];
  }
}> = <template>
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
