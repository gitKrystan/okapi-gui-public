import Route from '@ember/routing/route';
import type RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import type Api from 'okapi/models/api';
import type { ProviderRouteModel } from 'okapi/routes/project/provider';
import { NotFound } from 'okapi/services/server';

export type ApiRouteModel = Api;

export interface ApiRouteParams {
  api_id: string;
}

export default class ProjectProviderApiRoute extends Route<
  ApiRouteModel,
  ApiRouteParams
> {
  @service declare router: RouterService;

  // eslint-disable-next-line @typescript-eslint/require-await
  async model({ api_id }: ApiRouteParams): Promise<ApiRouteModel> {
    let provider = this.modelFor('project.provider') as ProviderRouteModel;
    let api = provider.apis.find((a) => a.id === api_id);
    if (api) {
      return api;
    } else {
      throw new NotFound(`Could not find api "${api_id}."`);
    }
  }
}
