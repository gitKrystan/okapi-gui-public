import type {
  EnumMethodParam,
  EnumMethodParamOption,
} from 'okapi/models/method';
import AbstractParam from './abstract-param';

export default class EnumParam extends AbstractParam<
  EnumMethodParam,
  EnumMethodParamOption,
  EnumMethodParamOption | null
> {
  protected normalize(
    rawInputValue: EnumMethodParamOption | null | undefined
  ): EnumMethodParamOption | undefined {
    return rawInputValue ?? undefined;
  }

  protected parse(
    normalizedInputValue: EnumMethodParamOption | undefined
  ): EnumMethodParamOption | undefined {
    return normalizedInputValue;
  }

  protected format(
    value: EnumMethodParamOption | undefined
  ): EnumMethodParamOption | undefined {
    return value;
  }
}
