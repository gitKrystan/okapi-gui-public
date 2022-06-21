import Component from '@glimmer/component';
import { default as MethodModel } from 'okapi/models/method';
import { LinkTo } from '@ember/routing';

export interface MethodSig {
  Args: {
    method: MethodModel;
  }
}

export default class Method extends Component<MethodSig> {
  <template>
    <li>
      <LinkTo @route="project.provider.api.method" @model={{@method.name}}>
        {{@method.name}}
      </LinkTo>
    </li>
  </template>
}
