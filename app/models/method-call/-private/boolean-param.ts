import { BooleanMethodParam } from 'okapi/models/method';
import AbstractParam from './abstract-param';

export default class BooleanParam extends AbstractParam<
  BooleanMethodParam,
  boolean,
  boolean
> {
  protected normalize(rawInputValue: boolean | undefined): boolean | undefined {
    return rawInputValue ?? undefined;
  }

  protected parse(
    normalizedInputValue: boolean | undefined
  ): boolean | undefined {
    return normalizedInputValue;
  }

  protected format(value: boolean | undefined): boolean | undefined {
    return value;
  }
}
