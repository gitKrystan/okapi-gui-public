import { assert } from '@ember/debug';
import { registerDestructor } from '@ember/destroyable';
import { action } from '@ember/object';

import type { ArgsFor, NamedArgs, PositionalArgs } from 'ember-modifier';
import Modifier from 'ember-modifier';

import mergeOptions from 'okapi/utils/merge-options';

type Dismissed = (e: Event) => void;

interface DismissibleOptions {
  disableWhen: boolean;
  dismissOnFocusChange: boolean;
  related: Element | Element[] | null;
}

interface DismissibleSignature {
  Element: HTMLElement;
  Args: {
    Named: { dismissed: Dismissed } & Partial<DismissibleOptions>;
  };
}

function NOOP(_e: Event): void {
  /* no-op */
}

const DEFAULT_OPTIONS = {
  dismissOnFocusChange: true,
  disableWhen: false,
  related: null,
};

/**
 * Calls the passed-in `dismissed` action whenever the user mouses down outside the
 * element or hits the "escape" key. For example,
 * ```hbs
 * {{#if shouldShowThingy}}
 *   <div class="thingy" {{dismissible dismissed=this.hideThingy}}>
 *      I am dismissible!
 *   </div>
 * {{/if}}
 * ```
 *
 * ```js
 * class ThingyComponent extends Component {
 *   @tracked shouldShowThingy = true;
 *
 *   @action
 *   hideThingy() {
 *     this.shouldShowThingy = false;
 *   }
 * }
 * ```
 *
 * Optionally, you can pass the `disableWhen` property to disable dismissing:
 * ```hbs
 * {{#if shouldShowThingy}}
 *   <div class="thingy" {{dismissible dismissed=this.hideThingy disableWhen=this.disableDismiss}}>
 *      I am dismissible sometimes!
 *   </div>
 * {{/if}}
 * ```
 *
 * Instead of `click`, we use `mousedown` due to its early DOM-event order.
 * This registers the dismissible event as soon as possible, before other actions
 * have triggered events such as `focus`.
 *
 * This is particularly helpful on the ListBox component, which demands to be shown
 * on input `focus` and hidden on click-outside events. By using `mousedown`,
 * we're able to capture the dismissible event before we show the ListBox
 * (rather than after, with `click`), thus avoiding unintentional cancellations.
 */
export default class DismissibleModifier extends Modifier<DismissibleSignature> {
  constructor(owner: unknown, args: ArgsFor<DismissibleSignature>) {
    super(owner, args);
    registerDestructor(this, this.removeListeners);
  }

  modify(
    element: DismissibleSignature['Element'],
    _positional: PositionalArgs<DismissibleSignature>,
    { dismissed, ...options }: NamedArgs<DismissibleSignature>
  ): void {
    this.el = element;
    this._dismissed = dismissed;

    this.options = mergeOptions(DEFAULT_OPTIONS, options);

    if (options.disableWhen) {
      this.removeListeners();
    } else {
      document.addEventListener('pointerdown', this.handlePointerdown);
      document.addEventListener('keydown', this.handleKeydown);
      document.addEventListener('focusin', this.handleFocusIn);
    }
  }

  private el?: DismissibleSignature['Element'];

  private options: DismissibleOptions = DEFAULT_OPTIONS;

  private _dismissed?: Dismissed;
  private get dismissed(): Dismissed {
    assert('expected `dismissed` to be defined', this._dismissed);
    return this.options.disableWhen ? NOOP : this._dismissed;
  }

  private get containers(): Element[] {
    assert('expected this.el to be set', this.el);
    let containers: Element[] = [this.el];
    let { related } = this.options;

    if (related instanceof Element) {
      containers.push(related);
    } else if (Array.isArray(related)) {
      containers.push(...related);
    }

    return containers;
  }

  private didFocusOutside(e: Event): boolean {
    return (
      e.target instanceof Node &&
      this.containers.every((el) => {
        return e.target instanceof Node && !el.contains(e.target);
      })
    );
  }

  @action private handlePointerdown(e: PointerEvent): void {
    /**
     * Generally, we want to run the passed in `dismissed` callback when a user
     * clicks outside `this.element`, approximated by checking that `this.element`
     * does not contain the click target.
     *
     * However, there is an edge case that causes this check to fail. In the
     * example below, clicking on #inner (`this.target`) will remove #inner from
     * the DOM. By the time the event bubbles up to #outer (`this.element`),
     * #outer will not contain #inner because it's no longer in the DOM.
     * The first check would pass, errantly calling the passed in `dismissed`
     * callback. We added the second check to detect this edge case.
     *
     * <div id="outer" {{dismissible dismissed=this.dismissed}}>
     *   {{#if this.showTarget}}
     *     <div id="inner" {{on 'click' this.hideTarget}>
     *       click to hide
     *     </div>
     *   {{/if}}
     * </div>
     */
    if (
      this.didFocusOutside(e) &&
      e.target instanceof Node &&
      (document.body.contains(e.target) || e.target.nodeName === 'HTML')
    ) {
      this.dismissed(e);
    }
  }

  @action private handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.dismissed(e);
    }
  }

  @action private handleFocusIn(e: FocusEvent): void {
    /**
     * We attach this action to the `focusin` event on the `document`. If the user
     * changes focus _within_ the dismissible container, we can ignore it safely.
     * If the user changes focus to something outside of the dismissible element,
     * we will call the dismissed callback. This handles tabbing out to the next
     * focusable item on the page, while avoiding some common false positives
     * such as tabbing within the dismissible container, temporarily losing focus
     * to the context menu, the window itself losing focus, etc.
     */
    if (this.options.dismissOnFocusChange && this.didFocusOutside(e)) {
      this.dismissed(e);
    }
  }

  @action private removeListeners(): void {
    document.removeEventListener('pointerdown', this.handlePointerdown);
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('focusin', this.handleFocusIn);
  }
}
