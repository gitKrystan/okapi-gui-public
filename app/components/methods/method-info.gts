import { concat } from '@ember/helper';
import { TemplateOnlyComponent } from '@ember/component/template-only';
import Component from '@glimmer/component';
import Method, { ApiMethodArg } from 'okapi/models/method';

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
            <span class="MethodInfo__ParamsList__param-name">{{param.name}}</span>
            <span class="MethodInfo__ParamsList__param-type">{{param.type}}</span>
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
        Parameters
      </ParamList>
      <ParamList @params={{@method.response}}>
        Returns
      </ParamList>
    </div>
  </template>
}
