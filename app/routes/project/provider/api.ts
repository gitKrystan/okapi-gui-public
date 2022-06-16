import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Api from 'okapi/models/api';
import { ProjectRouteModel } from 'okapi/routes/project';
import { ProviderRouteModel } from 'okapi/routes/project/provider';
import { NotFound } from 'okapi/services/server';

export type ApiRouteModel = Api;

export type ApiRouteParams = {
  api_id: string;
};

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
      let project = this.modelFor('project') as ProjectRouteModel;
      throw new NotFound(
        `Could not find provider "${provider.name}" api "${api_id}" for project "${project.name}."`
      );
    }
  }
}
