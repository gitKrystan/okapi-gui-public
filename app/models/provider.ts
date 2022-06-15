export type ProviderParams = {
  name: string;
  apis: unknown[];
};

export default class Provider {
  static from({ name, apis }: ProviderParams): Provider {
    return new Provider(name, apis);
  }

  private constructor(readonly name: string, readonly apis: unknown[]) {}

  get id(): string {
    return this.name;
  }
}
