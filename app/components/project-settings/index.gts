import type { TemplateOnlyComponent } from '@ember/component/template-only';

import type Project from 'okapi/models/project';
import type ProjectSetting from 'okapi/models/project-setting';
import Form from './form';

interface ProjectSettingsSignature {
  Args: {
    project: Project;
    settings: readonly ProjectSetting[];
  };
}

const ProjectSettings: TemplateOnlyComponent<ProjectSettingsSignature> =
  <template><Form @project={{@project}} @settings={{@settings}} /></template>;

export default ProjectSettings;

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectSettings: typeof ProjectSettings;
  }
}
