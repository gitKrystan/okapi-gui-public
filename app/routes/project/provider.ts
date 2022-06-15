import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Provider from 'okapi/models/provider';
import { ProjectRouteModel } from 'okapi/routes/project';
import { NotFound } from 'okapi/services/server';

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

  // eslint-disable-next-line @typescript-eslint/require-await
  async model({
    provider_id,
  }: ProjectProviderRouteParams): Promise<ProjectProviderRouteModel> {
    let project = this.modelFor('project') as ProjectRouteModel;
    let provider = project.providers.find((p) => p.id === provider_id);
    if (provider) {
      return provider;
    } else {
      throw new NotFound(
        `Could not find provider "${provider_id}" for project "${project.name}."`
      );
    }
  }
}
