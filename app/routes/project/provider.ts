import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Provider from 'okapi/models/provider';
import { ProjectRouteModel } from 'okapi/routes/project';
import ServerService from 'okapi/services/server';

export type ProjectProviderRouteModel = Provider;

export type ProjectProviderRouteParams = {
  project_id: string;
  provider_id: string;
};

export default class ProjectProviderRoute extends Route<
  ProjectProviderRouteModel,
  ProjectProviderRouteParams
> {
  @service declare router: RouterService;
  @service declare server: ServerService;

  model(params: ProjectProviderRouteParams): ProjectProviderRouteModel {
    let project = this.modelFor('project') as ProjectRouteModel;
    let provider = project.providers.find((p) => p.id === params.provider_id);
    if (provider) {
      return provider;
    } else {
      throw new Error('not found');
    }
  }
}
