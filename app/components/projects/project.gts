import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

import ProjectStatus from 'okapi/components/project-status';
import { default as ProjectModel } from 'okapi/models/project';

export interface ProjectComponentSig {
  Args: {
    project: ProjectModel;
  };
}

export default class Project extends Component<ProjectComponentSig> {
  <template>
    <li>
      <LinkTo @route="project" @model={{@project.id}}>
        {{@project.name}}
      </LinkTo>
      <ProjectStatus @project={{@project}} />
    </li>
  </template>
}
