import Provider, { ProviderParams } from 'okapi/models/provider';

export interface ProjectParams {
  name: string;
  providers: ProviderParams[];
}

export default class Project {
  static from({ name, providers }: ProjectParams): Project {
    return new Project(
      name,
      providers.map((p) => Provider.from(p))
    );
  }

  private constructor(readonly name: string, readonly providers: Provider[]) {}

  get id(): string {
    return this.name;
  }
}
