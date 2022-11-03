import { service } from '@ember/service';
import Component from '@glimmer/component';
import ThemeService from 'okapi/services/theme';
import Switch from 'okapi/components/switch';

export interface ThemeSwitchSig {
  Element: HTMLButtonElement;
}

export default class ThemeSwitch extends Component<ThemeSwitchSig> {
  @service private declare theme: ThemeService;

  <template>
    <Switch
      ...attributes
      data-test-theme-toggle-button
      @value={{this.theme.isDark}}
      @onToggle={{this.theme.toggle}}
    >
      <:label>Dark Mode:</:label>
    </Switch>
  </template>
}
