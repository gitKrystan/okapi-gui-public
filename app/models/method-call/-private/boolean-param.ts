import { BooleanMethodParam } from 'okapi/models/method';
import AbstractParam from './abstract-param';

export default class BooleanParam extends AbstractParam<
  BooleanMethodParam,
  boolean,
  boolean
> {
  protected parse(inputValue: boolean | undefined | null): boolean | undefined {
    return inputValue ?? undefined;
  }

  protected format(value: boolean | undefined): boolean | undefined {
    return value;
  }
}
