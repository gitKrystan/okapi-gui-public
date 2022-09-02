/* eslint-disable @typescript-eslint/method-signature-style */

export interface OpenOptions {
  didOpen?: () => void;
}

export interface CloseOptions {
  didClose?: () => void;
}

/**
 * Public API for the Dropdown component, yielded to the caller.
 */
export default interface DropdownApi {
  isExpanded: boolean;

  /**
   * Event handler that opens the dropdown's `content`.
   * Can be passed to the "on" modifier directly, in which case we will receive
   * the `Event`.
   */
  open(event: Event): void;
  /**
   * Opens the dropdown's `content`.
   *
   * Executes the optional `didOpen` callback specified in the `options` POJO
   * after the dropdown is expanded.
   */
  open(options?: OpenOptions): void;

  /**
   * Event handler that closes the dropdown's `content`.
   * Can be passed to the "on" modifier directly, in which case we will receive
   * the `Event`.
   */
  close(event: Event): void;
  /**
   * Closes the dropdown's `content`.
   *
   * Executes the optional `didClose` callback specified in the `options` POJO
   * after the dropdown is closed.
   */
  close(options?: CloseOptions): void;

  /**
   * Event handler that toggles the dropdown's `content`.
   * Can be passed to the "on" modifier directly, in which case we will receive
   * the `Event`.
   */
  toggle(event: Event): void;
  /**
   * Toggles the dropdown's `content`.
   *
   * Executes the optional `didOpen` callback specified in the `options` POJO
   * after the dropdown is expanded.
   * Executes the optional `didClose` callback specified in the `options` POJO
   * after the dropdown is closed.
   */
  toggle(options?: CloseOptions & OpenOptions): void;

  /**
   * Event handler that closes the dropdown's `content` after a delay.
   * Can be passed to the "on" modifier directly, in which case we will receive
   * the `Event`.
   */
  delayedClose(event: Event): void;
  /**
   * Closes the dropdown's `content` after a delay.
   *
   * Executes the optional `didClose` callback specified in the `options` POJO
   * after the dropdown is closed.
   */
  delayedClose(options?: CloseOptions): void;
}
