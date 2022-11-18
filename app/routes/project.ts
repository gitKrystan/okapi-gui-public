import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Project from 'okapi/models/project';
import type ServerService from 'okapi/services/server';

export type ProjectRouteModel = Project;

export interface ProjectRouteParams {
  project_id: string;
}

export default class ProjectRoute extends Route<
  ProjectRouteModel,
  ProjectRouteParams
> {
  @service declare server: ServerService;

  override model(params: ProjectRouteParams): Promise<ProjectRouteModel> {
    return this.server.getProject(params.project_id);
  }
}
