import { assert } from '@ember/debug';
import { action } from '@ember/object';
import Component from '@glimmer/component';

import Combobox from 'okapi/components/combobox/editable-with-description';
import RegExpHighlight from 'okapi/components/reg-exp-highlight';
import ProjectSetting from 'okapi/models/project-setting';
import { isRegExpExecArray } from 'okapi/types/utils';
import type { MatchItem } from 'okapi/utils/filter-search';
import type ProjectSettingSearch from 'okapi/utils/project-setting-search';

interface SettingsComboboxSignature {
  Args: {
    search: ProjectSettingSearch;
    onCommit: (item: ProjectSetting) => void;
  };
}

class ResultHighlight extends Component<{
  Args: { result: MatchItem<ProjectSetting>; field: string };
}> {
  <template>
    {{#if this.matches}}
      <RegExpHighlight @text={{this.text}} @matches={{this.matches}} />
    {{else}}
      {{this.text}}
    {{/if}}
  </template>

  private get text(): string {
    let text = this.args.result.item[this.args.field as keyof ProjectSetting];
    assert(
      `expected text for item field ${this.args.field}`,
      typeof text === 'string'
    );
    return text;
  }

  private get matches(): RegExpExecArray[] | null {
    let metadata =
      this.args.result.metadata?.[this.args.field as keyof ProjectSetting];
    if (metadata) {
      return metadata.map(m => {
        assert(
          `Expected match array for token ${m.token}`,
          isRegExpExecArray(m['match'])
        );
        return m['match'];
      });
    } else {
      return null;
    }
  }
}

/**
 * Combobox for selecting new settings to configure.
 */
export default class SettingsCombobox extends Component<SettingsComboboxSignature> {
  <template>
    <Combobox
      data-test-settings-combobox
      @valueField="id"
      @search={{@search}}
      @onCommit={{this.onCommit}}
      @resetOnCommit={{true}}
      @autocomplete="both"
      @labelClass="u_visually-hidden"
    >
      <:label>
        Choose a setting to configure.
      </:label>
      <:options as |result|>
        <ResultHighlight @result={{result}} @field="id" />:
        <ResultHighlight @result={{result}} @field="name" />
        {{#if (hasDescriptionMeta result)}}
          <span class="RegExpHighlight">desc</span>
        {{/if}}
      </:options>
      <:description as |descriptionItem|>
        {{#if descriptionItem.item.description}}
          <ResultHighlight @result={{descriptionItem}} @field="description" />
        {{else}}
          {{this.descriptionFor descriptionItem}}
        {{/if}}
      </:description>
    </Combobox>
  </template>

  @action private onCommit(result: MatchItem<ProjectSetting> | null): void {
    if (result) {
      this.args.onCommit(result.item);
    }
  }

  @action private descriptionFor(
    result: MatchItem<ProjectSetting> | null
  ): string {
    if (result?.item?.description) {
      return result.item.description;
    } else if (result?.item) {
      return 'No description provided.';
    } else {
      return 'No selection.';
    }
  }
}

function hasDescriptionMeta(result: MatchItem<ProjectSetting>): boolean {
  return !!result.metadata?.['description'];
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'ProjectSettings::SettingsCombobox': typeof SettingsCombobox;
  }
}
