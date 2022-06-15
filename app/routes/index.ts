import Route from '@ember/routing/route';
import { service } from '@ember/service';
import Project from 'okapi/models/project';
import ServerService from 'okapi/services/server';

export type IndexRouteModel = Project[];

export default class IndexRoute extends Route<IndexRouteModel> {
  @service declare server: ServerService;

  model(): Promise<IndexRouteModel> {
    return this.server.getProjectList();
  }
}
