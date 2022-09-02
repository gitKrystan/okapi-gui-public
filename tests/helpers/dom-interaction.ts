import { assert } from '@ember/debug';
import {
  find,
  focus,
  Target,
  triggerEvent,
  triggerKeyEvent,
} from '@ember/test-helpers';

/**
 * Simulates a "click" event performed by a keyboard interaction (hitting the
 * "Enter" key on a clickable element).
 *
 * The following events are triggered (in order):
 * - focus
 * - focusin
 * - keydown
 * - click
 * - keyup
 */
export async function keyboardClick(target: Target): Promise<void> {
  await focus(target); // focus and focusin

  let el = document.activeElement;
  assert('expected active element', el instanceof HTMLElement);

  await triggerKeyEvent(el, 'keydown', 'Enter');
  await triggerEvent(el, 'click');
  await triggerKeyEvent(el, 'keyup', 'Enter');
}

/**
 * Simulates a "click" event performed by a mouse interaction, including pointer
 * events, which are not included in the built-in @ember/test-helpers click.
 *
 * The following events are triggered (in order):
 * - pointerdown
 * - mousedown
 * - focus
 * - focusin
 * - pointerup
 * - mouseup
 * - click
 */
export async function pointerClick(target: Target): Promise<void> {
  let el = typeof target === 'string' ? find(target) : target;
  assert('expected el', el instanceof Element || el instanceof Document);

  await triggerEvent(el, 'pointerdown');
  await triggerEvent(el, 'mousedown');
  await focus(el); // focus and focusin
  await triggerEvent(el, 'pointerup');
  await triggerEvent(el, 'mouseup');
  await triggerEvent(el, 'click');
}
