import { StringMethodParam } from 'okapi/models/method';
import { squish } from 'okapi/utils/string-util';
import AbstractParam from './abstract-param';

export default class StringParam extends AbstractParam<
  StringMethodParam,
  string,
  string
> {
  protected parse(inputValue: string | undefined | null): string | undefined {
    return squish(inputValue) || undefined;
  }

  protected format(value: string | undefined): string | undefined {
    return value;
  }
}
