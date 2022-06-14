import Component from '@glimmer/component';
import { default as ProjectModel } from 'okapi/models/project';
import { LinkTo } from '@ember/routing';

export interface ProjectComponentSig {
  Args: {
    project: ProjectModel;
  }
}

export default class Project extends Component<ProjectComponentSig> {
  <template>
    <li>
      <LinkTo @route="project" @model={{@project.name}}>
        {{@project.name}}
      </LinkTo>
    </li>
  </template>
}
