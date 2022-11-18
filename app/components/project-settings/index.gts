import Component from '@glimmer/component';

import type Project from 'okapi/models/project';
import type ProjectSetting from 'okapi/models/project-setting';
import Form from './form';

interface ProjectSettingsSignature {
  Args: {
    project: Project;
    settings: readonly ProjectSetting[];
  };
}

export default class ProjectSettings extends Component<ProjectSettingsSignature> {
  <template><Form @project={{@project}} @settings={{@settings}} /></template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectSettings: typeof ProjectSettings;
  }
}
