import { Provider as RawProviderParams } from 'okapi/types/fixme-proto-types';

export type ProviderParams = Pick<RawProviderParams, 'name'> & {
  apiMethods: unknown[];
};

export default class Provider {
  static from({ name, apiMethods }: ProviderParams): Provider {
    return new Provider(name, apiMethods);
  }

  private constructor(readonly name: string, readonly apiMethods: unknown[]) {}

  get id(): string {
    return this.name;
  }
}
