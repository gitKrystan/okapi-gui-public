import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import eq from 'ember-truth-helpers/helpers/eq';

import Combobox from 'okapi/components/combobox/with-input';
import ProjectSetting from 'okapi/models/project-setting';

interface SettingsComboboxSignature {
  Args: {
    onCommit: (item: ProjectSetting) => void;
  };
}

const ALL = [
  new ProjectSetting(
    'Vault Schema Migration',
    'exp1',
    'It does a thing.'
  ),
  new ProjectSetting(
    'Vault Schema Migration 2',
    'exp2',
    'It does another thing.'
  ),
  new ProjectSetting(
    'Vault Schema Migration 3',
    'exp3',
    'It does yet another thing.'
  )
];

/**
 * Combobox for selecting new settings to configure.
 */
export default class SettingsCombobox extends Component<SettingsComboboxSignature> {
  <template>
    <Combobox
      data-test-settings-combobox
      @options={{this.allSettings}}
      @onCommit={{this.onCommit}}
      @onSelect={{this.updateDescription}}
      @onItemMousemove={{this.updateDescription}}
      @onItemFocus={{this.updateDescription}}
      @autocomplete="both"
      @labelClass="u_visually-hidden"
    >
      <:label>
        Choose a setting to configure.
      </:label>
      <:options as |option|>
        <div
          class="Combobox__item
            {{if
              (eq option this.descriptionItem)
              'Combobox__item--is-description-item'
            }}"
        >
          {{option.id}}: {{option.name}}
          <p class="u_visually-hidden">
            Description: {{this.descriptionFor option}}
          </p>
        </div>
      </:options>
      <:extra>
        {{!-- Hide this item from aria because we have a visually hidden description above. --}}
        <div class="Combobox__Dropdown__info" aria-hidden="true">
          {{this.descriptionFor this.descriptionItem}}
        </div>
      </:extra>
    </Combobox>
  </template>

  private get allSettings(): ProjectSetting[] {
    return ALL;
  };

  @tracked private descriptionItem = this.allSettings[0] ?? null;

  @action private descriptionFor(item: ProjectSetting | null): string {
    if (item?.description) {
      return item.description;
    } else if (item) {
      return "No description provided.";
    } else {
      return "No selection."
    }
  }

  @action private onCommit(item: ProjectSetting | null): void {
    this.descriptionItem = item;
    if (item) {
      this.args.onCommit(item);
    }
  }

  @action private updateDescription(item: ProjectSetting | null): void {
    this.descriptionItem = item;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::SettingsCombobox': typeof SettingsCombobox;
  }
}
