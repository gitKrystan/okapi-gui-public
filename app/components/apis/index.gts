import Component from '@glimmer/component';
import ApiModel from 'okapi/models/api';
import Api from './api';

export interface ApisSig {
  Args: {
    apis: ApiModel[];
  };
}

export default class Apis extends Component<ApisSig> {
  <template>
    <h1 id="main-label">APIs</h1>
    <ul data-test-apis-list>
      {{#each @apis as |api|}}
        <Api @api={{api}} />
      {{/each}}
    </ul>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Apis: typeof Apis;
  }
}
