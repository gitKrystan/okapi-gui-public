import Route from '@ember/routing/route';
import { service } from '@ember/service';
import Project from 'okapi/models/project';
import ServerService from 'okapi/services/server';

export default class IndexRoute extends Route {
  @service declare server: ServerService;

  model(): Promise<Project[]> {
    return this.server.getProjectList();
  }
}
