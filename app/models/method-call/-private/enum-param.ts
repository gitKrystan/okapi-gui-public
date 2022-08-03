import { EnumMethodParam, EnumMethodParamOption } from 'okapi/models/method';
import AbstractParam from './abstract-param';

export default class EnumParam extends AbstractParam<
  EnumMethodParam,
  EnumMethodParamOption,
  EnumMethodParamOption
> {
  protected parse(
    inputValue: EnumMethodParamOption | null | undefined
  ): EnumMethodParamOption | undefined {
    return inputValue ?? undefined;
  }

  protected format(
    value: EnumMethodParamOption | undefined
  ): EnumMethodParamOption | undefined {
    return value;
  }
}
