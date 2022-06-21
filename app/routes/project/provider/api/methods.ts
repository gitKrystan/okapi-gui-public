import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';

export default class ProjectProvidersApisMethodsRoute extends Route {
  @service declare router: RouterService;

  redirect(): void {
    void this.router.replaceWith('project.provider.api');
  }
}
