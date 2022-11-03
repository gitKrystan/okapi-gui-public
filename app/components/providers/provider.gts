import Component from '@glimmer/component';
import { default as ProviderModel } from 'okapi/models/provider';
import { LinkTo } from '@ember/routing';

export interface ProviderSig {
  Args: {
    provider: ProviderModel;
  };
}

export default class Provider extends Component<ProviderSig> {
  <template>
    <li>
      <LinkTo @route="project.provider" @model={{@provider.id}}>
        {{@provider.name}}
      </LinkTo>
    </li>
  </template>
}
