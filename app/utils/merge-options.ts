import { unsafeKeys } from '../types/utils';

/**
 * Merges a partial of options into the defaults, returning an object with the
 * defaults overridden if defined in the partial.
 */
export default function mergeOptions<Defaults, Options>(
  defaults: Defaults,
  options: Options
): Defaults & Options {
  let mergedOptions = { ...defaults };
  for (let key of unsafeKeys(options)) {
    // @ts-expect-error TS is super confused
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    mergedOptions[key] =
      // @ts-expect-error TS is super confused
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      options[key] === undefined ? defaults[key] : options[key];
  }
  return mergedOptions as Defaults & Options;
}
