import { assert } from '@ember/debug';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import Component from '@glimmer/component';

import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';

import MD from 'okapi/components/m-d';
import ParamInput from 'okapi/components/param-input/index';
import Project from 'okapi/models/project';
import ProjectSetting from 'okapi/models/project-setting';
import type ServerService from 'okapi/services/server';
import ProjectSettingSearch from 'okapi/utils/project-setting-search';
import SettingsCombobox from './settings-combobox';

interface ProjectSettingsFormSignature {
  Element: HTMLElement;
  Args: {
    id: string;
    project: Project;
    setting: ProjectSetting;
  }
}

class ProjectSettingsForm extends Component<ProjectSettingsFormSignature> {
  <template>
    <li class="ProjectSettingsForm">
      <form {{on "submit" (fn this.submit @setting)}}>
        <label for={{@id}}>
          <h3>{{@setting.name}}</h3>
          <p>{{@setting.id}}</p>
          <MD @profile="description" @raw={{@setting.description}} />
        </label>
        <ParamInput
          ...attributes
          data-test-project-settings-input={{@setting.id}}
          @id={{@id}}
          @param={{@setting.param}}
          @onChange={{perform this.updateSetting @setting}}
          @readonly={{this.updateSetting.isRunning}}
        />
      </form>
    </li>
  </template>

  @service declare private server: ServerService;

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
        <ProjectSettingsForm
          @id={{this.inputId setting}}
          @project={{@project}}
          @setting={{setting}}
        />
      {{/each}}
    </ul>
    <SettingsCombobox
      @search={{this.settingsSearch}}
      @onCommit={{this.handleCommit}}
    />
  </template>

  private id = guidFor(this);

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

  @action private inputId(setting: ProjectSetting): string {
    return `${this.id}-${setting.id}`;
  }

  @action private handleCommit(setting: ProjectSetting): void {
    this.args.project.addSetting(setting);
    scheduleOnce('afterRender', this, this.focusForm, setting);
  }

  private focusForm(setting: ProjectSetting): void {
    let input = document.getElementById(this.inputId(setting));
    assert('expected input', input);
    input.focus();
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::Form': typeof ProjectSettingsForms;
  }
}
