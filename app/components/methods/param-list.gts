import { Textarea } from '@ember/component';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import Token from 'okapi/components/syntax/token';
import { MethodCallParam } from 'okapi/models/method-call';

export interface ParamListSig {
  Args: {
    id: string;
    params: MethodCallParam[];
    formEnabled: boolean;
    readonly?: boolean;
  },
  Blocks: {
    default: [];
  }
}

export default class ParamList extends Component<ParamListSig> {
  @action private inputId(param: MethodCallParam): string {
    return `${this.args.id}-${param.info.name}`;
  }

  <template>
    {{#if @params}}
      <h3 class="MethodInfo__ParamList-heading">
        {{yield}}
      </h3>
      <ul>
        {{#each @params as |param|}}
          <li class="MethodInfo__param-list-item">
            <label for={{this.inputId param}}>
              <code class="Syntax">
                <Token @type="param">{{param.info.name}}</Token>
                <Token @type="type"> {{param.info.type}}</Token>
                <Token @type="punctuation">;</Token>
              </code>
              <p>{{param.info.description}}</p>
            </label>
            {{#if @formEnabled}}
              <Textarea
                id={{this.inputId param}}
                data-test-param-input={{this.inputId param}}
                placeholder={{if @readonly "..." "Input a string value here."}}
                readonly={{@readonly}}
                @value={{param.inputValue}}
              />
            {{/if}}
          </li>
        {{/each}}
      </ul>
    {{/if}}
  </template>
}
