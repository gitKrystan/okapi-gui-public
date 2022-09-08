import type { StringMethodParam } from 'okapi/models/method';
import AbstractParam from './abstract-param';

export default class StringParam extends AbstractParam<
  StringMethodParam,
  string,
  string | null
> {
  protected normalize(
    rawInputValue: string | null | undefined
  ): string | undefined {
    return rawInputValue ?? undefined;
  }

  protected parse(
    normalizedInputValue: string | undefined
  ): string | undefined {
    return normalizedInputValue;
  }

  protected format(value: string | undefined): string | undefined {
    return value;
  }
}
