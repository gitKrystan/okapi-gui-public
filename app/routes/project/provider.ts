import Route from '@ember/routing/route';
import type Api from 'okapi/models/api';
import type Provider from 'okapi/models/provider';
import type { ProjectRouteModel } from 'okapi/routes/project';
import { NotFoundError } from 'okapi/services/server';

export interface ProviderRouteModel {
  provider: Provider;
  apis: Api[];
}

export interface ProviderRouteParams {
  provider_id: string;
}

export default class ProjectProviderRoute extends Route<
  ProviderRouteModel,
  ProviderRouteParams
> {
  // eslint-disable-next-line @typescript-eslint/require-await
  override async model({
    provider_id,
  }: ProviderRouteParams): Promise<ProviderRouteModel> {
    let project = this.modelFor('project') as ProjectRouteModel;
    let provider = project.providers.find((p) => p.id === provider_id);
    if (provider) {
      let { apiIds } = provider;
      return {
        provider,
        apis: apiIds.map((apiId) => {
          let api = project.findApi(apiId);
          if (api) {
            return api;
          } else {
            throw new NotFoundError(
              `Could not find api "${apiId} for provider "${provider_id}."`
            );
          }
        }),
      };
    } else {
      throw new NotFoundError(`Could not find provider "${provider_id}."`);
    }
  }
}
