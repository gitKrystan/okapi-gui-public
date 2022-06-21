import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import Method from 'okapi/models/method';
import { ProjectRouteModel } from 'okapi/routes/project';
import { ProviderRouteModel } from 'okapi/routes/project/provider';
import { ApiRouteModel } from 'okapi/routes/project/provider/api';
import { NotFound } from 'okapi/services/server';

export type MethodRouteModel = Method;

export type MethodRouteParams = {
  method_id: string;
};

export default class ProjectProviderApiMethodRoute extends Route<
  MethodRouteModel,
  MethodRouteParams
> {
  @service declare router: RouterService;

  // eslint-disable-next-line @typescript-eslint/require-await
  async model({ method_id }: MethodRouteParams): Promise<MethodRouteModel> {
    let api = this.modelFor('project.provider.api') as ApiRouteModel;
    let method = api.methods.find((m) => m.id === method_id);
    if (method) {
      return method;
    } else {
      let project = this.modelFor('project') as ProjectRouteModel;
      let provider = this.modelFor('project.provider') as ProviderRouteModel;
      throw new NotFound(
        `Could not find method \`${api.name}#${method_id}\` for provider "${provider.name}" and project "${project.name}."`
      );
    }
  }
}
