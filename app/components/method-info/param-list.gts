import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import flag from 'okapi/components/flag';
import Listbox from 'okapi/components/listbox';
import Token from 'okapi/components/syntax/token';
import { Param } from 'okapi/models/method-call'; // FIXME: Remove the removed methods
import BooleanInput from './inputs/boolean';
import NumberInput from './inputs/number';
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

  private get todoEnumItems(): string[] {
    return ['yes', 'no', 'maybe'];
  }

  @tracked private todoCurrentItem: string | null = null;

  @action private todoCommitItem(item: string): void {
    this.todoCurrentItem = item;
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
                {{#let (this.componentFor param) as |ParamComponent|}}
                  <ParamComponent
                    @param={{param}}
                    @id={{this.inputId param}}
                    @readonly={{this.readonly}}
                  />
                {{/let}}
                {{#flag "enum"}}
                  <Listbox
                    @items={{this.todoEnumItems}}
                    @onCommit={{this.todoCommitItem}}
                  >
                    <:items as |item|>
                      {{item}}
                    </:items>
                  </Listbox>
                  Committed: {{this.todoCurrentItem}}
                {{/flag}}
              {{/if}}
            </label>
          </li>
        {{/each}}
      </ul>
    {{/if}}
  </template>
}
