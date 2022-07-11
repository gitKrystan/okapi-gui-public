import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Api from 'okapi/models/api';
import Provider from 'okapi/models/provider';
import { ProjectRouteModel } from 'okapi/routes/project';
import { NotFound } from 'okapi/services/server';

export type ProviderRouteModel = {
  provider: Provider;
  apis: Api[];
};

export type ProviderRouteParams = {
  provider_id: string;
};

export default class ProjectProviderRoute extends Route<
  ProviderRouteModel,
  ProviderRouteParams
> {
  @service declare router: RouterService;

  // eslint-disable-next-line @typescript-eslint/require-await
  async model({
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
            throw new NotFound(
              `Could not find api "${apiId} for provider "${provider_id}."`
            );
          }
        }),
      };
    } else {
      throw new NotFound(`Could not find provider "${provider_id}."`);
    }
  }
}
