import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';

import ParamInput from 'okapi/components/param-input/index';
import Project from 'okapi/models/project';
import ProjectSetting from 'okapi/models/project-setting';
import type ServerService from 'okapi/services/server';
import ProjectSettingSearch from 'okapi/utils/project-setting-search';
import SettingsCombobox from './settings-combobox';

interface ProjectSettingsFormSignature {
  Args: {
    project: Project;
    setting: ProjectSetting;
  }
}

class ProjectSettingsForm extends Component<ProjectSettingsFormSignature> {
  <template>
    <li class="ProjectSettingsForm">
      <form {{on "submit" (fn this.submit @setting)}}>
        <label for={{this.inputId @setting}}>
          <h3>{{@setting.name}}</h3>
          <p>{{@setting.id}}</p>
          <p>{{@setting.description}}</p>
        </label>
        <ParamInput
          @id={{this.inputId @setting}}
          @param={{@setting.param}}
          @onChange={{perform this.updateSetting @setting}}
          @readonly={{this.updateSetting.isRunning}}
        />
      </form>
    </li>
  </template>

  @service declare private server: ServerService;

  private id = guidFor(this);

  @action private inputId(setting: ProjectSetting): string {
    return `${this.id}-${setting.id}`;
  }

  private updateSetting = task(
    { drop: true },
    async (setting: ProjectSetting): Promise<void> => {
      await this.server.updateProjectSetting(this.args.project, setting);
    }
  );

  @action private submit(setting: ProjectSetting, e: SubmitEvent): void {
    e.preventDefault();
    this.updateSetting.perform(setting);
  }
}

interface ProjectSettingsFormsSignature {
  Args: {
    project: Project;
    settings: readonly ProjectSetting[];
  }
}

export default class ProjectSettingsForms extends Component<ProjectSettingsFormsSignature> {
  <template>
    <ul data-test-project-settings-list>
      {{#each this.projectSettings as |setting|}}
        <ProjectSettingsForm @project={{@project}} @setting={{setting}} />
      {{/each}}
    </ul>
    <SettingsCombobox
      @search={{this.settingsSearch}}
      @onCommit={{@project.addSetting}}
    />
  </template>

  private get projectSettings(): ReadonlySet<ProjectSetting> {
    return this.args.project.settings;
  }

  private get availableSettings(): ReadonlyArray<ProjectSetting> {
    return this.args.settings.filter((setting) => {
      return ![...this.projectSettings].find(
        (projectSetting) => projectSetting.id === setting.id
      );
    });
  }

  private get settingsSearch(): ProjectSettingSearch {
    return ProjectSettingSearch.from(this.availableSettings);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Form': typeof ProjectSettingsForms;
  }
}
