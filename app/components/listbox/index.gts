import Component from '@glimmer/component';

import Selection, { ListboxSelectionSignature } from 'okapi/components/listbox/selection';
import ListNav from 'okapi/components/list-nav';

interface ListboxSignature<T> {
  Element: ListboxSelectionSignature<T>['Element'];
  Args: Omit<ListboxSelectionSignature<T>['Args'], 'list'>;
  Blocks: ListboxSelectionSignature<T>['Blocks'];
}

/**
 * An ARIA-compliant listbox component that tracks DOM focus and click/Enter on
 * `<li role="option">` items.
 *
 * Based on the example here:
 * https://www.w3.org/TR/wai-aria-practices-1.1/examples/listbox/listbox-scrollable.html
 */
export default class Listbox<T> extends Component<ListboxSignature<T>> {
  // @ts-expect-error FIXME
  <template>
    <ListNav @itemRole="option" as |nav|>
      <Selection
        ...attributes
        class="Listbox"
        @items={{@items}}
        @initialSelection={{@initialSelection}}
        @onSelection={{@onSelection}}
        @onCommit={{@onCommit}}
        @list={{nav.list}}
      >
        <:items as |item|>
          {{yield item to="items"}}
        </:items>
        <:extras>
          {{yield to="extras"}}
        </:extras>
      </Selection>
    </ListNav>
  </template>
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    Listbox: typeof Listbox;
  }
}
