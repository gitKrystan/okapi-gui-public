import AbstractParam from './abstract-param';

export interface RawBooleanParam {
  type: 'boolean';
  name: string;
  description: string;
  value?: boolean;
}

export default class BooleanParam extends AbstractParam<
  boolean,
  boolean,
  RawBooleanParam
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
