import Component from '@glimmer/component';
import Provider from 'okapi/models/provider';
import Api from './api';

export interface ApisSig {
  Args: {
    provider: Provider;
  }
}

export default class Apis extends Component<ApisSig> {
  <template>
    <h1>APIs</h1>
    <ul data-test-apis-list>
      {{#each @provider.apis as |api|}}
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
