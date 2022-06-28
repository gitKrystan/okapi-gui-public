import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import ThemeService from 'okapi/services/theme';
import ThemeSwitch from 'okapi/components/theme-switch';

export interface NavBarSig {
  Element: HTMLElement;
}

export default class NavBar extends Component<NavBarSig> {
  @service declare private theme: ThemeService;

  <template>
    <nav ...attributes>
      <div class="NavBar__content">
        <LinkTo @route="index" class="NavBar__logo">OKAPI!</LinkTo>
        <ThemeSwitch />
      </div>
    </nav>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    NavBar: typeof NavBar;
  }
}
