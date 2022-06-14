import Provider, { ProviderParams } from 'okapi/models/provider';
import { App as RawProjectParams } from 'okapi/types/fixme-proto-types';

export type ProjectParams = Pick<RawProjectParams, 'name'> & {
  providers: ProviderParams[];
};

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
