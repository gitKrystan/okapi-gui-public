import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Button from 'okapi/components/button';
import Icon from 'okapi/components/icon';
import { default as MethodModel } from 'okapi/models/method';
import ScrollAnchor from 'okapi/modifiers/scroll-anchor';

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
    <li>
      <heading >
        <Button
          data-test-method-toggle-collapse={{@method.id}}
          class="Button--theme-action" {{on "click" this.toggleCollapse}}
        >
          <Icon
            class="Method__heading__Icon"
            @type="outline"
            @id={{if this.isCollapsed "plus-circle" "minus-circle"}}
          />
        </Button>
        <a {{ScrollAnchor @method.id}}>
          <h2 class="Method__heading__name">Method: {{@method.name}}</h2>
        </a>
      </heading>
      <p data-test-method-info={{@method.id}} hidden={{this.isCollapsed}}>
        TODO: More info about #{{@method.name}}
      </p>
    </li>
  </template>
}
