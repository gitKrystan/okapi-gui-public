// NOTE: There is lots of weird stuff going on in this component to facilitate
// the desired "control-flow" UI (e.g. classic component, positional arguments)
// so copy-pasta at your own risk.

import { service } from '@ember/service';
import Component from '@ember/component';
import FeaturesService from 'okapi/services/features';

interface FlagSig {
  Args: {
    Positional: [flag: string];
  };
  Blocks: {
    default: [];
    else: [];
  };
}

/**
 * Render the given block if a particular feature is enabled.
 * Optionally, provide an else block to display when the feature is disabled.
 *
 * For example:
 *
 * ```handlebars
 * {{#flag flag="bigFonts"}}
 *   <big>BIG FONTS</big>
 * {{else}}
 *   <small>small fonts</small>
 * {{/flag}}
 * ```
 */
export default class flag extends Component<FlagSig> {
  readonly tagName = '';

  static readonly positionalParams = ['flag'];
  private declare readonly flag: string;

  <template>
    {{#if this.isEnabled}}
      {{yield}}
    {{else if (has-block "else")}}
      {{yield to="else"}}
    {{/if}}
  </template>

  @service private declare features: FeaturesService;

  private get isEnabled(): boolean {
    return this.features.isEnabled(this.flag);
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    flag: typeof flag;
  }
}
