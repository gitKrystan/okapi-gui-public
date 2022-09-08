import { assert } from '@ember/debug';
import type { Target } from '@ember/test-helpers';
import {
  find,
  focus,
  settled,
  triggerEvent,
  triggerKeyEvent,
} from '@ember/test-helpers';

import inspect from 'okapi/utils/inspect';

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

  if (el instanceof HTMLElement) {
    el.focus();
    await triggerEvent(el, 'focus');
  }

  await triggerEvent(el, 'pointerup');
  await triggerEvent(el, 'mouseup');
  await triggerEvent(el, 'click');
}

/**
 * A version of `fillIn` that triggers `InputEvent` instead of `Event`.
 */
export async function fireInputEvent(
  target: Target,
  text: string,
  type: 'input' | 'beforeinput' = 'input',
  options: InputEventInit = {
    inputType: 'insertText', // https://rawgit.com/w3c/input-events/v1/index.html#interface-InputEvent-Attributes
    isComposing: true,
    data: text[text.length - 1],
  }
): Promise<void> {
  let el = typeof target === 'string' ? find(target) : target;
  assert(
    'input only works on Input or TextArea elements',
    el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement
  );

  assert(
    `Can not \`fireInputEvent\` disabled '${inspect(target)}'.`,
    !el.disabled
  );

  assert(
    `Can not \`fireInputEvent\` readonly '${inspect(target)}'.`,
    !el.readOnly
  );

  let max = el.getAttribute('maxlength');
  assert(
    `Can not \`fireInputEvent\` with text: '${text}' that exceeds maxlength: '${inspect(
      max
    )}'.`,
    !max || text.length <= Number(max)
  );

  el.focus();
  await triggerEvent(el, 'focus');

  el.value = text;

  let event = new InputEvent(type, options);
  el.dispatchEvent(event);

  return settled();
}
