import { assert } from '@ember/debug';
import {
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
  await focus(target);

  let el = document.activeElement;
  assert('expected active element', el instanceof HTMLElement);

  await triggerEvent(el, 'focusin');
  await triggerKeyEvent(el, 'keydown', 'Enter');
  await triggerEvent(el, 'click');
  await triggerKeyEvent(el, 'keyup', 'Enter');
}
