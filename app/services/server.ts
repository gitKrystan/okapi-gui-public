import { AbstractService } from 'ember-swappable-service';

import type Method from 'okapi/models/method';
import type Project from 'okapi/models/project';
import type ProjectSetting from 'okapi/models/project-setting';

export class ServerError extends Error {}

export class NotFound extends ServerError {}

export default abstract class ServerService extends AbstractService {
  abstract getProjectList(): Promise<readonly Project[]>;

  abstract getSettingsList(): Promise<readonly ProjectSetting[]>;

  abstract updateProjectSetting(
    project: Project,
    setting: ProjectSetting
  ): Promise<void>;

  async getProject(id: string): Promise<Project> {
    let project = await this.findProject(id);

    if (project) {
      return project;
    } else {
      throw new NotFound(`Could not find project "${id}."`);
    }
  }

  abstract call(
    method: Method,
    args: Record<string, unknown>
  ): Promise<Record<string, unknown>>;

  protected abstract findProject(id: string): Promise<Project | null>;
}
