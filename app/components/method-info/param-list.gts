import { action } from '@ember/object';
import Component from '@glimmer/component';
import flag from 'okapi/components/flag';

import Token from 'okapi/components/syntax/token';
import { Param } from 'okapi/models/method-call';
import BooleanInput from './inputs/boolean';
import NumberInput from './inputs/number';
import EnumInput from './inputs/enum';
import StringInput from './inputs/string';
import ParamInputSig from './inputs/signature';

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

  private get readonly(): boolean {
    return this.args.readonly ?? false;
  }

  private componentFor(param: Param): typeof Component<ParamInputSig<Param>> {
    switch (param.info.type) {
      case 'string':
        return StringInput;
      case 'boolean':
        return BooleanInput;
      case 'number':
        return NumberInput;
    }
  }

  <template>
    {{#if @params}}
      <h3 class="MethodInfo__ParamList-heading">
        {{yield}}
      </h3>
      <ul ...attributes>
        {{#each @params as |param|}}
          <li class="MethodInfo__item" data-test-method-param-list-item={{param.info.name}}>
            <label for={{this.inputId param}}>
                <code class="Syntax">
                  <Token @type="param">{{param.info.name}}</Token>
                  <Token @type="type"> {{param.info.type}}</Token>
                  <Token @type="punctuation">;</Token>
                </code>
                <p>{{param.info.description}}</p>
            </label>
            {{#if @formEnabled}}
              {{#let (this.componentFor param) as |ParamComponent|}}
                <ParamComponent
                  @param={{param}}
                  @id={{this.inputId param}}
                  @readonly={{this.readonly}}
                />
              {{/let}}
            {{/if}}
          </li>

          {{#flag "enum"}}
            <li class="MethodInfo__item">
              {{!-- FIXME: Connect label to button --}}
              <label>
                <div>
                  <code class="Syntax">
                    <Token @type="param">Enumy</Token>
                    <Token @type="type"> TBD</Token>
                    <Token @type="punctuation">;</Token>
                  </code>
                  <p>Choose one</p>
                </div>
              </label>
              {{#if @formEnabled}}
                <EnumInput />
              {{/if}}
            </li>
          {{/flag}}
        {{/each}}
      </ul>
    {{/if}}
  </template>
}
