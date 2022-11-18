import Component from '@glimmer/component';
import type ApiModel from 'okapi/models/api';
import { LinkTo } from '@ember/routing';

export interface ApiSig {
  Args: {
    api: ApiModel;
  };
}

export default class Api extends Component<ApiSig> {
  <template>
    <li>
      <LinkTo @route="project.provider.api" @model={{@api.id}}>
        {{@api.name}}
      </LinkTo>
    </li>
  </template>
}
