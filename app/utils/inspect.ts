// @ts-expect-error `inspect` is private and not typed
import { inspect as emberInspect } from '@ember/debug';

/**
 * Convenience method to inspect an object. This method will attempt to convert
 * the object into a useful string description.
 */
export default function inspect(value: unknown): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return emberInspect(value) as string;
}
