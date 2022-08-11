import Component from '@glimmer/component';
import Project from 'okapi/models/project';
import Provider from './provider';

export interface ProvidersSig {
  Args: {
    project: Project;
  }
}

export default class Providers extends Component<ProvidersSig> {
  <template>
    <h1 id="main-label">Providers</h1>
    <ul data-test-providers-list>
      {{#each @project.providers as |provider|}}
        <Provider @provider={{provider}} />
      {{/each}}
    </ul>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Providers: typeof Providers;
  }
}
