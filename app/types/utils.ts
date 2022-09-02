import { assert } from '@ember/debug';

/**
 * Checks if the given value is a `Record<string, unknown>`.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

/**
 * A version of `Object.keys` that returns `Array<keyof T>` instead of
 * `Array<string>`. This is UNSAFE due to
 * [this issue](https://github.com/microsoft/TypeScript/pull/12253#issuecomment-263132208)
 * so use at your own risk.
 */
export function unsafeKeys<T>(o: T): Array<keyof T> {
  assert('unsafeKeys can only be used on an object', isRecord(o));
  return Object.keys(o) as Array<keyof T>;
}
