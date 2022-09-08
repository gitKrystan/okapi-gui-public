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
  for (let key of unsafeKeys(defaults)) {
    mergedOptions[key] =
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      options[key] === undefined ? defaults[key] : options[key];
  }
  return mergedOptions as Required<T>;
}
