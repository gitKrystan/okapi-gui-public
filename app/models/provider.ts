export interface ProviderParams {
  id: string;
  name: string;
  apiIds: string[];
}

export default class Provider {
  static from({ id, name, apiIds }: ProviderParams): Provider {
    return new Provider(id, name, apiIds);
  }

  private constructor(
    readonly id: string,
    readonly name: string,
    readonly apiIds: string[]
  ) {}
}
