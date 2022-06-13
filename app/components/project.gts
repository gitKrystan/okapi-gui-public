import Component from '@glimmer/component';
import Project from 'okapi/models/project';

export interface ProjectComponentSig {
  Args: {
    project: Project;
  }
}

const Yay = <template>Yay</template>

const addExplanationPoint = (str: string) => `${str}!`;

export default class ProjectComponent extends Component<ProjectComponentSig> {
  <template>
    <li><Yay /> {{addExplanationPoint @project.name}}</li>
  </template>
}
