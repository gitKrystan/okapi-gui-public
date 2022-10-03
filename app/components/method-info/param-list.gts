import { action } from '@ember/object';
import Component from '@glimmer/component';

import Token from 'okapi/components/syntax/token';
import ParamInput from 'okapi/components/param-input/index';
import type { Param } from 'okapi/models/param/index';

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
  <template>
    {{#if @params}}
      <h3 class="MethodInfo__ParamList-heading" id="{{@id}}-heading">
        {{yield}}
      </h3>
      <ul ...attributes aria-labelledby="{{@id}}-heading">
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
              <div class="MethodInfo__input-container">
                <ParamInput
                  @id={{this.inputId param}}
                  @param={{param}}
                  @readonly={{@readonly}}
                />
              </div>
            {{/if}}
          </li>
        {{/each}}
      </ul>
    {{/if}}
  </template>

  @action private inputId(param: Param): string {
    return `${this.args.id}-${param.info.name}`;
  }
}
