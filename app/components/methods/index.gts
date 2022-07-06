import Component from '@glimmer/component';
import Api from 'okapi/models/api';
import Method from './method';

export interface MethodsSig {
  Args: {
    api: Api;
  }
}

export default class Methods extends Component<MethodsSig> {
  <template>
    <h1>Methods</h1>
    <ul data-test-methods-list class="Methods">
      {{#each @api.methods as |method|}}
        <Method @method={{method}} />
      {{/each}}
    </ul>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Methods: typeof Methods;
  }
}
