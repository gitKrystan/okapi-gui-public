import { assert } from '@ember/debug';
import { action } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import Component from '@glimmer/component';
import { modifier } from 'ember-modifier';

import { Param } from 'okapi/models/method-call';

export interface ValidatorSig {
  Element: HTMLElement;
  Args: {
    param: Param;
  }
  Blocks: {
    default: [validator: Validator['validator']];
  }
}

export default class Validator extends Component<ValidatorSig> {
  <template>
    {{yield this.validator}}
    {{#if @param.hasErrors}}
      <ul ...attributes class="MethodInfo__error" role="alert">
        {{#each @param.errorSet as |error|}}
          <li>{{error}}</li>
        {{/each}}
      </ul>
    {{/if}}
  </template>

  validator = modifier(
    (element: HTMLElement) => {
      element.addEventListener('focusout', this.handleFocusout);

      return () => {
        element.removeEventListener('focusout', this.handleFocusout);
      }
    },
    { eager: false }
  );

  @action private handleFocusout(e: FocusEvent): void {
    let { currentTarget } = e;
    assert('expected currentTarget', currentTarget instanceof HTMLElement);
    scheduleOnce('afterRender', this, this.validateOnFocusout, currentTarget);
  }

  private validateOnFocusout(currentTarget: HTMLElement) {
    assert('expected currentTarget', currentTarget instanceof HTMLElement);
    if (!currentTarget.contains(document.activeElement)) {
      this.args.param.validate();
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'MethodInfo::Validator': typeof Validator;
  }
}
