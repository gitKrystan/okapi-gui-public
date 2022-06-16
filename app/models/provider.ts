import Api, { ApiParams } from 'okapi/models/api';

export type ProviderParams = {
  name: string;
  apis: ApiParams[];
};

export default class Provider {
  static from({ name, apis }: ProviderParams): Provider {
    return new Provider(
      name,
      apis.map((p) => Api.from(p))
    );
  }

  private constructor(readonly name: string, readonly apis: Api[]) {}

  get id(): string {
    return this.name;
  }
}
