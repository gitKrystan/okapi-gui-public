import { assert } from '@ember/debug';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

import { Param } from 'okapi/models/method-call';

export interface HandleInputErrorSig {
  Args: {
    param: Param;
  }
  Blocks: {
    default: [validate: HandleInputError['validate']];
  }
}

export default class HandleInputError extends Component<HandleInputErrorSig> {
  <template>
    {{yield this.validate}}
    {{#if @param.errorSet.size}}
      <ul class="MethodInfo__error" role="alert">
        {{#each @param.errorSet as |error|}}
          <li>{{error}}</li>
        {{/each}}
      </ul>
    {{/if}}
  </template>

  validate = modifier(
    (element: HTMLElement) => {
      element.addEventListener('focusout', this.handleBlur);

      return () => {
        element.removeEventListener('focusout', this.handleBlur);
      }
    },
    { eager: false }
  );

  @action private handleBlur(e: FocusEvent): void {
    let { currentTarget } = e;

    requestAnimationFrame(() => {
      assert('expected currentTarget', currentTarget instanceof HTMLElement);
      if (!currentTarget.contains(document.activeElement)) {
        this.args.param.validate();
      }
    });
  }
}
