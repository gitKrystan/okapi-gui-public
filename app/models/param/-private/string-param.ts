import AbstractParam from './abstract-param';

export interface RawStringParam {
  type: 'string';
  name: string;
  description: string;
  value?: string;
}

export default class StringParam extends AbstractParam<
  string,
  string | null,
  RawStringParam
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
