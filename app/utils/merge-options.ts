import { unsafeKeys } from '../types/utils';

/**
 * Merges a partial of options into the defaults, returning an object with the
 * defaults overridden if defined in the partial.
 */
export default function mergeOptions<T>(
  defaults: Required<T>,
  options: Partial<T>
): Required<T> {
  let mergedOptions: Partial<Record<keyof T, unknown>> = {};
  unsafeKeys(defaults).forEach((key) => {
    mergedOptions[key] =
      options[key] === undefined ? defaults[key] : options[key];
  });
  return mergedOptions as Required<T>;
}
