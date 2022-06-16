import Component from '@glimmer/component';
import { default as ApiModel } from 'okapi/models/api';
import { LinkTo } from '@ember/routing';

export interface ApiSig {
  Args: {
    api: ApiModel;
  }
}

export default class Api extends Component<ApiSig> {
  <template>
    <li>
      <LinkTo @route="project.provider.api" @model={{@api.name}}>
        {{@api.name}}
      </LinkTo>
    </li>
  </template>
}
