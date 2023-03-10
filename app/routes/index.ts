import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Project from 'okapi/models/project';
import type ServerService from 'okapi/services/server';

export type IndexRouteModel = readonly Project[];

export default class IndexRoute extends Route<IndexRouteModel> {
  @service declare server: ServerService;

  override async model(): Promise<IndexRouteModel> {
    return this.server.getProjectList();
  }
}
