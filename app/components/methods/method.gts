import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Button from 'okapi/components/button';
import Icon from 'okapi/components/icon';
import { default as MethodModel } from 'okapi/models/method';
import MethodInfo from './method-info';
import MethodSignature from './method-signature';

export interface MethodSig {
  Args: {
    method: MethodModel;
  }
}

export default class Method extends Component<MethodSig> {
  @tracked private isCollapsed = false;

  @action private toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  <template>
    <li class="Method">
      <header class="Method__header">
        <Button
          data-test-method-toggle-collapse={{@method.id}}
          class="Button--theme-action Method__header__toggle-button"
          {{on "click" this.toggleCollapse}}
        >
          <Icon
            @type="outline"
            @id={{if this.isCollapsed "plus-circle" "minus-circle"}}
          />
        </Button>
        <h2>
          <MethodSignature class="Method__header__content" @method={{@method}} />
        </h2>
      </header>
      <MethodInfo
        data-test-method-info={{@method.id}}
        hidden={{this.isCollapsed}}
        @method={{@method}}
      />
    </li>
  </template>
}
