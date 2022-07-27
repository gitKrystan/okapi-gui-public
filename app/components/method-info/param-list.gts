import { Textarea } from '@ember/component';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import Checkbox from 'okapi/components/input/checkbox';
import NumberInput from 'okapi/components/input/number';
import Token from 'okapi/components/syntax/token';
import {
  Param,
  isBooleanParam,
  isStringParam,
  isNumberParam
} from 'okapi/models/method-call';
import expandingTextarea from 'okapi/modifiers/expanding-textarea';

export interface ParamListSig {
  Element: HTMLElement;
  Args: {
    id: string;
    params: Param[];
    formEnabled: boolean;
    readonly?: boolean;
  },
  Blocks: {
    default: [];
  }
}

export default class ParamList extends Component<ParamListSig> {
  @action private inputId(param: Param): string {
    return `${this.args.id}-${param.info.name}`;
  }

  <template>
    {{#if @params}}
      <h3 class="MethodInfo__ParamList-heading">
        {{yield}}
      </h3>
      <ul ...attributes>
        {{#each @params as |param|}}
          <li data-test-method-param-list-item={{param.info.name}}>
            <label class="MethodInfo__item" for={{this.inputId param}}>
              <div>
                <code class="Syntax">
                  <Token @type="param">{{param.info.name}}</Token>
                  <Token @type="type"> {{param.info.type}}</Token>
                  <Token @type="punctuation">;</Token>
                </code>
                <p>{{param.info.description}}</p>
              </div>
              {{#if @formEnabled}}
                {{#if (isStringParam param)}}
                  <Textarea
                    id={{this.inputId param}}
                    class="MethodInfo__text-input"
                    data-test-param-input={{this.inputId param}}
                    placeholder={{if @readonly "..." "Input a string value here."}}
                    readonly={{@readonly}}
                    @value={{param.value}}
                    {{expandingTextarea param.value}}
                  />
                {{else if (isBooleanParam param)}}
                  <Checkbox
                    id={{this.inputId param}}
                    data-test-param-input={{this.inputId param}}
                    @readonly={{@readonly}}
                    @checked={{param.value}}
                  />
                {{else if (isNumberParam param)}}
                  <NumberInput
                    id={{this.inputId param}}
                    class="MethodInfo__text-input"
                    data-test-param-input={{this.inputId param}}
                    placeholder={{if @readonly "..." "Input a number value here."}}
                    readonly={{@readonly}}
                    @value={{param.value}}
                    @onChange={{fn (mut param.value)}}
                  />
                {{/if}}
              {{/if}}
            </label>
          </li>
        {{/each}}
      </ul>
    {{/if}}
  </template>
}
