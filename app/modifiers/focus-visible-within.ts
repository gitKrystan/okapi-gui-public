import { assert } from '@ember/debug';
import { registerDestructor } from '@ember/destroyable';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { task, timeout } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import Modifier, { ArgsFor, NamedArgs, PositionalArgs } from 'ember-modifier';

import mergeOptions from 'okapi/utils/merge-options';

const FOCUS_VISIBLE_WITHIN_CLASS = 'u_focus-visible-within';

const DEFAULT_OPTIONS = {
  ignoreKeyboardModality: false,
};

const INPUT_TYPES_ALLOW_LIST: Record<string, boolean> = {
  text: true,
  search: true,
  url: true,
  tel: true,
  email: true,
  password: true,
  number: true,
  date: true,
  month: true,
  week: true,
  time: true,
  datetime: true,
  'datetime-local': true,
};

interface FocusVisibleWithinSignature {
  Element: HTMLElement;
  Args: {
    Named: {
      ignoreKeyboardModality?: boolean;
    };
  };
}

/**
 * Detects :focus-visible WITHIN the element and adds a utility class to style
 * the element based on "focus-visible-within". This mimics the functionality of
 * `:has(:focus-visible)` which is yet not supported in all browsers.
 *
 * @see https://github.com/WICG/focus-visible
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/:has
 */
export default class FocusVisibleWithinModifier extends Modifier<FocusVisibleWithinSignature> {
  constructor(owner: unknown, args: ArgsFor<FocusVisibleWithinSignature>) {
    super(owner, args);
    registerDestructor(this, this.teardown);
  }

  modify(
    element: FocusVisibleWithinSignature['Element'],
    _positional: PositionalArgs<FocusVisibleWithinSignature>,
    options: NamedArgs<FocusVisibleWithinSignature>
  ): void {
    this._el = element;

    this.options = mergeOptions(DEFAULT_OPTIONS, options);

    this.addVisibilityChangeListener();
    this.addInitialPointerMoveListeners();
    this.addElementListeners();
  }

  private _el?: FocusVisibleWithinSignature['Element'];

  private options = DEFAULT_OPTIONS;

  @tracked private hadKeyboardEvent = true;

  @tracked private hadFocusVisibleRecently = false;

  private get el(): FocusVisibleWithinSignature['Element'] {
    assert('expected this._el to be set', this._el);
    return this._el;
  }

  @action private teardown(): void {
    this.removeVisibilityChangeListener();
    this.removeInitialPointerMoveListeners();
    this.removeElementListeners();
  }

  private addVisibilityChangeListener(): void {
    document.addEventListener(
      'visibilitychange',
      this.onVisibilityChange,
      true
    );
  }

  private removeVisibilityChangeListener(): void {
    document.removeEventListener(
      'visibilitychange',
      this.onVisibilityChange,
      true
    );
  }

  /**
   * If the user changes tabs, keep track of whether or not the previously
   * focused element had .focus-visible.
   */
  @action private onVisibilityChange(_e: Event): void {
    if (document.visibilityState === 'hidden') {
      // If the tab becomes active again, the browser will handle calling focus
      // on the element (Safari actually calls it twice).
      // If this tab change caused a blur on an element with focus-visible,
      // re-apply the class when the user switches back to the tab.
      if (this.hadFocusVisibleRecently) {
        this.hadKeyboardEvent = true;
      }
      this.addInitialPointerMoveListeners();
    }
  }

  /**
   * Add a group of listeners to detect usage of any pointing devices.
   * These listeners will be added when the modifier first loads, and anytime
   * the window is blurred, so that they are active when the window regains
   * focus.
   */
  private addInitialPointerMoveListeners(): void {
    document.addEventListener('pointermove', this.onInitialPointerMove);
    document.addEventListener('pointerdown', this.onInitialPointerMove);
    document.addEventListener('pointerup', this.onInitialPointerMove);
  }

  private removeInitialPointerMoveListeners(): void {
    document.removeEventListener('pointermove', this.onInitialPointerMove);
    document.removeEventListener('pointerdown', this.onInitialPointerMove);
    document.removeEventListener('pointerup', this.onInitialPointerMove);
  }

  /**
   * When the modifier first loads, assume the user is in keyboard modality.
   * If any event is received from a pointing device (e.g. mouse, pointer,
   * touch), turn off keyboard modality.
   * This accounts for situations where focus enters the page from the URL bar.
   */
  @action private onInitialPointerMove(e: Event): void {
    // Work around a Safari quirk that fires a mousemove on <html> whenever the
    // window blurs, even if you're tabbing out of the page. ¯\_(ツ)_/¯
    if (e.target instanceof HTMLElement && e.target.nodeName === 'HTML') {
      return;
    }

    this.hadKeyboardEvent = false;
    this.removeInitialPointerMoveListeners();
  }

  private addElementListeners(): void {
    document.addEventListener('keydown', this.onKeyDown, true);
    document.addEventListener('pointerdown', this.onPointerDown, true);
    this.el.addEventListener('focus', this.onFocus, true);
    this.el.addEventListener('blur', this.onBlur, true);
  }

  private removeElementListeners(): void {
    document.removeEventListener('keydown', this.onKeyDown, true);
    document.removeEventListener('pointerdown', this.onPointerDown, true);
    this.el.removeEventListener('focus', this.onFocus, true);
    this.el.removeEventListener('blur', this.onBlur, true);
  }

  /**
   * If the most recent user interaction was via the keyboard;
   * and the key press did not include a meta, alt/option, or control key;
   * then the modality is keyboard. Otherwise, the modality is not keyboard.
   * Apply `focus-visible` to any current active element and keep track
   * of our keyboard modality state with `hadKeyboardEvent`.
   */
  @action private onKeyDown(e: KeyboardEvent): void {
    if (e.metaKey || e.altKey || e.ctrlKey) {
      return;
    }

    if (
      isValidFocusTarget(document.activeElement) &&
      this.el.contains(document.activeElement)
    ) {
      this.el.classList.add(FOCUS_VISIBLE_WITHIN_CLASS);
    }

    this.hadKeyboardEvent = true;
  }

  /**
   * If at any point a user clicks with a pointing device, ensure that we change
   * the modality away from keyboard.
   * This avoids the situation where a user presses a key on an already focused
   * element, and then clicks on a different element, focusing it with a
   * pointing device, while we still think we're in keyboard modality.
   */
  @action private onPointerDown(_e: Event): void {
    this.hadKeyboardEvent = false;
  }

  /**
   * On `focus`, add the `FOCUS_VISIBLE_WITHIN_CLASS` class to the element if:
   * - the target received focus as a result of keyboard navigation, or
   * - the event target is an element that will likely require interaction
   *   via the keyboard (e.g. a text box)
   * AND
   * - the event target is within the element
   */
  @action private onFocus(e: Event): void {
    // Prevent IE from focusing the document or HTML element.
    if (!isValidFocusTarget(e.target)) {
      return;
    }

    if (
      this.hadKeyboardEvent ||
      (this.focusTriggersKeyboardModality(e.target) &&
        this.el.contains(e.target))
    ) {
      this.el.classList.add(FOCUS_VISIBLE_WITHIN_CLASS);
    }
  }

  /**
   * Computes whether the given element should always match `:focus-visible` when
   * focused.
   */
  private focusTriggersKeyboardModality(el: Element): boolean {
    return (
      (!this.options.ignoreKeyboardModality &&
        el instanceof HTMLInputElement &&
        INPUT_TYPES_ALLOW_LIST[el.type] &&
        !el.readOnly) ||
      (el instanceof HTMLTextAreaElement && !el.readOnly) ||
      (el instanceof HTMLElement && el.isContentEditable)
    );
  }

  /**
   * On `blur`, remove the `FOCUS_VISIBLE_WITHIN_CLASS` class from the element.
   */
  @action private onBlur(e: Event): void {
    if (!isValidFocusTarget(e.target)) {
      return;
    }

    if (
      this.el.contains(e.target) &&
      this.el.classList.contains(FOCUS_VISIBLE_WITHIN_CLASS)
    ) {
      void this.trackRecentFocusVisible.perform();
      this.el.classList.remove(FOCUS_VISIBLE_WITHIN_CLASS);
    }
  }

  /**
   * To detect a tab/window switch, we look for a blur event followed
   * rapidly by a visibility change.
   * If we don't see a visibility change within 100ms, it's probably a
   * regular focus change.
   */
  @task({ restartable: true }) private trackRecentFocusVisible = taskFor(
    async () => {
      this.hadFocusVisibleRecently = true;
      await timeout(100);
      this.hadFocusVisibleRecently = false;
    }
  );
}

function isValidFocusTarget(el: Element | EventTarget | null): el is Element {
  return (
    el instanceof Element && el.nodeName !== 'HTML' && el.nodeName !== 'BODY'
  );
}

declare module '@glint/environment-ember-loose/registry' {
  export default interface Registry {
    'focus-visible-within': typeof FocusVisibleWithinModifier;
  }
}

// FIXME: Tests
