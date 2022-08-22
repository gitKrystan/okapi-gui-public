import Component from '@glimmer/component';
import { action } from '@ember/object';

import { TrackedSet } from 'tracked-built-ins';

import ProjectSetting from 'okapi/models/project-setting';
import SettingsCombobox from './settings-combobox';

interface ProjectSettingsFormSignature {}

export default class ProjectSettingsForm extends Component<ProjectSettingsFormSignature> {
  <template>
    <ul data-test-project-settings-list>
      {{#each this.sortedSettings as |setting|}}
        <li>
          <h3>{{setting.name}}</h3>
          <p>{{setting.id}}</p>
          <p>{{setting.description}}</p>
        </li>
      {{/each}}
    </ul>
    <SettingsCombobox @onSelect={{this.handleSettingsSelect}} />
  </template>

  private settings = new TrackedSet<ProjectSetting>();

  private get sortedSettings(): ProjectSetting[] {
    return [...this.settings].sort((a, b) => a.id.localeCompare(b.id))
  }

  @action private handleSettingsSelect(item: ProjectSetting): void {
    this.settings.add(item);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Form': typeof ProjectSettingsForm;
  }
}
