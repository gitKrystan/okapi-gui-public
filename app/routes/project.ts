import Route from '@ember/routing/route';
import { service } from '@ember/service';
import Project from 'okapi/models/project';
import ServerService from 'okapi/services/server';

export type ProjectRouteModel = Project;

export type ProjectRouteParams = { project_id: string };

export default class ProjectRoute extends Route<
  ProjectRouteModel,
  ProjectRouteParams
> {
  @service declare server: ServerService;

  model(params: ProjectRouteParams): Promise<ProjectRouteModel> {
    return this.server.getProject(params.project_id);
  }
}
