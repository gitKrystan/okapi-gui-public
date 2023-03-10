import Component from '@glimmer/component';
import type ProjectModel from 'okapi/models/project';
import Project from './project';

export interface ProjectsComponentSig {
  Args: {
    projects: readonly ProjectModel[];
  };
}

export default class Projects extends Component<ProjectsComponentSig> {
  <template>
    <h1 id="main-label">My Projects</h1>
    <ul data-test-projects-list>
      {{#each @projects as |project|}}
        <Project @project={{project}} />
      {{/each}}
    </ul>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Projects: typeof Projects;
  }
}
