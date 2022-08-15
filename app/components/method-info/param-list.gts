import { action } from '@ember/object';
import Component from '@glimmer/component';

import Token from 'okapi/components/syntax/token';
import { Param } from 'okapi/models/method-call';
import BooleanInput from './inputs/boolean';
import NumberInput from './inputs/number';
import EnumInput from './inputs/enum';
import StringInput from './inputs/string';
import ParamInputSig from './inputs/signature';
import Validator from './validator';

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
      case 'f32':
      case 'f64':
      case 'i8':
      case 'i16':
      case 'i32':
      case 'i64':
      case 'u8':
      case 'u16':
      case 'u32':
      case 'u64':
        return NumberInput as typeof Component<ParamInputSig<Param>>;
      case 'enum':
        return EnumInput as typeof Component<ParamInputSig<Param>>;
    }
  }

  <template>
    {{#if @params}}
      <h3 class="MethodInfo__ParamList-heading" id="{{this.args.id}}-heading">
        {{yield}}
      </h3>
      <ul ...attributes aria-labelledby="{{this.args.id}}-heading">
        {{#each @params as |param|}}
          <li
            class="MethodInfo__item"
            data-test-method-param-list-item={{param.info.name}}
          >
            <div id="{{this.inputId param}}-label">
              <code class="Syntax">
                <Token @type="param">{{param.info.name}}</Token>
                <Token @type="type"> {{param.info.type}}</Token>
                <Token @type="punctuation">;</Token>
              </code>
              <p>{{param.info.description}}</p>
            </div>
            {{#if @formEnabled}}
              {{#let (this.componentFor param) as |ParamInput|}}
                <div class="MethodInfo__input-container">
                  <Validator
                    data-test-param-error={{this.inputId param}}
                    @param={{param}}
                      as |validator|
                  >
                    <ParamInput
                      @param={{param}}
                      @id={{this.inputId param}}
                      @readonly={{this.readonly}}
                      {{validator}}
                      class={{if param.hasErrors 'u--invalid'}}
                    />
                  </Validator>
                </div>
              {{/let}}
            {{/if}}
          </li>
        {{/each}}
      </ul>
    {{/if}}
  </template>
}
