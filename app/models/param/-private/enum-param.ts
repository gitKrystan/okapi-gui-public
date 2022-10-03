import AbstractParam from './abstract-param';

export interface RawEnumParam {
  type: 'enum';
  name: string;
  description: string;
  options: RawEnumParamOption[];
  value?: RawEnumParamOption;
}

export interface RawEnumParamOption {
  name: string;
  description?: string;
}

export type EnumParamOption = RawEnumParamOption;

export default class EnumParam extends AbstractParam<
  RawEnumParamOption,
  RawEnumParamOption | null,
  RawEnumParam
> {
  protected normalize(
    rawInputValue: RawEnumParamOption | null | undefined
  ): RawEnumParamOption | undefined {
    return rawInputValue ?? undefined;
  }

  protected parse(
    normalizedInputValue: RawEnumParamOption | undefined
  ): RawEnumParamOption | undefined {
    return normalizedInputValue;
  }

  protected format(
    value: RawEnumParamOption | undefined
  ): RawEnumParamOption | undefined {
    return value;
  }
}
