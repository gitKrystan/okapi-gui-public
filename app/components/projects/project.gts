import Component from '@glimmer/component';
import { default as ProjectModel } from 'okapi/models/project';

export interface ProjectComponentSig {
  Args: {
    project: ProjectModel;
  }
}

export default class Project extends Component<ProjectComponentSig> {
  <template>
    <li>{{@project.name}}</li>
  </template>
}
