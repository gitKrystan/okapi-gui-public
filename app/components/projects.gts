import Component from '@glimmer/component';
import { default as ProjectModel } from 'okapi/models/project';
import Project from './project';

export interface ProjectsComponentSig {
  Args: {
    projects: ProjectModel[];
  }
}

export default class ProjectsComponent extends Component<ProjectsComponentSig> {
  <template>
    <h1>My Projects</h1>
    <ul data-test-projects-list>
      {{#each @projects as |project|}}
        <Project @project={{project}} />
      {{/each}}
    </ul>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Projects: typeof ProjectsComponent;
  }
}
