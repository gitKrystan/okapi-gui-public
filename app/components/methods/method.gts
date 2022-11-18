import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import not from 'ember-truth-helpers/helpers/not';

import Button from 'okapi/components/button';
import Icon from 'okapi/components/icon';
import MethodInfo from 'okapi/components/method-info';
import type MethodModel from 'okapi/models/method';
import MethodSignature from './method-signature';

export interface MethodSig {
  Args: {
    method: MethodModel;
  };
}

export default class Method extends Component<MethodSig> {
  @tracked private expanded = true;

  @action private toggleExpanded(): void {
    this.expanded = !this.expanded;
    if (!this.expanded) {
      this.requestFormExpanded = false;
    }
  }

  @tracked private requestFormExpanded = false;

  @action private toggleRequestForm(): void {
    this.requestFormExpanded = !this.requestFormExpanded;
    if (this.requestFormExpanded) {
      this.expanded = true;
    }
  }

  <template>
    <li class="Method">
      <header class="Method__header">
        <Button
          data-test-method-toggle-collapse={{@method.id}}
          class="Button--theme-action Method__header__toggle-button"
          {{on "click" this.toggleExpanded}}
          aria-expanded="{{this.expanded}}"
          aria-controls="{{@method.id}}-content"
          aria-label="Toggle method documentation"
        >
          <Icon
            @type="outline"
            @id={{if this.expanded "minus-circle" "plus-circle"}}
          />
        </Button>
        <h2>
          <MethodSignature
            class="Method__header__content"
            @method={{@method}}
          />
        </h2>
        <a class="Method__header__code-link" href="#">
          <Icon @type="outline" @id="code-bracket" />
        </a>
        <Button
          class="Button--theme-action Method__header__toggle-button"
          data-test-method-info-toggle-form-button
          {{on "click" this.toggleRequestForm}}
          aria-expanded="{{this.requestFormExpanded}}"
          aria-controls="{{@method.id}}-call-button {{this.controlsIds}}"
          aria-label="Toggle method request form"
        >
          <Icon
            @type={{if this.requestFormExpanded "solid" "outline"}}
            @id="play-circle"
          />
        </Button>
      </header>
      <MethodInfo
        id="{{@method.id}}-content"
        data-test-method-info={{@method.id}}
        hidden={{not this.expanded}}
        @method={{@method}}
        @isActive={{this.requestFormExpanded}}
      />
    </li>
  </template>

  get controlsIds(): string {
    let { method } = this.args;
    return method.request
      .map((r) => `${method.id}-request-${r.name}`)
      .join(' ');
  }
}
