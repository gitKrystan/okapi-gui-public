import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import ThemeService from 'okapi/services/theme';
import ThemeSwitch from 'okapi/components/theme-switch';

export interface NavBarSig {
  Element: HTMLElement;
}

export default class NavBar extends Component<NavBarSig> {
  @service private declare theme: ThemeService;

  <template>
    <header aria-label="Okapi" ...attributes>
      <div class="NavBar__content">
        <LinkTo
          @route="index"
          class="NavBar__logo"
          aria-label="Home"
          id="site-header"
        >OKAPI!</LinkTo>
        <ThemeSwitch />
      </div>
    </header>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    NavBar: typeof NavBar;
  }
}
