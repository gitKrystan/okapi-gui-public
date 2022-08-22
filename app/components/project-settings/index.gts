import Component from '@glimmer/component';
import Form from './form';

interface ProjectSettingsSignature {}

export default class ProjectSettings extends Component<ProjectSettingsSignature> {
  <template><Form /></template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    ProjectSettings: typeof ProjectSettings;
  }
}
