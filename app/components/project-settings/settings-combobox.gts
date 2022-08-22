import Component from '@glimmer/component';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import { tracked } from '@glimmer/tracking';

import eq from 'ember-truth-helpers/helpers/eq';

import Combobox from 'okapi/components/combobox/select-only';
import ProjectSetting from 'okapi/models/project-setting';

interface SettingsComboboxSignature {
  Args: {
    onSelect: (item: ProjectSetting) => void;
  };
}

const ALL = [
  new ProjectSetting(
    'Vault Schema Migration',
    '1experimental.vault.schema_version',
    'It does a thing.'
  ),
  new ProjectSetting(
    'Vault Schema Migration 2',
    '2experimental.vault.schema_version',
    'It does another thing.'
  ),
  new ProjectSetting(
    'Vault Schema Migration 3',
    '3experimental.vault.schema_version',
    'It does yet another thing.'
  )
];

/**
 * Combobox for selecting new settings to configure.
 */
export default class SettingsCombobox extends Component<SettingsComboboxSignature> {
  <template>
    <Combobox
      @items={{this.allSettings}}
      @onSelect={{this.onSelect}}
      @onItemMousemove={{this.updateDescription}}
      @onFocus={{this.updateDescription}}
    >
      <:trigger as |Trigger|>
        <Trigger
          id={{this.id}}
          aria-label="Choose a setting to configure."
          data-test-settings-combobox-button
        />
      </:trigger>
      <:content as |List|>
        <List>
          <:items as |item|>
            <div class="Combobox__item {{if (eq item this.descriptionItem) 'Combobox__item--is-description-item'}}">
              {{item.id}}: {{item.name}}
              <p class="u_visually-hidden">
                Description: {{this.descriptionFor item}}
              </p>
            </div>
          </:items>
        </List>
        {{!-- Hide this item from aria because we have a visually hidden description above. --}}
        <div class="Combobox__dropdown__info" aria-hidden="true">
          {{this.descriptionFor this.descriptionItem}}
        </div>
      </:content>
    </Combobox>
  </template>

  private id = guidFor(this);

  private get allSettings(): ProjectSetting[] {
    return ALL;
  };

  @tracked private descriptionItem = this.allSettings[0];

  @action private descriptionFor(item: ProjectSetting | undefined): string {
    if (item?.description) {
      return item.description;
    } else if (item) {
      return "No description provided.";
    } else {
      return "No selection."
    }
  }

  @action private onSelect(item: ProjectSetting): void {
    this.descriptionItem = item;
    this.args.onSelect(item);
  }

  @action private updateDescription(item: ProjectSetting): void {
    this.descriptionItem = item;
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::SettingsCombobox': typeof SettingsCombobox;
  }
}
