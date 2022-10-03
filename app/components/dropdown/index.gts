import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Ember from 'ember'; // For Ember.testing

import { task, timeout } from 'ember-concurrency';

import dismissible from 'okapi/modifiers/dismissible';
import DropdownApi, { OpenOptions, CloseOptions } from './private/api';

interface DropdownSignature {
  Element: HTMLDivElement;
  Args: {
    didDismiss?: (e: Event) => void;
  };
  Blocks: {
    trigger: [dropdown: DropdownApi];
    content: [dropdown: DropdownApi];
  };
}

/**
 * A simple component managing expansion and collapse of dropdown content.
 * Yields the `DropdownApi` with methods to expand or collapse the content and
 * to inspect the current dropdown state.
 */
export default class Dropdown
  extends Component<DropdownSignature>
  implements DropdownApi
{
  <template>
    <div ...attributes class="Dropdown" {{dismissible dismissed=this.onDismiss}}>
      {{yield this to="trigger"}}
      {{#if this.isExpanded}}
        <div class="Dropdown__content">
          {{yield this to="content"}}
        </div>
      {{/if}}
    </div>
  </template>

  @tracked isExpanded = false;

  @action open(maybeOptions?: OpenOptions | Event): void {
    let options: OpenOptions =
      !maybeOptions || maybeOptions instanceof Event ? {} : maybeOptions;
    if (!this.isExpanded) {
      this.isExpanded = true;
      options.didOpen?.();
    }
  }

  @action close(maybeOptions?: CloseOptions | Event): void {
    let options: CloseOptions =
      !maybeOptions || maybeOptions instanceof Event ? {} : maybeOptions;
    if (this.isExpanded) {
      this.isExpanded = false;
      options.didClose?.();
    }
  }

  @action toggle(maybeOptions?: (OpenOptions & CloseOptions) | Event): void {
    let options: OpenOptions & CloseOptions =
      !maybeOptions || maybeOptions instanceof Event ? {} : maybeOptions;
    if (this.isExpanded) {
      this.close({ didClose: options.didClose });
    } else {
      this.open({ didOpen: options.didOpen });
    }
  }

  @action delayedClose(maybeOptions?: CloseOptions | Event): void {
    let options: CloseOptions =
      !maybeOptions || maybeOptions instanceof Event ? {} : maybeOptions;
    this.doDelayedClose.perform(options);
  }

  private doDelayedClose = task(
    { drop: true },
    async (options: CloseOptions) => {
      await timeout(Ember.testing ? 0 : 300);
      this.close(options);
    }
  );

  @action private onDismiss(e: Event): void {
    if (this.isExpanded) {
      this.delayedClose({ didClose: () => this.args.didDismiss?.(e) });
    }
  }
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Dropdown: typeof Dropdown;
  }
}
