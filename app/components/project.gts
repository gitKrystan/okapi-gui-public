import Component from '@glimmer/component';
import Project from 'okapi/models/project';

export interface ProjectComponentSig {
  Args: {
    project: Project;
  }
}

export default class ProjectComponent extends Component<ProjectComponentSig> {
  <template>
    <li>{{@project.name}}</li>
  </template>
}
