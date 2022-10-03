import Route from '@ember/routing/route';
import { service } from '@ember/service';

import type Project from 'okapi/models/project';
import type ProjectSetting from 'okapi/models/project-setting';
import type { ProjectRouteModel } from 'okapi/routes/project';
import type ServerService from 'okapi/services/server';

export interface ProjectSettingsRouteModel {
  project: Project;
  settings: readonly ProjectSetting[];
}

export interface ProjectSettingsRouteParams {}

export default class ProjectSettingsRoute extends Route<
  ProjectSettingsRouteModel,
  ProjectSettingsRouteParams
> {
  @service declare server: ServerService;

  async model(): Promise<ProjectSettingsRouteModel> {
    let settings = await this.server.getSettingsList();
    let project = this.modelFor('project') as ProjectRouteModel;
    return { project, settings };
  }
}
