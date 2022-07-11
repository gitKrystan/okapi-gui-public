import Api, { ApiParams } from 'okapi/models/api';
import Provider, { ProviderParams } from 'okapi/models/provider';

export interface ProjectParams {
  name: string;
  apis: ApiParams[];
  providers: ProviderParams[];
}

export default class Project {
  static from({ name, apis, providers }: ProjectParams): Project {
    return new Project(
      name,
      apis.map((a) => Api.from(a)),
      providers.map((p) => Provider.from(p))
    );
  }

  private constructor(
    readonly name: string,
    readonly apis: Api[],
    readonly providers: Provider[]
  ) {}

  get id(): string {
    return this.name;
  }

  findApi(apiId: string): Api | null {
    return this.apis.find((api) => api.id === apiId) ?? null;
  }

  findApiOrError(apiId: string): Api {
    let api = this.findApi(apiId);
    if (!api) {
      throw new Error(
        `Could not find API with id ${apiId} for project ${this.id}`
      );
    }
    return api;
  }
}
